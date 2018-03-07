/* eslint-env mocha */

import * as assert from 'assert'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as uuid from 'uuid'

chai.use(chaiAsPromised)
const expect = chai.expect

import { testHelpers } from './testHelpers'

const { balanceByFlavorId, client, createAccount, createAsset, createRefData } = testHelpers

describe('Transaction', () => {
  describe('Issuance', () => {
    let goldAlias: string
    let silverAlias: string
    let aliceAlias: string
    let bobAlias: string
    let actionTags: any

    before(async () => {
      goldAlias = (await createAsset('gold')).alias
      silverAlias = (await createAsset('silver')).alias
      aliceAlias = (await createAccount('alice')).alias
      bobAlias = (await createAccount('bob')).alias
      actionTags = { 'actingAccount': uuid.v4().toString() }
      await client.transactions.transact(builder => {
        builder.issue({
          assetAlias: goldAlias,
          amount: 100,
          destinationAccountAlias: aliceAlias,
          actionTags,
        })
        builder.issue({
          assetAlias: silverAlias,
          amount: 200,
          destinationAccountAlias: bobAlias,
        })
      })
    })

    it('issues 100 units of gold to alice', async () => {
      const balance = await balanceByFlavorId(
        client.tokens.sum({ filter: `account_id='${aliceAlias}'`, groupBy: ['flavor_id'] }).page()
      )
      assert.deepEqual(balance, { [goldAlias]: 100 })
    })

    it('adds tags to issue action', async () => {
      const items: any[] = []
      await client.actions.list({ filter: `tags.actingAccount='${actionTags.actingAccount}'`})
        .all(item => items.push(item))
      assert.deepEqual(items[0].tags, actionTags)
      assert.deepEqual(items[0].type, 'issue')
    })

    it('issues 200 units of silver to bob', async () => {
      const balance = await balanceByFlavorId(
        client.tokens.sum({ filter: `account_id='${bobAlias}'`, groupBy: ['flavor_id'] }).page()
      )
      assert.deepEqual(balance, { [silverAlias]: 200 })
    })
  })

  describe('Transfer', () => {
    let goldAlias: string
    let silverAlias: string
    let aliceAlias: string
    let bobAlias: string
    let actionTags: any

    before(async () => {
      goldAlias = (await createAsset('gold')).alias
      silverAlias = (await createAsset('silver')).alias
      aliceAlias = (await createAccount('alice')).alias
      bobAlias = (await createAccount('bob')).alias
      actionTags = { 'actingAccount': uuid.v4().toString() }
      await client.transactions.transact(builder => {
        builder.issue({
          assetAlias: goldAlias,
          amount: 200,
          destinationAccountAlias: aliceAlias,
        })
        builder.transfer({
          assetAlias: goldAlias,
          amount: 100,
          sourceAccountId: aliceAlias,
          destinationAccountAlias: bobAlias,
          actionTags,
        })
      })
    })

    it('adds tags to transfer action', async () => {
      const items: any[] = []
      await client.actions.list({ filter: `tags.actingAccount='${actionTags.actingAccount}'`})
        .all(item => items.push(item))
      assert.deepEqual(items[0].tags, actionTags)
      assert.deepEqual(items[0].type, 'transfer')
    })

    it('transfers 100 units of gold to bob', async () => {
      const balance = await balanceByFlavorId(
        client.tokens.sum({ filter: `account_id='${bobAlias}'`, groupBy: ['flavor_id'] }).page()
      )
      assert.deepEqual(balance, { [goldAlias]: 100 })
    })
  })

  describe('Retire', () => {
    let goldAlias: string
    let aliceAlias: string
    let actionTags: any

    before(async () => {
      goldAlias = (await createAsset('gold')).alias
      aliceAlias = (await createAccount('alice')).alias
      actionTags = { 'actingAccount': uuid.v4().toString() }
      await client.transactions.transact(builder => {
        builder.issue({
          assetAlias: goldAlias,
          amount: 200,
          destinationAccountAlias: aliceAlias,
        })
        builder.retire({
          assetAlias: goldAlias,
          amount: 100,
          sourceAccountId: aliceAlias,
          actionTags,
        })
      })
    })

    it('adds tags to retire action', async () => {
      const items: any[] = []
      await client.actions.list({ filter: `tags.actingAccount='${actionTags.actingAccount}'`})
        .all(item => items.push(item))
      assert.deepEqual(items[0].tags, actionTags)
      assert.deepEqual(items[0].type, 'retire')
    })

    it('retires 100 units of gold from alice', async () => {
      const balance = await balanceByFlavorId(
        client.tokens.sum({ filter: `account_id='${aliceAlias}'`, groupBy: ['flavor_id'] }).page()
      )
      assert.deepEqual(balance, { [goldAlias]: 100 })
    })
  })

  it('fails to build transactions for non-existent assets', () => {
    return expect(
      client.transactions.transact(builder => {
        builder.issue({
          assetAlias: 'unobtanium',
          amount: 100,
        })
      })
    ).to.be.rejectedWith('SEQ706')
  })

  describe('queryAll (deprecated)', () => {
    it('success example', async () => {
      const asset = await createAsset()
      const account = await createAccount()
      const tx = await client.transactions.transact(builder => {
        builder.issue({
          assetAlias: asset.alias,
          amount: 1,
          destinationAccountAlias: account.alias,
        })
      })
      const created = tx.id
      const result = await client.transactions.queryAll({})
      expect(result.map((x: any) => x.id)).to.include(created)
    })
  })

  describe('List.page query', () => {
    it('should list all transactions', async () => {
      // TODO(dan) test this more extensively
      const page = await client.transactions.list({}).page()
      expect(page.items.length).to.equal(19)
    })
  })

  describe('List.all query', () => {
    // TODO(dan) test this more extensively
    it('should iterate over all transactions', async () => {
      const items: any[] = []
      await client.transactions.list({}).all(item => items.push(item))
      expect(items.length).to.equal(19)
    })
  })

  describe('Builder function errors', () => {
    it('rejects via promise', () =>
      expect(
        client.transactions.transact(() => {
          throw new Error('test error')
        })
      ).to.be.rejectedWith('test error'))
  })

  // These just test that the callback is engaged correctly. Behavior is
  // tested in the promises test.
  describe('Callback support', () => {
    it('transact', done => {
      client.transactions.transact(
        () => {
          return
        }, // intentionally blank
        () => done() // intentionally ignore errors
      )
    })

    it('query', done => {
      client.transactions.queryPage({}, done)
    })

    it('queryAll', done => {
      client.transactions.queryAll({}, done)
    })
  })
})

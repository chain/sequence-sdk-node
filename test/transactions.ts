/* eslint-env mocha */

import * as assert from 'assert'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'

chai.use(chaiAsPromised)
const expect = chai.expect

import { testHelpers } from './testHelpers'

const { balanceByAssetAlias, client, createAccount, createAsset } = testHelpers

describe('Transaction', () => {
  describe('Issuance', () => {
    let goldAlias: string
    let silverAlias: string
    let aliceAlias: string
    let bobAlias: string

    before(async () => {
      goldAlias = (await createAsset('gold')).alias
      silverAlias = (await createAsset('silver')).alias
      aliceAlias = (await createAccount('alice')).alias
      bobAlias = (await createAccount('bob')).alias
      await client.transactions.transact(builder => {
        builder.issue({
          assetAlias: goldAlias,
          amount: 100,
          destinationAccountAlias: aliceAlias,
        })
        builder.issue({
          assetAlias: silverAlias,
          amount: 200,
          destinationAccountAlias: bobAlias,
        })
      })
    })

    it('issues 100 units of gold to alice', async () => {
      const balance = await balanceByAssetAlias(
        client.balances.queryPage({ filter: `account_alias='${aliceAlias}'` })
      )
      assert.deepEqual(balance, { [goldAlias]: 100 })
    })

    it('issues 200 units of silver to bob', async () => {
      const balance = await balanceByAssetAlias(
        client.balances.queryPage({ filter: `account_alias='${bobAlias}'` })
      )
      assert.deepEqual(balance, { [silverAlias]: 200 })
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
    ).to.be.rejectedWith('CH002')
  })

  describe('queryAll', () => {
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

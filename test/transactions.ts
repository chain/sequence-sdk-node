/* eslint-env mocha */

import * as assert from 'assert'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as uuid from 'uuid'

chai.use(chaiAsPromised)
const expect = chai.expect

import { testHelpers } from './testHelpers'

const {
  balanceByFlavorId,
  client,
  createAccount,
  createFlavor,
  createRefData,
} = testHelpers

describe('Transaction', () => {
  describe('Issuance', () => {
    it('issues tokens to accounts', async () => {
      const gold = await createFlavor('gold')
      const alice = await createAccount('alice')
      const silver = await createFlavor('silver')
      const bob = await createAccount('bob')

      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 100,
          destinationAccountId: alice.id,
        })
        builder.issue({
          flavorId: silver.id,
          amount: 200,
          destinationAccountId: bob.id,
        })
      })

      let balance = await balanceByFlavorId(
        client.tokens
          .sum({ filter: `account_id='${alice.id}'`, groupBy: ['flavor_id'] })
          .page()
      )
      assert.deepEqual(balance, { [gold.id]: 100 })
      balance = await balanceByFlavorId(
        client.tokens
          .sum({ filter: `account_id='${bob.id}'`, groupBy: ['flavor_id'] })
          .page()
      )
      assert.deepEqual(balance, { [silver.id]: 200 })
    })

    it('adds tags to issue action', async () => {
      const gold = await createFlavor('gold')
      const alice = await createAccount('alice')
      const actionTags = { actingAccount: uuid.v4().toString() }

      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 100,
          destinationAccountId: alice.id,
          actionTags,
        })
      })

      const items = await testHelpers.asyncAll(client.actions
        .list({ filter: `tags.actingAccount='${actionTags.actingAccount}'` })
        .all())
      assert.deepEqual(items[0].tags, actionTags)
      assert.deepEqual(items[0].type, 'issue')
    })
  })

  describe('Transfer', () => {
    it('transfers tokens to account', async () => {
      const gold = await createFlavor('gold')
      const alice = await createAccount('alice')
      const bob = await createAccount('bob')

      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 200,
          destinationAccountId: alice.id,
        })
        builder.transfer({
          flavorId: gold.id,
          amount: 100,
          sourceAccountId: alice.id,
          destinationAccountId: bob.id,
        })
      })

      const balance = await balanceByFlavorId(
        client.tokens
          .sum({ filter: `account_id='${bob.id}'`, groupBy: ['flavor_id'] })
          .page()
      )
      assert.deepEqual(balance, { [gold.id]: 100 })
    })

    it('adds tags to transfer action', async () => {
      const gold = await createFlavor('gold')
      const alice = await createAccount('alice')
      const bob = await createAccount('bob')
      const actionTags = { actingAccount: uuid.v4().toString() }

      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 200,
          destinationAccountId: alice.id,
        })
        builder.transfer({
          flavorId: gold.id,
          amount: 100,
          sourceAccountId: alice.id,
          destinationAccountId: bob.id,
          actionTags,
        })
      })

      const items = await testHelpers.asyncAll(client.actions
        .list({ filter: `tags.actingAccount='${actionTags.actingAccount}'` })
        .all())
      assert.deepEqual(items[0].tags, actionTags)
      assert.deepEqual(items[0].type, 'transfer')
    })
  })

  describe('Retire', () => {
    it('retires tokens from account', async () => {
      const gold = await createFlavor('gold')
      const alice = await createAccount('alice')

      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 200,
          destinationAccountId: alice.id,
        })
        builder.retire({
          flavorId: gold.id,
          amount: 100,
          sourceAccountId: alice.id,
        })
      })

      const balance = await balanceByFlavorId(
        client.tokens
          .sum({ filter: `account_id='${alice.id}'`, groupBy: ['flavor_id'] })
          .page()
      )
      assert.deepEqual(balance, { [gold.id]: 100 })
    })

    it('adds tags to retire action', async () => {
      const gold = await createFlavor('gold')
      const alice = await createAccount('alice')
      const actionTags = { actingAccount: uuid.v4().toString() }

      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 200,
          destinationAccountId: alice.id,
        })
        builder.retire({
          flavorId: gold.id,
          amount: 100,
          sourceAccountId: alice.id,
          actionTags,
        })
      })

      const items = await testHelpers.asyncAll(client.actions
        .list({ filter: `tags.actingAccount='${actionTags.actingAccount}'` })
        .all())
      assert.deepEqual(items[0].tags, actionTags)
      assert.deepEqual(items[0].type, 'retire')
    })
  })

  it('fails to build transactions for non-existent flavors', () => {
    return expect(
      client.transactions.transact(builder => {
        builder.issue({
          flavorId: 'unobtainium',
          amount: 100,
          destinationAccountId: 'unobtainable',
        })
      })
    ).to.be.rejectedWith('SEQ706')
  })

  describe('queryAll (deprecated)', () => {
    it('success example', async () => {
      const flavor = await createFlavor()
      const account = await createAccount()
      const tx = await client.transactions.transact(builder => {
        builder.issue({
          flavorId: flavor.id,
          amount: 1,
          destinationAccountId: account.id,
        })
      })
      const created = tx.id
      const result = await client.transactions.queryAll({})
      expect(result.map((x: any) => x.id)).to.include(created)
    })
  })

  describe('List.page query', () => {
    it('fetches a second page with a cursor', async () => {
      await client.devUtils.reset()
      const flavor = await createFlavor()
      const account = await createAccount()
      for (let i = 0; i < 3; i++) {
        await client.transactions.transact(b => {
          b.issue({
            flavorId: flavor.id,
            amount: 10,
            destinationAccountId: account.id,
          })
        })
      }

      const page = await client.transactions.list({}).page({ size: 1 })
      assert.equal(page.items.length, 1)

      const page2 = await client.transactions
        .list()
        .page({ cursor: page.cursor })
      assert.equal(page2.items.length, 1)
      assert.equal(page2.lastPage, false)
    })
  })

  describe('List.all query', () => {
    it('processes all items', async () => {
      await client.devUtils.reset()
      const flavor = await createFlavor()
      const account = await createAccount()
      for (let i = 0; i < 2; i++) {
        await client.transactions.transact(b => {
          b.issue({
            flavorId: flavor.id,
            amount: 10,
            destinationAccountId: account.id,
          })
        })
      }

      const items = await testHelpers.asyncAll(client.transactions.list().all())

      assert.equal(items.length, 2)
    })

    it('should list transactions based on filter using camelCase', async () => {
      const gold = await createFlavor('gold')
      const alice = await createAccount('alice')
      const bob = await createAccount('bob')
      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 200,
          destinationAccountId: alice.id,
        })
      })
      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 200,
          destinationAccountId: bob.id,
        })
      })

      const items = await testHelpers.asyncAll(client.transactions
        .list({
          filter: 'actions(destinationAccountId=$1)',
          filterParams: [alice.id],
        })
        .all())

      expect(items.length).to.equal(1)
    })

    it('filters transactions in snake_case (deprecated)', async () => {
      const gold = await createFlavor('gold')
      const alice = await createAccount('alice')
      const bob = await createAccount('bob')
      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 200,
          destinationAccountId: alice.id,
        })
      })
      await client.transactions.transact(builder => {
        builder.issue({
          flavorId: gold.id,
          amount: 200,
          destinationAccountId: bob.id,
        })
      })

      const items = await testHelpers.asyncAll(client.transactions
        .list({
          filter: 'actions(destination_account_id=$1)',
          filterParams: [alice.id],
        })
        .all())

      expect(items.length).to.equal(1)
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

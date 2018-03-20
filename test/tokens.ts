import * as assert from 'assert'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const expect = chai.expect
import 'mocha'
import * as uuid from 'uuid'

import { TransactionBuilder } from '../src/api/transactions'
import { Page } from '../src/page'
import { testHelpers } from './testHelpers'

const {
  client,
  createAccount,
  createFlavor,
  transact,
} = testHelpers

describe('Token queries', () => {
  describe('List.page query', () => {
    it('filters by account, lists tokens in account', async () => {
      const flavor1 = await createFlavor()
      const flavor2 = await createFlavor()
      const account1 = await createAccount()
      const account2 = await createAccount()
      await transact((b: TransactionBuilder) => {
        b.issue({
          flavorId: flavor1.id,
          amount: 10,
          destinationAccountId: account1.id,
        })
      })
      await transact((b: TransactionBuilder) => {
        b.transfer({
          flavorId: flavor1.id,
          amount: 5,
          sourceAccountId: account1.id,
          destinationAccountId: account2.id,
        })
      })
      await transact((b: TransactionBuilder) => {
        b.issue({
          flavorId: flavor2.id,
          amount: 2,
          destinationAccountId: account2.id,
        })
      })

      const page = await client.tokens
        .list({
          filter: 'account_id=$1',
          filterParams: [account2.id],
        })
        .page()

      expect(page.items.length).to.equal(2)
      page.items.forEach((item: any) => {
        expect(item.accountId).to.equal(account2.id)
      })
    })

    it('filters by token tags', async () => {
      const flavor = await createFlavor()
      const account = await createAccount()
      const tokenTags = { test: uuid.v4().toString() }
      await transact((b: TransactionBuilder) => {
        b.issue({
          flavorId: flavor.id,
          amount: 10,
          destinationAccountId: account.id,
          tokenTags,
        })
      })
      await transact((b: TransactionBuilder) => {
        b.issue({
          flavorId: flavor.id,
          amount: 2,
          destinationAccountId: account.id,
        })
      })

      const page = await client.tokens
        .list({
          filter: 'tags.test=$1',
          filterParams: [tokenTags.test],
        })
        .page()

      expect(page.items.length).to.equal(1)
    })
  })

  describe('List.all query', () => {
    it('processes all items', async () => {
      const flavor1 = await createFlavor()
      const flavor2 = await createFlavor()
      const account = await createAccount()
      const tokenTags = { test: uuid.v4().toString() }
      for (let i = 0; i < 3; i++) {
        await transact((b: TransactionBuilder) => {
          b.issue({
            flavorId: flavor1.id,
            amount: 10,
            destinationAccountId: account.id,
            tokenTags,
          })
          b.issue({
            flavorId: flavor2.id,
            amount: 10,
            destinationAccountId: account.id,
            tokenTags,
          })
        })
      }

      const items = await testHelpers.asyncAll(client.tokens
        .list({
          filter: 'tags.test=$1',
          filterParams: [tokenTags.test],
        })
        .all())

      assert.equal(items.length, 2)
      expect(items[0].amount).to.equal(30)
      expect(items[1].amount).to.equal(30)
    })
  })

  describe('Sum.page query', () => {
    it('fetches a second page with a cursor', async () => {
      const flavor = await createFlavor()
      const account1 = await createAccount()
      const account2 = await createAccount()
      const tokenTags = { test: uuid.v4().toString() }
      for (let i = 0; i < 3; i++) {
        await transact((b: TransactionBuilder) => {
          b.issue({
            flavorId: flavor.id,
            amount: 10,
            destinationAccountId: account1.id,
            tokenTags,
          })
          b.issue({
            flavorId: flavor.id,
            amount: 10,
            destinationAccountId: account2.id,
            tokenTags,
          })
        })
      }

      const page = await client.tokens
        .sum({
          filter: 'tags.test=$1',
          filterParams: [tokenTags.test],
          groupBy: ['account_id'],
        })
        .page({ size: 1 })

      expect(page.items[0].amount).to.equal(30)
      assert.equal(page.items.length, 1)

      const page2 = await client.tokens.sum().page({ cursor: page.cursor })
      expect(page2.items[0].amount).to.equal(30)
      assert.equal(page2.items.length, 1)
    })
  })

  describe('Sum.all query', () => {
    it('processes all items', async () => {
      const flavor = await createFlavor()
      const account = await createAccount()
      const tokenTags = { test: uuid.v4().toString() }
      for (let i = 0; i < 3; i++) {
        await transact((b: TransactionBuilder) => {
          b.issue({
            flavorId: flavor.id,
            amount: 10,
            destinationAccountId: account.id,
            tokenTags,
          })
        })
      }

      const sums = await testHelpers.asyncAll(client.tokens
        .sum({
          filter: 'tags.test=$1',
          filterParams: [tokenTags.test],
          groupBy: ['account_id'],
        })
        .all())

      assert.equal(sums.length, 1)
      expect(sums[0].amount).to.equal(30)
    })
  })
})

describe('Token spending', () => {
  it('can spend tokens by tag', async () => {
    const flavor1 = await createFlavor()
    const account1 = await createAccount()

    await transact((b: TransactionBuilder) => {
      b.issue({
        flavorId: flavor1.id,
        amount: 3,
        destinationAccountId: account1.id,
        tokenTags: { key: 'a' },
      })
    })
    await transact((b: TransactionBuilder) => {
      b.issue({
        flavorId: flavor1.id,
        amount: 7,
        destinationAccountId: account1.id,
        tokenTags: { key: 'a' },
      })
    })
    await transact((b: TransactionBuilder) => {
      b.transfer({
        flavorId: flavor1.id,
        amount: 5,
        sourceAccountId: account1.id,
        destinationAccountId: account1.id,
        filter: 'tags.key=$1',
        filterParams: ['a'],
        tokenTags: { key: 'b' },
      })
    })
    await transact((b: TransactionBuilder) => {
      b.retire({
        flavorId: flavor1.id,
        amount: 5,
        sourceAccountId: account1.id,
        filter: "tags.key='a'",
      })
    })

    const page = await client.tokens
      .list({
        filter: 'account_id=$1',
        filterParams: [account1.id],
      })
      .page()
    page.items.forEach((item: any) => {
      expect(item.tags.key).not.to.equal('a')
      expect(item.tags.key).to.equal('b')
    })
  })
})

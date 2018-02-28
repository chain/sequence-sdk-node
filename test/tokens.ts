import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const expect = chai.expect
import 'mocha'

import { TransactionBuilder } from '../src/api/transactions'
import { Page } from '../src/page'
import { testHelpers } from './testHelpers'

const {
  client,
  createAccount,
  createFlavor,
  createRefData,
  transact,
} = testHelpers

describe('Token queries', () => {
  let flavor1: { id: string }
  let flavor2: { id: string }
  let account1: { id: string }
  let account2: { id: string }
  let tokenTags: { [key: string]: string }

  before(async () => {
    flavor1 = await createFlavor()
    flavor2 = await createFlavor()
    account1 = await createAccount()
    account2 = await createAccount()
    tokenTags = await createRefData()
    await transact((b: TransactionBuilder) => {
      b.issue({
        flavorId: flavor1.id,
        amount: 10,
        destinationAccountId: account1.id,
        tokenTags,
      })
    })
    await transact((b: TransactionBuilder) => {
      b.issue({
        flavorId: flavor2.id,
        amount: 2,
        destinationAccountId: account2.id,
        tokenTags,
      })
    })
    await transact((b: TransactionBuilder) => {
      b.transfer({
        flavorId: flavor1.id,
        amount: 5,
        sourceAccountId: account1.id,
        destinationAccountId: account2.id,
        tokenTags,
      })
    })
  })

  describe('List.page query', () => {
    it('should list all tokens for an account', async () => {
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

    it('should filter by token tags', async () => {
      const page = await client.tokens
        .list({
          filter: 'tags.test=$1',
          filterParams: [tokenTags['test']],
        })
        .page()
      expect(page.items.length).to.equal(3)
    })
  })

  describe('List.all query', () => {
    // TODO(dan) test this more extensively
    it('should iterate over all tokens', async () => {
      const items: any[] = []
      await client.tokens
        .list({
          filter: 'account_id=$1',
          filterParams: [account2.id],
        })
        .all(item => items.push(item))
      expect(items.length).to.equal(2)
      items.forEach((item: any) => {
        expect(item.accountId).to.equal(account2.id)
      })
    })
  })

  describe('Sum.page query', () => {
    it('should have two items with the correct amounts', async () => {
      const page = await client.tokens
        .sum({
          groupBy: ['account_id'],
        })
        .page()
      expect(
        page.items.find((token: any) => token.accountId === account1.id).amount
      ).to.equal(5)
      expect(
        page.items.find((token: any) => token.accountId === account2.id).amount
      ).to.equal(7)
    })
  })

  describe('Sum.all query', () => {
    it('should iterate over all sums', async () => {
      const sums: any[] = []
      await client.tokens
        .sum({
          groupBy: ['account_id'],
        })
        .all(sum => sums.push(sum))
      expect(sums.length).to.equal(8)
      expect(
        sums.find((sum: any) => sum.accountId === account1.id).amount
      ).to.equal(5)
      expect(
        sums.find((sum: any) => sum.accountId === account2.id).amount
      ).to.equal(7)
    })
  })

  // This just tests that the callbacks are engaged correctly.
  describe('Callback support', () => {
    it('list query', done => {
      client.tokens.list({}).page({}, done)
    })

    it('sum query', done => {
      client.tokens.sum({}).page({}, done)
    })
  })
})

describe('Token spending', () => {
  let flavor1: { id: string }
  let flavor2: { id: string }
  let account1: { id: string }
  let account2: { id: string }
  let tokenTags: { [key: string]: string }

  before(async () => {
    flavor1 = await createFlavor()
    account1 = await createAccount()
  })

  it('can spend tokens by tag', async () => {
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

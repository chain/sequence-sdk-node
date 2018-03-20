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

describe('Action', () => {
  let flavor1: { id: string }
  let flavor2: { id: string }
  let account1: { id: string }
  let account2: { id: string }
  let refData: { [key: string]: string }

  before(async () => {
    flavor1 = await createFlavor()
    flavor2 = await createFlavor()
    account1 = await createAccount()
    account2 = await createAccount()
    refData = await createRefData()
    await transact((b: TransactionBuilder) => {
      b.issue({
        flavorId: flavor1.id,
        amount: 10,
        destinationAccountId: account1.id,
        referenceData: refData,
      })
    })
    await transact((b: TransactionBuilder) => {
      b.issue({
        flavorId: flavor2.id,
        amount: 2,
        destinationAccountId: account2.id,
        referenceData: refData,
      })
    })
    await transact((b: TransactionBuilder) => {
      b.transfer({
        flavorId: flavor1.id,
        amount: 5,
        sourceAccountId: account1.id,
        destinationAccountId: account2.id,
        referenceData: refData,
      })
    })
  })

  describe('List query (deprecated)', () => {
    it('should list three actions', async () => {
      const page = await client.actions.list({
        filter: 'reference_data.test=$1',
        filterParams: [refData.test],
      })
      expect(page.items.length).to.equal(3)
    })
    it('should respect the size argument', async () => {
      const page = await client.actions.list({
        filter: 'reference_data.test=$1',
        filterParams: [refData.test],
        pageSize: 2,
      })
      expect(page.items.length).to.equal(2)
    })
  })

  describe('List.page query', () => {
    it('should list three actions', async () => {
      const page = await client.actions
        .list({
          filter: 'reference_data.test=$1',
          filterParams: [refData.test],
        })
        .page()
      expect(page.items.length).to.equal(3)
    })
    it('should respect the size argument', async () => {
      const page = await client.actions
        .list({
          filter: 'reference_data.test=$1',
          filterParams: [refData.test],
        })
        .page({ size: 2 })
      expect(page.items.length).to.equal(2)
    })
  })

  describe('List.all query', () => {
    it('should consume three items', async () => {
      const processed = await testHelpers.asyncAll(client.actions
        .list({
          filter: 'reference_data.test=$1',
          filterParams: [refData.test],
        })
        .all())
      expect(processed.length).to.equal(3)
    })
  })

  describe('List.all no-sugar query', () => {
    it('should consume three items', async () => {
      const all = client.actions
        .list({
          filter: 'reference_data.test=$1',
          filterParams: [refData.test],
        })
        .all() as AsyncIterator<any>
      // NOTE(kr): the type assertion above can go away
      // when we remove the old stuff for v2.
      const processed: any[] = []
      while (true) {
        const { value, done } = await all.next()
        if (done) { break }
        processed.push(value)
      }
      expect(processed.length).to.equal(3)
    })
  })

  describe('List.all legacy query', () => {
    it('should consume three items', async () => {
      const processed: any[] = []
      await client.actions
        .list({
          filter: 'reference_data.test=$1',
          filterParams: [refData.test],
        })
        .all(action => {
          processed.push(action)
        })
      expect(processed.length).to.equal(3)
    })
  })

  describe('Sum query with groupBy (deprecated)', () => {
    it('should have two items', async () => {
      const page = await client.actions.sum({
        filter: 'reference_data.test=$1',
        filterParams: [refData.test],
        groupBy: ['type'],
      })
      expect(page.items.find((b: any) => b.type === 'issue').amount).to.equal(
        12
      )
      expect(
        page.items.find((b: any) => b.type === 'transfer').amount
      ).to.equal(5)
    })
    it('should respect the size argument', async () => {
      const page = await client.actions.sum({
        filter: 'reference_data.test=$1',
        filterParams: [refData.test],
        groupBy: ['type'],
        pageSize: 1,
      })
      expect(page.items.length).to.equal(1)
    })
  })

  describe('Sum.page query with groupBy', () => {
    it('should have two items', async () => {
      const page = await client.actions
        .sum({
          filter: 'reference_data.test=$1',
          filterParams: [refData.test],
          groupBy: ['type'],
        })
        .page()
      expect(page.items.find((b: any) => b.type === 'issue').amount).to.equal(
        12
      )
      expect(
        page.items.find((b: any) => b.type === 'transfer').amount
      ).to.equal(5)
    })
    it('should respect the size argument', async () => {
      const page = await client.actions
        .sum({
          filter: 'reference_data.test=$1',
          filterParams: [refData.test],
          groupBy: ['type'],
        })
        .page({ size: 1 })
      expect(page.items.length).to.equal(1)
    })
  })

  describe('Sum.all query with groupBy', () => {
    it('should have two items', async () => {
      const sums = await testHelpers.asyncAll(client.actions
        .sum({
          filter: 'reference_data.test=$1',
          filterParams: [refData.test],
          groupBy: ['type'],
        })
        .all())
      expect(sums.find((b: any) => b.type === 'issue').amount).to.equal(12)
      expect(sums.find((b: any) => b.type === 'transfer').amount).to.equal(5)
    })
  })

  describe('Sum.all legacy query with groupBy', () => {
    it('should have two items', async () => {
      const sums: any[] = []
      await client.actions
        .sum({
          filter: 'reference_data.test=$1',
          filterParams: [refData.test],
          groupBy: ['type'],
        })
        .all(sum => sums.push(sum))
      expect(sums.find((b: any) => b.type === 'issue').amount).to.equal(12)
      expect(sums.find((b: any) => b.type === 'transfer').amount).to.equal(5)
    })
  })
})

describe('Cursor support for actions', () => {
  it('should work on list query', async () => {
    const page = await client.actions.list({}).page({ size: 1 })
    expect(page.cursor).not.to.equal('')
    expect(page.items.length).to.equal(1)
    const secondPage = await client.actions
      .list({})
      .page({ cursor: page.cursor })
    expect(secondPage.cursor).not.to.equal('')
    expect(secondPage.items.length).to.equal(1)
    expect(page.items[0].amount).not.to.equal(secondPage.items[0].amount)
  })

  it('should work on sum query', async () => {
    const page = await client.actions.sum({}).page({ size: 1 })
    expect(page.cursor).not.to.equal('')
    expect(page.items.length).to.equal(1)
    const secondPage = await client.actions
      .sum({})
      .page({ cursor: page.cursor })
    expect(secondPage.cursor).not.to.equal('')
    expect(secondPage.items.length).to.equal(0)
  })
})

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
  createAsset,
  createRefData,
  transact,
} = testHelpers

describe('Action', () => {
  let asset1: { id: string; alias: string }
  let asset2: { id: string; alias: string }
  let account1: { id: string; alias: string }
  let account2: { id: string; alias: string }
  let refData: { [key: string]: string }

  before(async () => {
    asset1 = await createAsset()
    asset2 = await createAsset()
    account1 = await createAccount()
    account2 = await createAccount()
    refData = await createRefData()
    await transact((b: TransactionBuilder) => {
      b.issue({
        assetId: asset1.id,
        amount: 10,
        destinationAccountId: account1.id,
        referenceData: refData,
      })
    })
    await transact((b: TransactionBuilder) => {
      b.issue({
        assetId: asset2.id,
        amount: 2,
        destinationAccountId: account2.id,
        referenceData: refData,
      })
    })
    await transact((b: TransactionBuilder) => {
      b.transfer({
        assetId: asset1.id,
        amount: 5,
        sourceAccountId: account1.id,
        destinationAccountId: account2.id,
        referenceData: refData,
      })
    })
  })

  describe('List query', () => {
    it('should list three actions', async () => {
      const page = await client.actions.list({
        filter: 'reference_data.test=$1',
        filterParams: [refData['test']],
      })
      expect(page.items.length).to.equal(3)
    })
  })

  describe('Sum query with groupBy', () => {
    it('should have two items', async () => {
      const page = await client.actions.sum({
        filter: 'reference_data.test=$1',
        filterParams: [refData['test']],
        groupBy: ['type'],
      })
      expect(page.items.find((b: any) => b.type === 'issue').amount).to.equal(
        12
      )
      expect(
        page.items.find((b: any) => b.type === 'transfer').amount
      ).to.equal(5)
    })
  })

  // This just tests that the callbacks are engaged correctly.
  describe('Callback support', () => {
    it('list query', done => {
      client.actions.list({}, done)
    })

    it('sum query', done => {
      client.actions.sum({}, done)
    })
  })
})

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const expect = chai.expect
import 'mocha'

import { TransactionBuilder } from '../src/api/transactions'
import { Page } from '../src/page'
import { testHelpers } from './testHelpers'

const { client, createAccount, createAsset, transact } = testHelpers

describe('Balance', () => {
  let asset1: { id: string; alias: string }
  let asset2: { id: string; alias: string }
  let account: { id: string; alias: string }

  before(async () => {
    asset1 = await createAsset()
    asset2 = await createAsset()
    account = await createAccount()
    await transact((b: TransactionBuilder) => {
      b.issue({
        assetId: asset1.id,
        amount: 1,
        destinationAccountId: account.id,
      })
    })
    await transact((b: TransactionBuilder) => {
      b.issue({
        assetId: asset2.id,
        amount: 2,
        destinationAccountId: account.id,
      })
    })
  })

  describe('Query with filter', () => {
    it('simple example', async () => {
      const page = await client.balances.queryPage({
        filter: 'asset_id=$1',
        filterParams: [asset1.id],
        sumBy: ['asset_id'],
      })
      await expect(page.items[0].amount).to.equal(1)
    })
  })

  describe('queryAll', () => {
    it('simple example', async () => {
      const result = await client.balances.queryAll({
        filter: 'account_id=$1',
        filterParams: [account.id],
        sumBy: ['asset_id'],
      })
      expect(
        result.find((b: any) => b.sumBy.assetId === asset1.id).amount
      ).to.equal(1)
      expect(
        result.find((b: any) => b.sumBy.assetId === asset2.id).amount
      ).to.equal(2)
    })
  })

  describe('Callback support', () => {
    it('query', done => {
      client.balances.queryPage({}, done)
    })

    it('queryAll', done => {
      client.balances.queryAll({}, done)
    })
  })
})

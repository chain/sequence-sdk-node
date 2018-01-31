/* eslint-env mocha */

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
chai.use(chaiAsPromised)
const expect = chai.expect

import { testHelpers } from './testHelpers'

const { client, createAccount, createAsset, transact } = testHelpers

describe('Contract', () => {
  let asset: any
  let account1: any
  let account2: any
  let tx1: any
  let tx2: any

  before(async () => {
    asset = await createAsset()
    account1 = await createAccount()
    account2 = await createAccount()
    tx1 = await transact(b => {
      b.issue({
        assetId: asset.id,
        amount: 1,
        destinationAccountId: account1.id,
      })
    })
    tx2 = await transact(b => {
      b.issue({
        assetId: asset.id,
        amount: 1,
        destinationAccountId: account2.id,
      })
    })
  })

  describe('Query with filter', () => {
    it('simple example', async () => {
      const page = await client.contracts.queryPage({
        filter: 'account_id=$1',
        filterParams: [account1.id],
      })
      expect(page.items.map((c: any) => c.id)).to.include(tx1.contracts[0].id)
    })
  })

  describe('queryAll', () => {
    it('simple example', async () => {
      const result = await client.contracts.queryAll({
        filter: 'asset_id=$1',
        filterParams: [asset.id],
      })
      const ids = result.map((x: any) => x.id)

      expect(ids).to.include(tx1.contracts[0].id)
      expect(ids).to.include(tx2.contracts[0].id)
    })
  })

  describe('Callback support', () => {
    it('query', done => {
      client.contracts.queryPage({}, done)
    })

    it('queryAll', done => {
      client.contracts.queryAll({}, done)
    })
  })
})

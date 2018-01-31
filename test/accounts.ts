import * as assert from 'assert'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as uuid from 'uuid'

import { Page } from '../src/page'
import { testHelpers } from './testHelpers'

chai.use(chaiAsPromised)

const expect = chai.expect
const client = testHelpers.client

describe('Account', () => {
  describe('Single account creation', () => {
    it('successful', async () => {
      const key = await client.keys.create({ id: uuid.v4() })
      const accountId = uuid.v4()
      const resp = await client.accounts.create({
        id: accountId,
        keys: [key],
        quorum: 1,
      })
      return expect(resp.id).to.equal(accountId)
    })

    it('rejected due to missing key fields', () => {
      return expect(
        client.accounts.create({ id: 'david' } as any)
      ).to.be.rejectedWith('CH202')
    })
  })

  describe('Single account tags update', () => {
    it('successful', async () => {
      const key = await client.keys.create({ id: uuid.v4() })
      const accountId = uuid.v4()
      const account = await client.accounts.create({
        id: accountId,
        keys: [key],
        quorum: 1,
        tags: { x: 0 },
      })
      const account2 = await client.accounts.create({
        id: uuid.v4(),
        keys: [key],
        quorum: 1,
        tags: { y: 0 },
      })
      await client.accounts.updateTags({
        id: accountId,
        tags: { x: 1 },
      })
      const page = await client.accounts.queryPage({
        filter: `id='${accountId}'`,
      })
      assert.deepEqual(page.items[0].tags, { x: 1 })
    })

    it('rejected due to missing ID/Alias', () => {
      return expect(
        client.accounts.updateTags({
          // ID/Alias intentionally omitted
          tags: { x: 1 },
        })
      ).to.be.rejectedWith('CH051')
    })
  })

  describe('queryAll', () => {
    it('success example', async () => {
      const key = await client.keys.create({ id: uuid.v4() })
      const account = await client.accounts.create({
        keys: [key],
        quorum: 1,
      })
      const result = await client.accounts.queryAll()
      expect(result.map((x: any) => x.id)).to.include(account.id)
    })
  })

  // These just test that the callback is engaged correctly. Behavior is
  // tested in the promises test.
  describe('Callback support', () => {
    it('create', done => {
      client.accounts.create(
        {} as any, // intentionally blank
        () => done() // intentionally ignore errors
      )
    })

    it('updateTags', done => {
      client.accounts.updateTags(
        {}, // intentionally blank
        () => done() // intentionally ignore errors
      )
    })

    it('query', done => {
      client.accounts.queryPage({}, done)
    })

    it('', done => {
      client.accounts.queryAll({}, done)
    })
  })
})

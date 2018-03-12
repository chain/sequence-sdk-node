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
    it('with keys is successful', async () => {
      const key = await client.keys.create({ id: uuid.v4() })
      const accountId = uuid.v4()
      const resp = await client.accounts.create({
        id: accountId,
        keys: [key],
        quorum: 1,
      })
      expect(resp.id).to.equal(accountId)
    })

    it('with key IDs is successful', async () => {
      const id = uuid.v4()
      await client.keys.create({ id })
      const accountId = uuid.v4()
      const resp = await client.accounts.create({
        id: accountId,
        keyIds: [id],
        quorum: 1,
      })
      expect(resp.id).to.equal(accountId)
      expect(resp.keyIds[0]).to.equal(id)
    })

    it('with missing keys is rejected', () => {
      expect(client.accounts.create({ id: 'david' } as any)).to.be.rejectedWith(
        'SEQ202'
      )
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
      const page = await client.accounts
        .list({
          filter: `id='${accountId}'`,
        })
        .page()
      assert.deepEqual(page.items[0].tags, { x: 1 })
    })

    it('rejected due to missing ID/Alias', () => {
      return expect(
        client.accounts.updateTags({
          // ID/Alias intentionally omitted
          tags: { x: 1 },
        })
      ).to.be.rejectedWith('SEQ051')
    })
  })

  describe('List.page query', () => {
    it('should list all accounts', async () => {
      const page = await client.accounts.list({}).page()
      expect(page.items.length).to.equal(4)
    })

    it('should filter on account', async () => {
      const key = await client.keys.create({ id: uuid.v4() })
      const account = await client.accounts.create({
        keys: [key],
        quorum: 1,
      })
      const page = await client.accounts
        .list({
          filter: 'id=$1',
          filterParams: [account.id],
        })
        .page()
      expect(page.items.length).to.equal(1)
      expect(page.items[0].id).to.equal(account.id)
    })
  })

  describe('List.all query', () => {
    // TODO(dan) test this more extensively
    it('should iterate over all accounts', async () => {
      const items: any[] = []
      await client.accounts.list({}).all(item => items.push(item))
      expect(items.length).to.equal(5)
    })
  })

  describe('queryAll (deprecated)', () => {
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

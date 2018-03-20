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
const xFlavorId = `x-${uuid.v4()}`
const yFlavorId = `y-${uuid.v4()}`

let key: any

describe('Flavor', () => {
  before('set up API objects', async () => {
    // Key and flavor creation
    key = await client.keys.create({ id: uuid.v4() })
    await client.flavors.create({
      id: xFlavorId,
      keys: [key],
      quorum: 1,
      tags: { x: 0 },
    })
    await client.flavors.create({
      id: yFlavorId,
      keys: [key],
      quorum: 1,
      tags: { y: 0 },
    })
  })

  describe('Single flavor creation', async () => {
    it('with keys is successful', async () => {
      const resp = await client.flavors.create({
        id: `flavor-${uuid.v4()}`,
        keys: [key],
        quorum: 1,
      })
      return expect(resp.id).not.to.be.empty
    })

    it('with key IDs is successful', async () => {
      const resp = await client.flavors.create({
        id: `flavor-${uuid.v4()}`,
        keyIds: [key.id],
        quorum: 1,
      })
      expect(resp.keyIds[0]).to.equal(key.id)
      return expect(resp.id).not.to.be.empty
    })

    it('with missing keys is rejected', () => {
      return expect(
        client.flavors.create({ id: 'flavor' } as any)
      ).to.be.rejectedWith('SEQ202')
    })
  })

  describe('Single flavor tags update', () => {
    it('successful', async () => {
      await client.flavors.updateTags({
        id: xFlavorId,
        tags: { x: 1 },
      })
      const page = await client.flavors
        .list({
          filter: `id='${xFlavorId}'`,
        })
        .page()
      assert.deepEqual(page.items[0].tags, { x: 1 })
    })

    it('rejected due to missing ID', () => {
      return expect(
        client.flavors.updateTags({
          // ID intentionally omitted
          tags: { x: 1 },
        } as any)
      ).to.be.rejectedWith('SEQ051')
    })
  })

  describe('pagination', () => {
    it('fetches a second page with a cursor', async () => {
      const filterKey = uuid.v4()

      for (let i = 0; i < 6; i++) {
        await client.flavors.create({
          keys: [key],
          tags: {
            filter: filterKey,
          },
        })
      }

      const page = await client.flavors
        .list({
          filter: 'tags.filter = $1',
          filterParams: [filterKey],
        })
        .page({ size: 5 })
      assert.equal(page.items.length, 5)

      const page2 = await client.flavors.list().page({ cursor: page.cursor })
      assert.equal(page2.items.length, 1)
    })

    it('can process all items', async () => {
      const filterKey = uuid.v4()

      for (let i = 0; i < 101; i++) {
        await client.flavors.create({
          keys: [key],
          tags: {
            filter: filterKey,
          },
        })
      }

      const items = await testHelpers.asyncAll(client.flavors.list({
        filter: 'tags.filter = $1',
        filterParams: [filterKey],
      }).all())
      assert.equal(items.length, 101)
    })
  })

  // These just test that the callback is engaged correctly. Behavior is
  // tested in the promises test.
  describe('Callback support', () => {
    it('create', done => {
      client.flavors.create(
        {} as any, // intentionally blank
        () => done() // intentionally ignore errors
      )
    })

    it('updateTags', done => {
      client.flavors.updateTags(
        {} as any, // intentionally blank
        () => done() // intentionally ignore errors
      )
    })

    it('query', done => {
      client.flavors.list().page({}, done)
    })
  })
})

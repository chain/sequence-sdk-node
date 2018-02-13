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
    it('successful', async () => {
      const resp = await client.flavors.create({
        id: `flavor-${uuid.v4()}`,
        keys: [key],
        quorum: 1,
      })
      return expect(resp.id).not.to.be.empty
    })

    it('rejected due to missing key fields', () => {
      return expect(
        client.flavors.create({ id: 'flavor' } as any)
      ).to.be.rejectedWith('CH202')
    })
  })

  describe('Single flavor tags update', () => {
    it('successful', async () => {
      await client.flavors.updateTags({
        id: xFlavorId,
        tags: { x: 1 },
      })
      const page = await client.flavors.list({
        filter: `id='${xFlavorId}'`,
      })
      assert.deepEqual(page.items[0].tags, { x: 1 })
    })

    it('rejected due to missing ID', () => {
      return expect(
        client.flavors.updateTags({
          // ID intentionally omitted
          tags: { x: 1 },
        })
      ).to.be.rejectedWith('CH051')
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
      client.flavors.list({}, done)
    })
  })
})

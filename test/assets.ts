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
const xAssetAlias = `x-${uuid.v4()}`
const yAssetAlias = `y-${uuid.v4()}`

let key: any

describe('Asset', () => {
  before('set up API objects', async () => {
    // Key and asset creation
    key = await client.keys.create({ alias: uuid.v4() })
    await client.assets.create({
      alias: xAssetAlias,
      keys: [key],
      quorum: 1,
      tags: { x: 0 },
    })
    await client.assets.create({
      alias: yAssetAlias,
      keys: [key],
      quorum: 1,
      tags: { y: 0 },
    })
  })

  describe('Single asset creation', async () => {
    it('successful', async () => {
      const resp = await client.assets.create({
        alias: `asset-${uuid.v4()}`,
        keys: [key],
        quorum: 1,
      })
      return expect(resp.id).not.to.be.empty
    })

    it('rejected due to missing key fields', () => {
      return expect(
        client.assets.create({ alias: 'asset' } as any)
      ).to.be.rejectedWith('SEQ202')
    })
  })

  describe('Single asset tags update', () => {
    it('successful', async () => {
      await client.assets.updateTags({
        alias: xAssetAlias,
        tags: { x: 1 },
      })
      const page = await client.assets.queryPage({
        filter: `alias='${xAssetAlias}'`,
      })
      assert.deepEqual(page.items[0].tags, { x: 1 })
    })

    it('rejected due to missing ID/Alias', () => {
      return expect(
        client.assets.updateTags({
          // ID/Alias intentionally omitted
          tags: { x: 1 },
        })
      ).to.be.rejectedWith('SEQ051')
    })
  })

  describe('queryAll', () => {
    it('success example', async () => {
      const asset = await client.assets.create({
        keys: [key],
        quorum: 1,
      })
      const result = await client.assets.queryAll()
      expect(result.map((x: any) => x.id)).to.include(asset.id)
    })
  })

  // These just test that the callback is engaged correctly. Behavior is
  // tested in the promises test.
  describe('Callback support', () => {
    it('create', done => {
      client.assets.create(
        {} as any, // intentionally blank
        () => done() // intentionally ignore errors
      )
    })

    it('updateTags', done => {
      client.assets.updateTags(
        {} as any, // intentionally blank
        () => done() // intentionally ignore errors
      )
    })

    it('query', done => {
      client.assets.queryPage({}, done)
    })

    it('queryAll', done => {
      client.assets.queryAll({}, done)
    })
  })
})

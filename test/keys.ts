import * as assert from 'assert'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as uuid from 'uuid'
import sequence from '../src/index'

import { testHelpers } from './testHelpers'

chai.use(chaiAsPromised)

const client = testHelpers.client
const expect = chai.expect

describe('Key', () => {
  it('succesfully creates key without specified ID', async () => {
    const resp = await client.keys.create()
    return expect(resp).not.to.be.empty
  })

  it('succesfully creates key with specified ID', async () => {
    const id = uuid.v4()
    const resp = await client.keys.create({ id })
    return expect(resp.id).to.equal(id)
  })

  it('rejects key creation due to duplicate ID', async () => {
    const id = uuid.v4()
    const resp = await client.keys.create({ id })
    return expect(client.keys.create({ id })).to.be.rejectedWith('SEQ050')
  })

  describe('List.page query', () => {
    it('fetches a second page with a cursor', async () => {
      await client.devUtils.reset()
      for (let i = 0; i < 3; i++) {
        await client.keys.create()
      }

      const page = await client.keys.list().page({ size: 1 })
      assert.equal(page.items.length, 1)

      const page2 = await client.keys.list().page({ cursor: page.cursor })
      assert.equal(page2.items.length, 1)
      assert.equal(page2.lastPage, false)
    })
  })

  describe('List.all query', () => {
    it('processes all items', async () => {
      await client.devUtils.reset()
      for (let i = 0; i < 2; i++) {
        await client.keys.create()
      }

      const items = await testHelpers.asyncAll(client.keys.list().all())

      assert.equal(items.length, 2)
    })
  })
})

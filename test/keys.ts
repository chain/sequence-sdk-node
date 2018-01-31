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
    return expect(client.keys.create({ id })).to.be.rejectedWith('CH050')
  })

  it('returns key in list after key creation', async () => {
    const id = uuid.v4()
    const key = await client.keys.create({ id })
    const resp = await client.keys.queryPage({})
    return expect(resp.items.map((item: any) => item.id)).to.contain(id)
  })

  describe('queryAll', () => {
    it('success example', async () => {
      const id = uuid.v4()
      await client.keys.create({ id })
      const res = await client.keys.queryAll({})
      expect(res.map((r: any) => r.id)).to.include(id)
    })
  })

  // These just test that the callback is engaged correctly. Behavior is
  // tested in the promises test.
  describe('Callback style', () => {
    it('create', done => {
      client.keys.create(
        {}, // intentionally blank
        () => done() // intentionally ignore errors
      )
    })

    it('query', done => {
      client.keys.queryPage({}, done)
    })

    it('queryAll', done => {
      client.keys.queryAll({}, done)
    })
  })
})

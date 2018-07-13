/* eslint-env mocha */

import * as assert from 'assert'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as uuid from 'uuid'

chai.use(chaiAsPromised)
const expect = chai.expect

import { testHelpers } from './testHelpers'

const { client, createAccount, createFlavor } = testHelpers

describe('Index', () => {
  it('creates an action index', async () => {
    const uuidCreated = uuid.v4()

    const index = await client.indexes.create({
      type: 'action',
      id: `actionIndex-${uuidCreated}`,
      filter: `tags.type-${uuidCreated}=$1`,
    })
    expect(index.type).to.equal('action')
  })

  it('creates a token index', async () => {
    const uuidCreated = uuid.v4()

    const index = await client.indexes.create({
      type: 'token',
      id: `tokenIndex-${uuidCreated}`,
      filter: `tags.type-${uuidCreated}=$1`,
      groupBy: ["flavorId"],
    })
    expect(index.type).to.equal('token')
  })

  it('deletes index by id', async () => {
    const uuidDeleted = uuid.v4()

    const index = await client.indexes.create({
      type: 'action',
      id: `index-${uuidDeleted}`,
      filter: `tags.type-${uuidDeleted}=$1`,
    })

    const resp = await client.indexes.delete({ id: index.id })
    expect(resp.message).to.equal('ok')
    const items = await testHelpers.asyncAll(client.indexes.list().all())
    expect(items).not.to.include(index)
  })

  it('lists indexes', async () => {
    const uuidListed = uuid.v4()

    const actionIndex = await client.indexes.create({
      type: 'action',
      id: `actionIndex-${uuidListed}`,
      filter: `tags.type-${uuidListed}=$1`,
    })

    const tokenIndex = await client.indexes.create({
      type: 'token',
      id: `tokenIndex-${uuidListed}`,
      filter: `tags.type-${uuidListed}=$1`,
      groupBy: ["flavorId"],
    })

    const items = await testHelpers.asyncAll(client.indexes.list().all())
    const ids = items.map(item => item.id)
    expect(ids).to.include(actionIndex.id, tokenIndex.id)
  })
})

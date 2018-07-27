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
  it('rejects bad types', () => {
    return expect(client.indexes.create({
      type: 'not-a-type',
      method: 'sum',
      filter: `tags.type=$1`,
    }) as any).to.be.rejectedWith(
      'SEQ611'
    )
  })

  it('rejects bad methods', () => {
    return expect(client.indexes.create({
      type: 'token',
      method: 'not-a-method',
      filter: `tags.type=$1`,
    }) as any).to.be.rejectedWith(
      'SEQ611'
    )
  })

  it('creates an index', async () => {
    const uuidCreated = uuid.v4()

    const index = await client.indexes.create({
      type: 'token',
      method: 'sum',
      id: `tokenIndex-${uuidCreated}`,
      filter: `tags.type-${uuidCreated}=$1`,
      groupBy: ["flavorId"],
    })
    expect(index.type).to.equal('token')
  })

  it('creates an index without id', async () => {
    const uuidCreated = uuid.v4()

    const index = await client.indexes.create({
      type: 'token',
      method: 'sum',
      filter: `tags.type-${uuidCreated}=$1`,
    })
    expect(index.type).to.equal('token')
  })

  it('deletes index by id', async () => {
    const uuidDeleted = uuid.v4()

    const index = await client.indexes.create({
      type: 'token',
      method: 'sum',
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

    const tokenIndex1 = await client.indexes.create({
      type: 'token',
      method: 'sum',
      filter: `tags.type-${uuidListed}=$1`,
      groupBy: ["flavorId"],
    })

    const tokenIndex2 = await client.indexes.create({
      type: 'token',
      method: 'sum',
      filter: `tags.type-${uuidListed}=$1`,
      groupBy: ["flavorId", "accountId"],
    })


    const items = await testHelpers.asyncAll(client.indexes.list().all())
    const ids = items.map(item => item.id)
    expect(ids).to.include(tokenIndex1.id, tokenIndex2.id)
  })
})

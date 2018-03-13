/* eslint-env mocha */

import * as assert from 'assert'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as uuid from 'uuid'

chai.use(chaiAsPromised)
const expect = chai.expect

import { testHelpers } from './testHelpers'

const { client } = testHelpers

describe('Feed', () => {
  it('creates action feed', async () => {
    const feed = await client.feeds.create(
      {
        type: 'action',
        id: `actionFeed-${uuid.v4()}`,
        filter: "tags.type=$1",
        filterParams: ["test"],
      }
    )
    expect(feed.type).to.equal('action')
  })

  it('creates transaction feed', async () => {
    const feed = await client.feeds.create(
      {
        type: 'transaction',
        id: `transactionFeed-${uuid.v4()}`,
        filter: "actions(type='issue')",
      }
    )
    expect(feed.type).to.equal('transaction')
  })

  it('retrieves feed by id', async () => {
    const feedId = `actionFeed-${uuid.v4()}`
    await client.feeds.create(
      {
        type: 'action',
        id: feedId,
        filter: "tags.type=$1",
        filterParams: ["test"],
      }
    )

    const feed = await client.feeds.get({id: feedId})
    expect(feed.type).to.equal('action')
    expect(feed.id).to.equal(feedId)
  })

  it('deletes feed by id', async () => {
    const feedId = `actionFeed-${uuid.v4()}`
    await client.feeds.create(
      {
        type: 'action',
        id: feedId,
        filter: "tags.type=$1",
        filterParams: ["test"],
      }
    )

    const resp = await client.feeds.delete({id: feedId})
    expect(resp.message).to.equal("ok")
    expect(client.feeds.get({ id: feedId } as any)).to.be.rejectedWith(
      'SEQ002'
    )
  })

  it('lists feeds', async () => {
    const actionFeed = await client.feeds.create(
      {
        type: 'action',
        id: `actionFeed-${uuid.v4()}`,
      }
    )

    const transactionFeed = await client.feeds.create(
      {
        type: 'transaction',
        id: `transactionFeed-${uuid.v4()}`,
      }
    )

    const items: any[] = []
    await client.feeds.list().all(item => items.push(item))
    expect(items).to.include(actionFeed, transactionFeed)
  })
})

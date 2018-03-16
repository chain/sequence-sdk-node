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

describe('Feed', () => {
  it('creates action feed', async () => {
    const feed = await client.feeds.create({
      type: 'action',
      id: `actionFeed-${uuid.v4()}`,
      filter: 'tags.type=$1',
      filterParams: ['test'],
    })
    expect(feed.type).to.equal('action')
  })

  it('creates transaction feed', async () => {
    const feed = await client.feeds.create({
      type: 'transaction',
      id: `transactionFeed-${uuid.v4()}`,
      filter: "actions(type='issue')",
    })
    expect(feed.type).to.equal('transaction')
  })

  it('retrieves feed by id', async () => {
    const feedId = `actionFeed-${uuid.v4()}`
    await client.feeds.create({
      type: 'action',
      id: feedId,
      filter: 'tags.type=$1',
      filterParams: ['test'],
    })

    const feed = await client.feeds.get({ id: feedId })
    expect(feed.type).to.equal('action')
    expect(feed.id).to.equal(feedId)
  })

  it('deletes feed by id', async () => {
    const feedId = `actionFeed-${uuid.v4()}`
    await client.feeds.create({
      type: 'action',
      id: feedId,
      filter: 'tags.type=$1',
      filterParams: ['test'],
    })

    const resp = await client.feeds.delete({ id: feedId })
    expect(resp.message).to.equal('ok')
    expect(client.feeds.get({ id: feedId } as any)).to.be.rejectedWith('SEQ002')
  })

  it('lists feeds', async () => {
    const actionFeed = await client.feeds.create({
      type: 'action',
      id: `actionFeed-${uuid.v4()}`,
    })

    const transactionFeed = await client.feeds.create({
      type: 'transaction',
      id: `transactionFeed-${uuid.v4()}`,
    })

    const items = await testHelpers.asyncAll(client.feeds.list().all())
    const ids = items.map(item => item.id)
    expect(ids).to.include(actionFeed.id, transactionFeed.id)
  })

  it('consumes an action/transaction feed', async () => {
    const goldId: any = (await createFlavor('gold')).id
    const bobId: any = (await createAccount('bob')).id
    const tag: string = uuid.v4()
    const actionFeed = await client.feeds.create({
      type: 'action',
      id: `actionFeed-${uuid.v4()}`,
      filter: 'tags.type=$1',
      filterParams: [tag],
    })
    const transactionFeed = await client.feeds.create({
      type: 'transaction',
      id: `transactionFeed-${uuid.v4()}`,
      filter: 'actions(tags.type=$1)',
      filterParams: [tag],
    })

    const tx1 = await client.transactions.transact(builder => {
      builder.issue({
        flavorId: goldId,
        amount: 400,
        destinationAccountId: bobId,
        actionTags: { type: tag },
      })
    })
    const tx2 = await client.transactions.transact(builder => {
      builder.issue({
        flavorId: goldId,
        amount: 100,
        destinationAccountId: bobId,
        actionTags: { type: tag },
      })
    })

    const actionFeedItems: any[] = []
    const transactionFeedItems: any[] = []

    for await (const action of actionFeed) {
      actionFeedItems.push(action.id)
      await actionFeed.ack()
      if (actionFeedItems.length === 2) { break }
    }
    for await (const transaction of transactionFeed) {
      transactionFeedItems.push(transaction.id)
      await transactionFeed.ack()
      if (transactionFeedItems.length === 2) { break }
    }

    expect(actionFeedItems).to.deep.equal([
      tx1.actions[0].id,
      tx2.actions[0].id,
    ])
    expect(transactionFeedItems).to.deep.equal([tx1.id, tx2.id])
  })
})

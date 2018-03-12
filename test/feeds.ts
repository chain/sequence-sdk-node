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
        id: 'actionFeed',
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
        id: 'transactionFeed',
        filter: "actions(type='issue')",
      }
    )
    expect(feed.type).to.equal('transaction')
  })
})

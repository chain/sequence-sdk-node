import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as uuid from 'uuid'
import { testHelpers } from './testHelpers'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Stats', () => {
  const client = testHelpers.client
  let initial: any
  let key: any
  let account: any
  let flavor: any

  before(async () => {
    initial = await client.stats.get()
    key = await client.keys.create()
    account = await client.accounts.create({ keys: [key], quorum: 1 })
    flavor = await client.flavors.create({ keys: [key], quorum: 1 })
    await client.transactions.transact(b =>
      b.issue({
        flavorId: flavor.id,
        amount: 1,
        destinationAccountId: account.id,
      })
    )
  })

  it('basic usage', async () => {
    const got = await client.stats.get()
    expect(got.flavorCount).to.equal(initial.flavorCount + 1)
    expect(got.accountCount).to.equal(initial.accountCount + 1)
    expect(got.txCount).to.equal(initial.txCount + 1)
  })
})

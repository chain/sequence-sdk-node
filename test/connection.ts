import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import { testHelpers } from './testHelpers'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Connection', () => {
  it('maintains a ledgerUrl based on response from /hello', async () => {
    const client = testHelpers.client

    await client.stats.get()

    expect((client.connection as any).ledgerUrl).to.equal(
      'https://chain.localhost:1999/team/test'
    )
  })

  it('maintains a deadline for refreshing addr', async () => {
    const client = testHelpers.client
    await client.stats.get()
    const initial = (client.connection as any).deadline

    await client.stats.get()

    expect((client.connection as any).deadline).to.equal(initial)
  })

  it('passes additional headers to the api when set', async () => {
    const client = testHelpers.constructClient()
    client.connection.customHeaders = {Foo: 'bar'}

    const resp = await client.stats.get()
    expect(resp._rawRequest.headers.Foo).to.equal('bar')
  })
})

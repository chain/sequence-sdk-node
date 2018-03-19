/* eslint-env mocha */

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as uuid from 'uuid'

import { testHelpers } from './testHelpers'
const { client, createAccount, createFlavor } = testHelpers

chai.use(chaiAsPromised)

const expect = chai.expect

describe('Page', () => {
  let gold: any
  let aliceAlias: string

  before(async () => {
    const allKeys = await client.keys.queryAll()
    gold = await createFlavor('gold')
    aliceAlias = (await createAccount('alice')).alias

    const creationPromises: any[] = []
    for (let i = 0; i < 101 - allKeys.length; i++) {
      await client.keys.create()
    }

    await client.transactions.transact(builder => {
      for (let i = 0; i < 101; i++) {
        builder.issue({
          flavorId: gold.id,
          amount: 100,
          destinationAccountAlias: aliceAlias,
        })
      }
    })
  })

  describe('nextPage', async () => {
    it('returns two pages of results', async () => {
      const page = await client.keys.queryPage({})
      expect(page.items.length).to.eq(100)
      expect(page.lastPage).to.eq(false)
      const nextPage = await page.nextPage()
      expect(nextPage.items.length).to.be.above(0)
    })

    it('returns two pages of results for actions', async () => {
      const page = await client.actions.list({}).page()
      expect(page.items.length).to.eq(100)
      expect(page.lastPage).to.eq(false)
      const nextPage = await page.nextPage()
      expect(nextPage.items.length).to.be.above(0)
    })
  })
})

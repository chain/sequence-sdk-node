import * as fs from 'fs'
import * as https from 'https'
import * as uuid from 'uuid'
import { TransactionBuilder } from '../src/api/transactions'
import { Client } from '../src/client'
import sequence from '../src/index'

const constructClient = () => {
  const ledgerName = process.env.LEDGER_NAME || 'test'
  const teamName = process.env.TEAM_NAME || 'team'
  const macaroon = process.env.MACAROON
  const ca = process.env.ROOT_CA_CERTS

  const constructingClient = new sequence.Client({
    ledgerName,
    credential: macaroon,
    agent: new https.Agent({ ca }),
  })
  constructingClient.connection.getRefreshTokenInfo = function() {
    const tenHours = 10 * 60 * 60 * 1000
    return Promise.resolve({
      sessTok: {
        refreshAt: Date.now() + tenHours,
        secret: ' ',
      },
      ledgerUrl: this.baseUrl + '/' + teamName + '/' + ledgerName,
    })
  }
  return constructingClient
}

const client = constructClient()

const balanceByFlavorId = async (balances: any) => {
  const res: { [flavorId: string]: number } = {}
  const balance = await balances
  balance.items.forEach((item: any) => {
    res[item.flavorId] = item.amount
  })
  return res
}

const createAccount = async (account = 'account') => {
  const key = await client.keys.create()
  return await client.accounts.create({
    id: `${account}-${uuid.v4()}`,
    keyIds: [key.id],
    quorum: 1,
  })
}

const createFlavor = async (id?: string) => {
  const key = await client.keys.create()
  return await client.flavors.create({
    id: id ? id + '-' + uuid.v4() : id,
    keyIds: [key.id],
    quorum: 1,
  })
}
const createTags = async (keyname = 'test') => {
  const res: { [key: string]: string } = {}
  res[keyname] = await uuid.v4().toString()
  return res
}

const transact = (
  buildFunc: (builder: TransactionBuilder) => void,
  optClient?: Client
) => {
  const c = optClient || client
  return c.transactions.transact(buildFunc)
}

// asyncAll is sort of like Promise.all but it takes
// an async iterator instead of a regular iterator.
// (However, unlike Promise.all, it accumulates
// items one at a time, not in parallel.)
const asyncAll = async (iter: any) => {
  const items = []
  for await (const v of iter) {
    items.push(v)
  }
  return items
}

export const testHelpers = {
  balanceByFlavorId,
  client,
  constructClient,
  createAccount,
  createFlavor,
  createTags,
  transact,
  asyncAll,
}

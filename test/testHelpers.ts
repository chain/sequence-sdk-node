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
    ledgerName: ledgerName,
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

const balanceByAssetAlias = async (balances: any) => {
  const res: { [assetAlias: string]: number } = {}
  const balance = await balances
  balance.items.forEach((item: any) => {
    res[item.sumBy.assetAlias] = item.amount
  })
  return res
}

const createAccount = async (account = 'account') => {
  const key = await client.keys.create({ alias: uuid.v4() })
  return await client.accounts.create({
    alias: `${account}-${uuid.v4()}`,
    keys: [key],
    quorum: 1,
  })
}

const createAsset = async (asset = 'asset') => {
  const key = await client.keys.create({ alias: uuid.v4() })
  return await client.assets.create({
    alias: `${asset}-${uuid.v4()}`,
    keys: [key],
    quorum: 1,
  })
}

const createFlavor = async (flavor = 'flavor') => {
  const key = await client.keys.create({ alias: uuid.v4() })
  return await client.flavors.create({
    id: `${flavor}-${uuid.v4()}`,
    keys: [key],
    quorum: 1,
  })
}
const createRefData = async (keyname = 'test') => {
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

export const testHelpers = {
  balanceByAssetAlias,
  client,
  constructClient,
  createAccount,
  createAsset,
  createFlavor,
  createRefData,
  transact,
}

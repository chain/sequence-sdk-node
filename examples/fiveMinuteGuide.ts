// To run:
// npm install && npm run build
// ./node_modules/ts-node/dist/bin.js examples/fiveMinuteGuide.ts

import sequence from '..'
import { TransactionBuilder } from '../dist/api/transactions'

const ledger = new sequence.Client({
  ledgerName: 'CHANGEME',
  credential: 'CHANGEME',
})

const uuid = `${Math.floor(new Date().getTime())}-${Math.floor(
  Math.random() * 100000
)}`
const usd = `usd-${uuid}`
const alice = `alice-${uuid}`
const bob = `bob-${uuid}`

async function main() {
  const key = await ledger.keys.create()
  await ledger.flavors.create({ id: usd, keyIds: [key.id] })
  await ledger.accounts.create({ id: alice, keyIds: [key.id] })
  await ledger.accounts.create({ id: bob, keyIds: [key.id] })

  await ledger.transactions.transact((builder: TransactionBuilder) => {
    builder.issue({
      flavorId: usd,
      amount: 100,
      destinationAccountId: alice,
    })
  })

  await ledger.transactions.transact((builder: TransactionBuilder) => {
    builder.transfer({
      flavorId: usd,
      amount: 50,
      sourceAccountId: alice,
      destinationAccountId: bob,
    })
  })

  await ledger.transactions.transact((builder: TransactionBuilder) => {
    builder.retire({
      flavorId: usd,
      amount: 20,
      sourceAccountId: bob,
    })
  })
}

main().catch(err => console.log(err))

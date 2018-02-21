import { Agent } from 'https'
import { accountsAPI } from './api/accounts'
import { actionsAPI, ActionSumParams } from './api/actions'
import { assetsAPI } from './api/assets'
import { BalanceQueryParams, balancesAPI } from './api/balances'
import { ContractQueryParameters, contractsAPI } from './api/contracts'
import { devUtilsAPI } from './api/devUtils'
import { flavorsAPI } from './api/flavors'
import { keysAPI } from './api/keys'
import { statsAPI } from './api/stats'
import {
  TransactionBuilder,
  TransactionQueryParameters,
  transactionsAPI,
} from './api/transactions'
import { Connection } from './connection'
import { Page } from './page'
import { CreateRequest, QueryParams, UpdateTagsRequest } from './shared'

/**
 * The Sequence API Client object is the root object for all API interactions.
 * To interact with Sequence, a Client object must always be instantiated
 * first.
 * @class
 */
export class Client {
  public connection: Connection

  /**
   * API actions for accounts
   * @type {module:AccountsApi}
   */
  public accounts = accountsAPI(this)

  /**
   * API actions for actions
   * @type {module:ActionsApi}
   */
  public actions = actionsAPI(this)

  /**
   * API actions for assets.
   * @type {module:AssetsApi}
   */
  public assets = assetsAPI(this)

  /**
   * API actions for balances.
   * @type {module:BalancesApi}
   */
  public balances = balancesAPI(this)

  /**
   * Development-only API actions.
   * @type {module:DevUtilsApi}
   */
  public devUtils = devUtilsAPI(this)

  /**
   * API actions for flavors.
   * @type {module:FlavorsApi}
   */
  public flavors = flavorsAPI(this)

  /**
   * API actions for keys.
   * @type {module:KeysAPI}
   */
  public keys = keysAPI(this)

  /**
   * API actions for stats.
   * @type {module:StatsApi}
   */
  public stats = statsAPI(this)

  /**
   * API actions for transactions.
   * @type {module:TransactionsApi}
   */
  public transactions = transactionsAPI(this)

  /**
   * API actions for contracts.
   * @type {module:ContractsApi}
   */
  public contracts = contractsAPI(this)

  /**
   * constructor - create a new Chain client object capable of interacting with
   * the specified ledger.
   *
   * Passing a configuration object is the preferred way of calling this constructor.
   *
   * @param {Object} opts - Plain JS object containing configuration options.
   * @param {String} opts.ledgerName - Ledger name.
   * @param {String} opts.ledger - Ledger name. **Deprecated; please use ledgerName instead.**
   * @param {String} opts.credential - API credential secret.
   * @returns {Client}
   */
  constructor(
    opts: {
      ledger?: string
      ledgerName?: string
      credential?: string
      agent?: Agent
    } = {}
  ) {
    if (
      (!opts.ledgerName || opts.ledgerName === '') ===
      (!opts.ledger || opts.ledger === '')
    ) {
      throw new Error('ledgerName or ledger (but not both) must be provided')
    }

    /**
     * The client's connection to Sequence
     * @type {Client}
     */
    this.connection = new Connection(
      opts.ledgerName || (opts.ledger as string),
      opts.credential,
      opts.agent
    )
  }

  /**
   * Submit a request to the stored Sequence connection.
   *
   * @param {String} path
   * @param {object} [body={}]
   * @returns {Promise}
   */
  public async request(path: string, body = {}): Promise<any> {
    try {
      return await this.connection.request(path, body)
    } catch (err) {
      if (err.rawMessage === 'Request limit exceeded') {
        await sleep(500)
        return this.request(path, body)
      }
      throw err
    }
  }
}

function sleep(t: number) {
  return new Promise(resolve => setTimeout(resolve, t))
}

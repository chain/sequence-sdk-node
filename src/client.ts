import { accountsAPI } from './api/accounts'
import { actionsAPI, ActionSumParams } from './api/actions'
import { devUtilsAPI } from './api/devUtils'
import { Feed, FeedCreateParameters, feedsAPI } from './api/feeds'
import { flavorsAPI } from './api/flavors'
import { keysAPI } from './api/keys'
import { statsAPI } from './api/stats'
import { tokensAPI, TokenSumParams } from './api/tokens'
import {
  TransactionBuilder,
  TransactionQueryParameters,
  transactionsAPI,
} from './api/transactions'
import { Connection } from './connection'
import { Page } from './page'
import { Query } from './query'
import { CreateRequest, QueryParams, UpdateTagsRequest } from './types'
import { validate } from './validate'

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
   * Development-only API actions.
   * @type {module:DevUtilsApi}
   */
  public devUtils = devUtilsAPI(this)

  /**
   * API actions for feeds.
   * @type {module:FeedsApi}
   */
  public feeds = feedsAPI(this)

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
   * API actions for tokens.
   * @type {module:TokensApi}
   */
  public tokens = tokensAPI(this)

  /**
   * API actions for transactions.
   * @type {module:TransactionsApi}
   */
  public transactions = transactionsAPI(this)

  /**
   * constructor - create a new Chain client object capable of interacting with
   * the specified ledger.
   *
   * Passing a configuration object is the preferred way of calling this constructor.
   *
   * @param {Object} opts - Plain JS object containing configuration options.
   * @param {String} opts.ledgerName - Ledger name.
   * @param {String} opts.credential - API credential secret.
   * @returns {Client}
   */
  constructor(
    opts: {
      ledgerName?: string
      credential?: string
    } = {}
  ) {
    if (!opts.ledgerName || opts.ledgerName === '') {
      throw new Error('ledgerName must be provided')
    }

    /**
     * The client's connection to Sequence
     * @type {Client}
     */
    this.connection = new Connection(opts.ledgerName, opts.credential)
  }

  /**
   * Submit a request to the stored Sequence connection.
   *
   * @param {String} path
   * @param {object} [body={}]
   * @returns {Promise}
   */
  public async request(
    path: string,
    body = {},
    schemaKey?: string
  ): Promise<any> {
    if (body !== undefined && schemaKey !== undefined) {
      validate(body, schemaKey)
    }

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

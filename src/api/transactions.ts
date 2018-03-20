import { Client } from '../client'
import { Page } from '../page'
import { Query } from '../query'
import { Consumer, QueryParams, sharedAPI } from '../shared'

/**
 * A blockchain consists of an immutable set of cryptographically linked
 * transactions. Each transaction contains one or more actions.
 *
 * More info: {@link https://dashboard.seq.com/docs/transactions}
 * @typedef {Object} Transaction
 * @global
 *
 * @property {String} id
 * Unique transaction identifier.
 *
 * @property {String} timestamp
 * Time of transaction, RFC3339 formatted.
 *
 * @property {Number} sequenceNumber
 * Sequence number of the transaction.
 *
 * @property {Action[]} actions
 * List of specified actions for a transaction.
 */

/**
 * @class
 * A convenience class for building transaction template objects.
 */
export class TransactionBuilder {
  public actions: any[]

  /**
   * constructor - return a new object used for constructing a transaction.
   */
  constructor() {
    /**
     * List of actions to send to the build-transaction API.
     * @name TransactionBuilder#actions
     * @type Array
     */
    this.actions = []
  }

  /**
   * Add an action that issues tokens.
   *
   * @param {Object} params - Action parameters.
   * @param {String} params.flavorId - ID of flavor to be issued.
   * @param {String} params.amount - Amount of the flavor to be issued.
   * @param {String} params.destinationAccountId - Account ID specifying the
   *   account controlling the flavor.
   * @param {Object} params.tokenTags - Tags to add to the receiving tokens.
   * @param {Object} params.actionTags - Tags to add to the action.
   */
  public issue(params: {
    flavorId: string
    amount: number
    destinationAccountId: string
    tokenTags?: object
    actionTags?: object
  }) {
    this.actions.push(Object.assign({}, params, { type: 'issue' }))
  }

  /**
   * Add an action that retires tokens.
   *
   * @param {Object} params - Action parameters.
   * @param {String} params.sourceAccountId - Account ID specifying the account
   *   controlling the flavor.
   * @param {String} params.flavorId - ID of flavor to be retired.
   * @param {Number} params.amount - Amount of the flavor to be retired.
   * @param {String} params.filter - Token filter string, see {@link https://dashboard.seq.com/docs/filters}.
   * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
   * @param {Object} params.actionTags - Tags to add to the action.
   */
  public retire(params: {
    sourceAccountId: string
    flavorId: string
    amount: number
    filter?: string
    filterParams?: object
    actionTags?: object
  }) {
    this.actions.push(Object.assign({}, params, { type: 'retire' }))
  }

  /**
   * Add an action that moves tokens from a source account to
   * a destination account.
   *
   * @param {Object} params Action parameters
   * @param {String} params.sourceAccountId - Account ID specifying the account
   *   controlling the flavor.
   * @param {Integer} params.amount - Amount of the flavor to be transferred.
   * @param {String} params.destinationAccountId - Account ID specifying the
   *   account controlling the flavor.
   * @param {String} params.filter - Token filter string, see {@link https://dashboard.seq.com/docs/filters}.
   * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
   * @param {Object} params.tokenTags - Tags to add to the receiving tokens.
   * @param {Object} params.actionTags - Tags to add to the action.
   */
  public transfer(params: {
    sourceAccountId: string
    flavorId: string
    amount: number
    destinationAccountId: string
    filter?: string
    filterParams?: object
    tokenTags?: object
    actionTags?: object
  }) {
    this.actions.push(Object.assign({}, params, { type: 'transfer' }))
  }
}

export interface TransactionQueryParameters extends QueryParams {
  startTime?: number
  endTime?: number
  timeout?: number
}

/**
 * API for interacting with {@link Transaction transactions}.
 *
 * More info: {@link https://dashboard.seq.com/docs/transactions}
 * @module TransactionsApi
 */
export const transactionsAPI = (client: Client) => {
  /**
   * Processing callback for building a transaction. The instance of
   * {@link TransactionBuilder} modified in the function is used to
   * build a transaction in Sequence.
   *
   * @callback builderCallback
   * @param {TransactionBuilder} builder
   */

  return {
    /**
     * Get one page of transactions matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.startTime -  A Unix timestamp in milliseconds. When specified, only transactions with a block time greater than the start time will be returned.
     * @param {Number} params.endTime - A Unix timestamp in milliseconds. When specified, only transactions with a block time less than the start time will be returned.
     * @param {Number} params.timeout - A time in milliseconds after which a server timeout should occur. Defaults to 1000 (1 second).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @returns {Promise<Page<Transaction>>} Requested page of results.
     *
     * @deprecated Use {@link module:TransactionsApi~list|list} instead.
     */
    queryPage: (params: TransactionQueryParameters) =>
      sharedAPI.queryPage(
        client,
        'transactions',
        'queryPage',
        '/list-transactions',
        params
      ),

    /**
     * Iterate over all transactions matching the specified query, calling the
     * supplied consume callback once per item.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.startTime -  A Unix timestamp in milliseconds. When specified, only transactions with a block time greater than the start time will be returned.
     * @param {Number} params.endTime - A Unix timestamp in milliseconds. When specified, only transactions with a block time less than the start time will be returned.
     * @param {Number} params.timeout - A time in milliseconds after which a server timeout should occur. Defaults to 1000 (1 second).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {QueryProcessor<Transaction>} processor - Processing callback.
     * @returns {Promise} A promise resolved upon processing of all items, or
     *                   rejected on error.
     *
     * @deprecated Use {@link module:TransactionsApi~list|list} instead.
     */
    queryEach: (params: TransactionQueryParameters, consumer: Consumer) =>
      sharedAPI.queryEach(client, 'transactions', params, consumer),

    /**
     * Request all transactions matching the specified query, calling the
     * supplied processor callback with each item individually.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.startTime -  A Unix timestamp in milliseconds. When specified, only transactions with a block time greater than the start time will be returned.
     * @param {Number} params.endTime - A Unix timestamp in milliseconds. When specified, only transactions with a block time less than the start time will be returned.
     * @param {Number} params.timeout - A time in milliseconds after which a server timeout should occur. Defaults to 1000 (1 second).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {QueryProcessor<Transaction>} processor - Processing callback.
     * @returns {Promise} A promise resolved upon processing of all items, or
     *                   rejected on error.
     *
     * @deprecated Use {@link module:TransactionsApi~list|list} instead.
     */
    queryAll: (params: TransactionQueryParameters) =>
      sharedAPI.queryAll(client, 'transactions', params),

    /**
     * Query a list of transactions matching the specified query.
     *
     * @param {Object} params={} - Filter information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @returns {Query} Query to retrieve results.
     */
    list: (params?: QueryParams | {}) =>
      new Query(client, 'transactions', 'list', params),

    /**
     * Builds, signs, and submits a transaction.
     *
     * @param {module:TransactionsApi~builderCallback} builderBlock - Function that adds desired actions
     *                                         to a given builder object.
     * @returns {Promise<Transaction>} Transaction object, or error.
     */
    transact: (builderBlock: ((builder: TransactionBuilder) => void)) => {
      const builder = new TransactionBuilder()

      try {
        builderBlock(builder)
      } catch (err) {
        return Promise.reject(err)
      }

      const makePromise = async () => {
        return client.request('/transact', builder)
      }
      return makePromise()
    },
  }
}

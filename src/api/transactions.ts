import { BigNumber } from 'bignumber.js'
import { Client } from '../client'
import { Page } from '../page'
import { Query } from '../query'
import { QueryParams } from '../types'
import { validate } from '../validate'

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
 *
 * @property {Object} tags
 * User-specified key-value data embedded in the transaction.
 */

/**
 * @class
 * A convenience class for building transaction template objects.
 */
export class TransactionBuilder {
  public actions: any[]
  public transactionTags: any

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

    /**
     * Key-value tags for the transaction.
     * @name TransactionBuilder#transactionTags
     * @type Object
     */
    this.transactionTags = null
  }

  /**
   * Add an action that issues tokens.
   *
   * @param {Object} params - Action parameters.
   * @param {String} params.flavorId - ID of flavor to be issued.
   * @param {Number|String|BigNumber} params.amount - Amount of the flavor to be issued.
   * @param {String} params.destinationAccountId - Account ID specifying the
   *   account controlling the flavor.
   * @param {Object} params.tokenTags - Tags to add to the receiving tokens.
   * @param {Object} params.actionTags - Tags to add to the action.
   */
  public issue(params: {
    flavorId: string
    amount: number | string | BigNumber
    destinationAccountId: string
    tokenTags?: object
    actionTags?: object
  }) {
    validate(params, 'IssueActionSchema')
    params.amount = new BigNumber(params.amount)
    this.actions.push(Object.assign({}, params, { type: 'issue' }))
  }

  /**
   * Add an action that retires tokens.
   *
   * @param {Object} params - Action parameters.
   * @param {String} params.sourceAccountId - Account ID specifying the account
   *   controlling the flavor.
   * @param {String} params.flavorId - ID of flavor to be retired.
   * @param {Number|String|BigNumber} params.amount - Amount of the flavor to be retired.
   * @param {String} params.filter - Token filter string, see {@link https://dashboard.seq.com/docs/filters}.
   * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
   * @param {Object} params.actionTags - Tags to add to the action.
   */
  public retire(params: {
    sourceAccountId: string
    flavorId: string
    amount: number | string | BigNumber
    filter?: string
    filterParams?: object
    actionTags?: object
  }) {
    validate(params, 'RetireActionSchema')
    params.amount = new BigNumber(params.amount)
    this.actions.push(Object.assign({}, params, { type: 'retire' }))
  }

  /**
   * Add an action that moves tokens from a source account to
   * a destination account.
   *
   * @param {Object} params Action parameters
   * @param {String} params.sourceAccountId - Account ID specifying the account
   *   controlling the flavor.
   * @param {String} params.flavorId - ID of flavor to be transferred.
   * @param {Number|String|BigNumber} params.amount - Amount of the flavor to be transferred.
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
    amount: number | string | BigNumber
    destinationAccountId: string
    filter?: string
    filterParams?: object
    tokenTags?: object
    actionTags?: object
  }) {
    validate(params, 'TransferActionSchema')
    params.amount = new BigNumber(params.amount)
    this.actions.push(Object.assign({}, params, { type: 'transfer' }))
  }
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

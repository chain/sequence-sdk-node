import * as uuid from 'uuid'
import { Client } from '../client'
import { Page } from '../page'
import { Query } from '../query'
import { Consumer, QueryParams } from '../shared'
import { CreateRequest, sharedAPI, UpdateTagsRequest } from '../shared'

/**
 * An account is an object in Sequence that tracks ownership of tokens on a
 * blockchain by creating and tracking control programs.
 *
 * More info: {@link https://dashboard.seq.com/docs/accounts}
 * @typedef {Object} Account
 * @global
 *
 * @property {String} id
 * Unique identifier of the account.
 *
 * @property {String[]} keyIds
 * The list of key IDs used to create control programs under the account.
 * Signatures from these keys are required for spending funds held in the
 * account.
 *
 * @property {Number} quorum
 * The number of keys required to sign transactions for the account.
 *
 * @property {Object} tags
 * User-specified tag structure for the account.
 */

/**
 * API for interacting with {@link Account accounts}.
 *
 * More info: {@link https://dashboard.seq.com/docs/accounts}
 * @module AccountsApi
 */
export const accountsAPI = (client: Client) => {
  /**
   * @typedef {Object} createRequest
   *
   * @property {String} [id]
   * Unique identifier. Will be auto-generated if not provided.
   *
   * @property {String[]} keyIds
   * The list of key IDs used to create control programs under the account.
   *
   * @property {Number} [quorum]
   * The number of keys required to sign transactions for the account. Defaults
   * to the size of rootXpubs.
   *
   * @property {Object} [tags]
   * User-specified tag structure for the account.
   */

  /**
   * @typedef {Object} updateTagsRequest
   *
   * @property {String} [id]
   * The account ID.
   *
   * @property {Object} tags
   * A new set of tags, which will replace the existing tags.
   */

  return {
    /**
     * Create a new account.
     *
     * @param {module:AccountsApi~createRequest} params - Parameters for account creation.
     * @returns {Promise<Account>} Newly created account.
     */
    create: (params: CreateRequest) =>
      client.request('/create-account', params),

    /**
     * Update account tags.
     *
     * @param {module:AccountsApi~updateTagsRequest} params - Parameters for updating account tags.
     * @returns {Promise<Object>} Success message.
     */
    updateTags: (params: UpdateTagsRequest) =>
      client.request('/update-account-tags', params),

    /**
     * Get one page of accounts matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @returns {Promise<Page<Account>>} Requested page of results.
     *
     * @deprecated Use {@link module:AccountsApi~list|list} instead.
     */
    queryPage: (params?: QueryParams) =>
      sharedAPI.queryPage(
        client,
        'accounts',
        'queryPage',
        '/list-accounts',
        params
      ),

    /**
     * Iterate over all accounts matching the specified query, calling the
     * supplied consume callback once per item.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {QueryProcessor<Account>} processor - Processing callback.
     * @returns {Promise} A promise resolved upon processing of all items, or
     *                   rejected on error.
     *
     * @deprecated Use {@link module:AccountsApi~list|list} instead.
     */
    queryEach: (params: object, consumer: Consumer) =>
      sharedAPI.queryEach(client, 'accounts', params, consumer),

    /**
     * Fetch all accounts matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @returns {Promise<Account[]>} A promise resolved upon processing of all items, or
     *                   rejected on error.
     *
     * @deprecated Use {@link module:AccountsApi~list|list} instead.
     */
    queryAll: (params?: QueryParams) =>
      sharedAPI.queryAll(client, 'accounts', params),

    /**
     * Query a list of accounts matching the specified query.
     *
     * @param {Object} params={} - Filter information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @returns {Query} Query to retrieve results.
     */
    list: (params?: QueryParams | {}) =>
      new Query(client, 'accounts', 'list', params),
  }
}

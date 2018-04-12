import { Client } from '../client'
import { Page } from '../page'
import { Query } from '../query'
import { CreateRequest, QueryParams, UpdateTagsRequest } from '../types'

/**
 * A container that holds tokens in a ledger.
 *
 * More info: {@link https://dashboard.seq.com/docs/accounts}
 * @typedef {Object} Account
 * @global
 *
 * @property {String} id
 * Unique identifier of the account.
 *
 * @property {String[]} keyIds
 * The list of IDs for the keys that control the account.
 *
 * @property {Number} quorum
 * The number of keys required to sign transactions that transfer or retire
 * tokens from the account.
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
   * The list of IDs for the keys that control the account.
   *
   * @property {Number} [quorum]
   * The number of keys required to sign transactions that transfer or retire
   * tokens from the account. Defaults to the number of keys provided.
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

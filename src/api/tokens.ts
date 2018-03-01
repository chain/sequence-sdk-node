import { Client } from '../client'
import { Query } from '../query'
import {
  Consumer,
  ObjectCallback,
  PageCallback,
  PageParams,
  QueryParams,
  sharedAPI,
} from '../shared'

/**
 * More info: {@link https://dashboard.seq.com/docs/tokens}
 *
 * @typedef {Object} TokenGroup
 * @global
 *
 * @property {Number} amount
 * The amount of tokens in the group.
 *
 * @property {String} flavorId
 * The flavor of the tokens in the group.
 *
 * @property {Object} flavorTags
 * The tags of the flavor of the tokens in the group.
 *
 * @property {String} accountId
 * The account containing the tokens.
 *
 * @property {Object} accountTags
 * The tags of the account containing the tokens.
 *
 * @property {Object} tags
 * The tags of the tokens in the group.
 */

/**
 * More info: {@link https://dashboard.seq.com/docs/tokens}
 *
 * @typedef {Object} TokenSum
 * @global
 *
 * @property {Number} amount
 * The amount of tokens in the group.
 *
 * @property {String} [flavorId]
 * The flavor of the tokens in the group.
 *
 * @property {Object} [flavorTags]
 * The tags of the flavor of the tokens in the group.
 *
 * @property {String} [accountId]
 * The account containing the tokens.
 *
 * @property {Object} [accountTags]
 * The tags of the account containing the tokens.
 *
 * @property {Object} [tags]
 * The tags of the tokens in the group.
 */

export interface TokenSumParams extends QueryParams {
  groupBy?: string[]
}

/**
 * API for interacting with {@link Token tokens}.
 *
 * More info: {@link https://dashboard.seq.com/docs/tokens}
 * @module TokensApi
 */
export const tokensAPI = (client: Client) => {
  return {
    /**
     * Query a list of tokens matching the specified query.
     *
     * @param {Object} params={} - Filter information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {PageCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Query} Query to retrieve results.
     */
    list: (params?: QueryParams | {}) =>
      new Query(client, 'tokens', 'list', params),
    /**
     * Query sums of tokens matching the specified query.
     *
     * @param {Object} params={} - Filter information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Array<String>} params.groupBy - Fields in Token object to group by.
     * @param {PageCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Query} Query to retrieve results.
     */
    sum: (params?: TokenSumParams | {}) =>
      new Query(client, 'tokens', 'sum', params),
  }
}

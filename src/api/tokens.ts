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
     * Get tokens matching the specified query.
     *
     * @param {Object} params={} - Filter information.
     * @param {String} params.filter - Filter string,
     *   see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for
     *   filter string (if needed).
     * @returns {Query} Query to retrieve results.
     * @example <caption>List all tokens after a certain time</caption>
     * async () => {
     *   await ledger.tokens
     *     .list({
     *       filter: 'timestamp > $1',
     *       filterParams: ['1985-10-26T01:21:00Z']
     *     })
     *     .all(token => {
     *       console.log(token)
     *     })
     * }
     * @example <caption>Paginate tokens</caption>
     * async () => {
     *   const page1 = await ledger.tokens
     *     .list({})
     *     .page({ size: 1 })
     *   const token = page1.items[0];
     *   console.log(token)
     * const page2 = await ledger.tokens
     *     .list({})
     *     .page({ cursor: page.cursor })
     * }
     */
    list: (params?: QueryParams | {}) =>
      new Query(client, 'tokens', 'list', params),
    /**
     * Get sums of tokens matching the specified query.
     *
     * @param {Object} params={} - Filter information.
     * @param {String} params.filter - Filter string,
     *   see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for
     *   filter string (if needed).
     * @param {Array<String>} params.groupBy - Token object fields to group by.
     * @returns {Query} Query to retrieve results.
     * @example <caption>Sum all tokens after a certain time grouped by flavor ID</caption>
     * async () => {
     *   await ledger.tokens
     *     .sum({
     *       filter: 'timestamp > $1',
     *       filterParams: ['1985-10-26T01:21:00Z'],
     *       groupBy: ['flavorId']
     *     })
     *     .all(sum => {
     *       console.log(sum)
     *     })
     * }
     * @example <caption>Paginate sums of tokens grouped by flavor ID</caption>
     * async () => {
     *   const page1 = await ledger.tokens
     *     .sum({
     *       groupBy: ['flavorId']
     *     })
     *     .page({ size: 1 })
     *   const sum = page1.items[0];
     *   console.log(sum)
     *   const page2 = await ledger.tokens
     *     .sum({})
     *     .page({ cursor: page.cursor })
     * }
     */
    sum: (params?: TokenSumParams | {}) =>
      new Query(client, 'tokens', 'sum', params),
  }
}

import { Client } from '../client'
import {
  Consumer,
  ObjectCallback,
  PageCallback,
  QueryParams,
  sharedAPI,
} from '../shared'

/**
 * Any balance on the blockchain is simply a summation of contracts.
 * Unlike other queries in Chain Core, balance queries do not return Chain Core
 * objects, only simple sums over the amount fields in a specified list of
 * contract objects
 *
 * More info: {@link https://dashboard.seq.com/docs/queries}
 * @typedef {Object} Balance
 * @global
 *
 * @property {Number} amount
 * Sum of the contracts.
 *
 * @property {Array.<string>} sumBy
 * List of parameters on which to sum contracts.
 */

export interface BalanceQueryParams extends QueryParams {
  sumBy?: string[]
}

/**
 * API for interacting with {@link Balance balances}.
 *
 * More info: {@link https://dashboard.seq.com/docs/queries}
 * @module BalancesApi
 */
export const balancesAPI = (client: Client) => {
  return {
    /**
     * Get one page of balances matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {pageCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Page<Balance>>} Requested page of results.
     */
    queryPage: (params: BalanceQueryParams, cb?: PageCallback) =>
      sharedAPI.queryPage(
        client,
        'balances',
        'queryPage',
        '/list-balances',
        params,
        { cb }
      ),

    /**
     * Iterate over all balances matching the specified query, calling the
     * supplied consume callback once per item.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {QueryProcessor<Balance>} processor - Processing callback.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise} A promise resolved upon processing of all items, or
     *                   rejected on error.
     */
    queryEach: (
      params: BalanceQueryParams,
      consumer: Consumer,
      cb?: ObjectCallback
    ) => sharedAPI.queryEach(client, 'balances', params, consumer, { cb }),

    /**
     * Fetch all balances mathcing the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Balance[]>} A promise resolved upon processing of all items, or
     *                   rejected on error.
     */
    queryAll: (params: BalanceQueryParams, cb?: ObjectCallback) =>
      sharedAPI.queryAll(client, 'balances', params, { cb }),
  }
}

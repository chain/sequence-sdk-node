import { Client } from '../client'
import { Page } from '../page'
import { Query } from '../query'

import { QueryParams } from '../shared'

export interface ActionSumParams extends QueryParams {
  groupBy?: string[]
}

/**
 * API for interacting with {@link Action actions}.
 *
 * More info: {@link https://dashboard.seq.com/docs/filters}
 * @module ActionsApi
 */
export const actionsAPI = (client: Client) => {
  return {
    /**
     * Get actions matching the specified query.
     *
     * @param {Object} params={} - Filter information.
     * @param {String} params.filter - Filter string,
     *   see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for
     *   filter string (if needed).
     * @returns {Promise<Page<Action>>} A promise of results.
     * @example <caption>List all actions for a source account</caption>
     * async () => {
     *   await ledger.actions
     *     .list({
     *       filter: 'sourceAccountId = $1',
     *       filterParams: [account.id]
     *     })
     *     .all(action => {
     *       console.log(action)
     *     })
     * }
     * @example <caption>Paginate actions</caption>
     * async () => {
     *   const page1 = await ledger.actions
     *     .list({})
     *     .page({ size: 1 })
     *   const action = page1.items[0];
     *   console.log(action)
     *   const page2 = await ledger.actions
     *     .list({})
     *     .page({ cursor: page.cursor })
     * }
     */
    list: (params?: QueryParams) =>
      new Query(client, 'actions', 'list', params),

    /**
     * Get sums of actions matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string,
     *   see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for
     *   filter string (if needed).
     * @param {Array<String>} params.groupBy - Action object fields to group by.
     * @returns {Promise<Page<ActionSum>>} A promise of results.
     * @example <caption>Sum actions for an account grouped by type</caption>
     * async () => {
     *   await ledger.actions
     *     .sum({
     *       filter: 'destinationAccountId = $2',
     *       filterParams: [account.id],
     *       groupBy: ['type']
     *     })
     *     .all(sum => {
     *       console.log(sum)
     *     })
     * }
     * @example <caption>Paginate sums of actions grouped by type</caption>
     * async () => {
     *   const page1 = await ledger.actions
     *     .sum({
     *       groupBy: ['type']
     *     })
     *     .page({ size: 1 })
     *   const sum = page1.items[0];
     *   console.log(sum)
     *   const page2 = await ledger.actions
     *     .sum({})
     *     .page({ cursor: page.cursor })
     * }
     */
    sum: (params?: ActionSumParams) =>
      new Query(client, 'actions', 'sum', params),
  }
}

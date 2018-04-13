import { Client } from '../client'
import { Page } from '../page'
import { Query } from '../query'
import { QueryParams } from '../types'

export interface ActionSumParams extends QueryParams {
  groupBy?: string[]
}

/**
 * Each transaction contains one or more actions. Action queries are designed to provide
 * insights into those actions. There are two types of queries you can run against them;
 * one is "List", one is "Sum". A list query  returns a list of Action objects that
 * match the filter; a sum query sums over the amount fields based on the filter and the
 * groupBy param and returns ActionSum objects. Different from other regular API objects,
 * the amount field in ActionSum represents the summation of the amount fields of those
 * matching actions, and all other fields represent the parameters by which to group
 * actions.
 *
 * More info: {@link https://dashboard.seq.com/docs/actions}
 *
 * @typedef {Object} Action
 * @global
 *
 * @property {Number} amount
 * Summation of action amounts
 *
 * @property {String} type
 * The type of the action. Currently, there are three options: "issue",
 * "transfer", "retire".
 *
 * @property {String} id
 * A unique ID.
 *
 * @property {String} transactionId
 * The ID of the transaction in which the action appears.
 *
 * @property {String} accountId
 * The account containing the tokens.
 *
 * @property {Time} timestamp
 * Time of the action.
 *
 * @property {String} flavorId
 * The ID of the flavor held by the action.
 *
 * @property {Object} snapshot
 * A copy of the associated tags (flavor, source account, destination
 * account, action, and token) as they existed at the time of the
 * transaction.
 *
 * @property {String} sourceAccountId
 * The ID of the source account executing the action.
 *
 * @property {String} destinationAccountId
 * The ID of the destination account affected by the action.
 *
 * @property {Object} tags
 * User-specified key-value data embedded in the action.
 */

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

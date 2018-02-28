import { Client } from '../client'
import {
  Consumer,
  ObjectCallback,
  PageCallback,
  PageParams,
  QueryParams,
  sharedAPI,
} from '../shared'

/**
 * Each transaction contains one or more actions. Action queries are designed to provide
 * insights into those actions. There are two types of queries you can run against them;
 * one is "List", one is "Sum". List query simply returns a list of Action objects that
 * match the filter; Sum query sums over the amount fields based on the filter and the
 * groupBy param and returns ActionSum objects. Different from other regular API objects,
 * the amount field in ActionSum represents the summation of the amount fields of those
 * matching actions, and all other fields represent the parameters by which to group
 * actions.
 *
 * More info: {@link https://dashboard.seq.com/docs/queries}
 *
 * @typedef {Object} Action/ActionSum
 * @global
 *
 * @property {Number} amount
 * List: the number of units of the action's flavor.
 * Sum: the summation of the amount fields of the action objects.
 *
 * @property {String} type
 * The type of the action. Possible values are "issue", "transfer", and "retire".
 *
 * @property {String} flavorId
 * The id of the action's flavor.
 *
 * @property {Hash} snapshot
 * A copy of the associated tags (flavor, source account, and destination
 * account) as they existed at the time of the transaction (possibly null).
 *
 * @property {String} assetId
 * **Deprecated. Use flavorId instead.**
 * The id of the action's asset.
 *
 * @property {String} assetAlias
 * **Deprecated. Use flavorId instead.**
 * The alias of the action's asset (possibly null).
 *
 * @property {Hash} assetTags
 * **Deprecated. Use snapshot instead.**
 * The tags of the action's asset (possibly null).
 *
 * @property {String} sourceAccountId
 * The id of the account transferring the asset (possibly null if the
 * action is an issuance).
 *
 * @property {String} sourceAccountAlias
 * The alias of the account transferring the asset (possibly null if the
 * action is an issuance).
 *
 * @property {String} sourceAccountTags
 * **Deprecated. Use snapshot instead.**
 * The tags associated with the source account (possibly null).
 *
 * @property {String} destinationAccountId
 * The id of the account receiving the asset (possibly null if the
 * action is a retirement).
 *
 * @property {String} destinationAccountAlias
 * The alias of the account receiving the asset (possibly null if the
 * action is a retirement).
 *
 * @property {String} destinationAccountTags
 * **Deprecated. Use snapshot instead.**
 * The tags associated with the destination account (possibly null).
 *
 * @property {Object} referenceData
 * User specified, unstructured data embedded within an action (possibly null).
 */

export interface ActionSumParams extends QueryParams {
  groupBy?: string[]
}

/**
 * API for interacting with {@link Action actions}.
 *
 * More info: {@link https://dashboard.seq.com/docs/queries}
 * @module ActionsApi
 */
export const actionsAPI = (client: Client) => {
  return {
    /**
     * Get one page of actions matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {PageCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Page<Action>>} Requested page of results.
     * @example <caption>List all actions after a certain time</caption>
     * ledger.actions.list({
     *   filter: 'timestamp > $1',
     *   filterParams: ['1985-10-26T01:21:00Z']
     * }).then(handlePage)
     * function handlePage(page) {
     *   for (let i in page.items) {
     *     const action = page.items[i];
     *     console.log('timestamp: ' + action.timestamp)
     *     console.log('amount: ' + action.amount)
     *   }
     *   if (!page.lastPage) {
     *     page.nextPage().then(handlePage)
     *   }
     * }
     */
    list: (params: QueryParams) => ({
      page: (pageParams?: PageParams | {}, cb?: PageCallback) => {
        return sharedAPI.queryPage(
          client,
          'actions',
          'list',
          '/list-actions',
          params,
          {
            cb,
          },
          pageParams
        )
      },
      all: (consumer: Consumer, cb?: ObjectCallback) => {
        return sharedAPI.queryEach(client, 'actions.list', params, consumer, {
          cb,
        })
      },
    }),

    /**
     * Get one page of action sums matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Array<String>} params.groupBy - Fields in Action object to group by.
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {PageCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Page<ActionSum>>} Requested page of results.
     */
    sum: (params: ActionSumParams) => ({
      page: (pageParams?: PageParams | {}, cb?: PageCallback) => {
        return sharedAPI.queryPage(
          client,
          'actions',
          'sum',
          '/sum-actions',
          params,
          {
            cb,
          },
          pageParams
        )
      },
      all: (consumer: Consumer, cb?: ObjectCallback) => {
        return sharedAPI.queryEach(client, 'actions.sum', params, consumer, {
          cb,
        })
      },
    }),
  }
}

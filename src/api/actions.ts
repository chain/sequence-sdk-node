import { Client } from '../client'
import { Page } from '../page'
import {
  Consumer,
  ObjectCallback,
  PageCallback,
  PageParams,
  QueryParams,
  sharedAPI,
} from '../shared'

export interface PagePromise<T> extends Promise<T> {
  page: (pageParams?: PageParams | {}, cb2?: PageCallback) => Promise<Page>
  all: (consumer: Consumer, cb2?: ObjectCallback) => Promise<any>
}
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
 * More info: {@link https://dashboard.seq.com/docs/filters}
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
 * A copy of the associated tags (flavor, source account, destination account,
 * action, and token) as they existed at the time of the transaction (possibly
 * null).
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
 * @property {Object} tags
 * User specified, unstructured data embedded within an action (possibly null).
 *
 * @property {Object} referenceData
 * **Deprecated. Use tags instead.**
 * User specified, unstructured data embedded within an action (possibly null).
 */

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
     * @param {Number} params.pageSize - **Deprecated. Use
     *   list.page({ size: 1 }) instead.** Number of items to return.
     * @param {PageCallback} [callback] - Optional callback. Use instead of
     *   Promise return value as desired.
     * @returns {PagePromise<Page<Action>>} A promise of results.
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
    list: (params: QueryParams, cb?: PageCallback) => {
      const promise = sharedAPI.queryPage(
        client,
        'actions',
        'list',
        '/list-actions',
        params,
        { cb }
      ) as PagePromise<Page>

      // FIXME: remove the wrapping PagePromise object in 2.0, where
      // we don't need to maintain both old and new interfaces.
      const getPage = (pageParams?: PageParams | {}, cb2?: PageCallback) => {
        return sharedAPI.queryPage(
          client,
          'actions',
          'list',
          '/list-actions',
          params,
          { cb: cb2 },
          pageParams
        )
      }

      const processAll = (consumer: Consumer, cb2?: ObjectCallback) => {
        return sharedAPI.queryEach(client, 'actions.list', params, consumer, {
          cb: cb2,
        })
      }

      promise.page = getPage
      promise.all = processAll
      return promise
    },

    /**
     * Get sums of actions matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string,
     *   see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for
     *   filter string (if needed).
     * @param {Array<String>} params.groupBy - Action object fields to group by.
     * @param {Number} params.pageSize - **Deprecated. Use sum.page({ size: 1 })
     *   instead.** Number of items to return.
     * @param {PageCallback} [callback] - Optional callback. Use instead of
     *   Promise return value as desired.
     * @returns {PagePromise<Page<ActionSum>>} A promise of results.
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
    sum: (params: ActionSumParams, cb?: PageCallback) => {
      const promise = sharedAPI.queryPage(
        client,
        'actions',
        'sum',
        '/sum-actions',
        params,
        { cb }
      ) as PagePromise<Page>

      const getPage = (pageParams?: PageParams | {}, cb2?: PageCallback) => {
        return sharedAPI.queryPage(
          client,
          'actions',
          'sum',
          '/sum-actions',
          params,
          {
            cb: cb2,
          },
          pageParams
        )
      }
      const processAll = (consumer: Consumer, cb2?: ObjectCallback) => {
        return sharedAPI.queryEach(client, 'actions.sum', params, consumer, {
          cb: cb2,
        })
      }

      promise.page = getPage
      promise.all = processAll
      return promise
    },
  }
}

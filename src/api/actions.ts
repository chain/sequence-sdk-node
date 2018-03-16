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
  all: (
    consumer?: Consumer,
    cb2?: ObjectCallback
  ) => AsyncIterator<any> | Promise<any>
}

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

      const processAll = (consumer?: Consumer, cb2?: ObjectCallback) => {
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
      const processAll = (consumer?: Consumer, cb2?: ObjectCallback) => {
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

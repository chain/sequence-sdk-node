import { Client } from './client'
import { Page } from './page'
import {
  Consumer,
  ObjectCallback,
  PageCallback,
  PageParams,
  sharedAPI,
  SumParams,
} from './shared'

/**
 * A query for Sequence items.
 * @class
 */
export class Query<QueryParamType> {
  /**
   * @hideconstructor
   */
  constructor(
    private client: Client,
    private itemName: string,
    private method: string,
    private queryParams?: QueryParamType
  ) {}

  /**
   * Retrieve a page of results.
   *
   * @param {Object} params={} - Filter and pagination information.
   * @param {String} params.cursor - Cursor for retrieving additional items from a previous call to the query.
   * @param {Number} params.size - Number of items to return in result set.
   * @param {PageCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
   * @returns {Page} Requested page of results.
   */
  public page(pageParams?: PageParams | {}, cb?: PageCallback): Promise<Page> {
    return sharedAPI.queryPage(
      this.client,
      this.itemName,
      this.method,
      `/${this.method}-${this.itemName}`,
      this.queryParams,
      { cb },
      pageParams
    )
  }

  /**
   * Iterate over all query results.
   * Returns an async iterator over the query results.
   *
   * @example <caption>Example usage.</caption>
   * for async (const key of ledger.keys.list().all()) {
   *   console.log("key id: " + key.id)
   * }
   *
   * See {@link https://github.com/tc39/proposal-async-iteration} for more
   * information about async iterators.
   *
   * @param {QueryProcessor} processor - **Deprecated. Use all().next() instead.** Processing callback.
   * @param {ObjectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
   * @returns {AsyncIterableIterator} an async iterator over the query results.
   */
  public all(consumer?: Consumer, cb?: ObjectCallback) {
    return sharedAPI.queryEach(
      this.client,
      `${this.itemName}.${this.method}`,
      this.queryParams,
      consumer,
      {
        cb,
      }
    )
  }
}

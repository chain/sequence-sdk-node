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
   * Process all query results, passing each of them into a user-provided function.
   *
   * @param {QueryProcessor} processor - Processing callback.
   * @param {ObjectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
   * @returns {Page} Requested page of results.
   */
  public all(consumer: Consumer, cb?: ObjectCallback) {
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

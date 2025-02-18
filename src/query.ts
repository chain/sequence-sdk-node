if (typeof (Symbol as any).asyncIterator === 'undefined') {
  // prettier-ignore
  (Symbol as any).asyncIterator =
    Symbol.asyncIterator || Symbol('asyncIterator')
}
import { Client } from './client'
import { Page } from './page'
import { PageParams } from './types'
import { validate } from './validate'

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
  ) {
    if (queryParams) {
      validate(queryParams, 'QueryParamsSchema')
    }
  }

  /**
   * Retrieve a page of results.
   *
   * @param {Object} params={} - Filter and pagination information.
   * @param {String} params.cursor - Cursor for retrieving additional items from a previous call to the query.
   * @param {Number} params.size - Number of items to return in result set.
   * @returns {Page} Requested page of results.
   */
  public async page(pageParams?: PageParams | {}): Promise<Page> {
    const body: { [s: string]: any } = Object.assign({}, this.queryParams)
    if (isPageParams(pageParams)) {
      if (pageParams.cursor) {
        body.cursor = pageParams.cursor
      } else if (pageParams.size) {
        body.pageSize = pageParams.size
      }
    }
    const path = `/${this.method}-${this.itemName}`
    const data = await this.client.request(path, body)
    return new Page(data, this.client, this.itemName, this.method)
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
   * @returns {AsyncIterableIterator} an async iterator over the query results.
   */
  public async *all() {
    const f = (this.client as any)[this.itemName][this.method]
    let page = await f(this.queryParams).page()
    for (const item of page.items) {
      yield item
    }
    while (!page.lastPage) {
      page = await page.nextPage()
      for (const item of page.items) {
        yield item
      }
    }
  }
}

function isPageParams(obj?: PageParams | {}): obj is PageParams {
  const p = obj as PageParams
  return !!p && (!!p.size || !!p.cursor)
}

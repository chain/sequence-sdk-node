if (typeof (Symbol as any).asyncIterator === 'undefined') {
  // prettier-ignore
  (Symbol as any).asyncIterator =
    Symbol.asyncIterator || Symbol('asyncIterator')
}
import { Client } from './client'
import { Page } from './page'

export type PageParams =
  | { size: number; cursor: undefined }
  | { cursor: string; size: undefined }

function isPageParams(obj?: PageParams | {}): obj is PageParams {
  if (obj === undefined) {
    return false
  } else if (
    (obj as PageParams).size === undefined &&
    (obj as PageParams).cursor === undefined
  ) {
    return false
  } else {
    return true
  }
}

export interface QueryParams {
  filter?: string
  filterParams?: Array<string | number>
  cursor?: string
}

export interface SumParams extends QueryParams {
  groupBy?: string[]
}

/**
 * Called once for each item in the result set.
 *
 * @callback QueryProcessor
 * @param {Object} item - Item to process.
 * @param {function(err)} done - Call to terminate iteration through the result
 *                               set. Accepts an optional error argument which
 *                               will be passed to the promise rejection or
 *                               callback depending on async calling style.
 */

const getApi = (client: any, memberPath: string) => {
  let queryOwner = client
  memberPath.split('.').forEach(member => {
    queryOwner = queryOwner[member]
  })

  return queryOwner
}

async function* queryIterator(client: Client, memberPath: string, params = {}) {
  let page = await getApi(client, memberPath)(params).page()
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

export const sharedAPI = {
  queryPage: (
    client: Client,
    memberPath: string,
    method: string,
    path: string,
    params = {},
    opts: {} = {},
    pageParams?: PageParams | {}
  ) => {
    const body: { [s: string]: any } = Object.assign({}, params)
    if (isPageParams(pageParams)) {
      if (pageParams.cursor) {
        body.cursor = pageParams.cursor
      } else if (pageParams.size) {
        body.pageSize = pageParams.size
      }
    }
    return client
      .request(path, body)
      .then((data: object) => new Page(data, client, memberPath, method))
  },

  queryEach: (
    client: Client,
    memberPath: string,
    params = {},
    opts: {} = {}
  ): any => {
    return queryIterator(client, memberPath, params)
  },
}

export interface CreateRequest {
  id?: string
  keyIds?: string[]
  quorum?: number
  tags?: { [s: string]: any }
}

export interface UpdateTagsRequest {
  id: string
  tags?: { [s: string]: any }
}

export interface Key {
  id: string
}

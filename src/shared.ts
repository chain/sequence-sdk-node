if (typeof (Symbol as any).asyncIterator === 'undefined') {
  // prettier-ignore
  (Symbol as any).asyncIterator =
    Symbol.asyncIterator || Symbol('asyncIterator')
}
import { Client } from './client'
import { Page } from './page'

export type Consumer = (item: any, done: () => void) => any

/**
 * @callback objectCallback
 * @param {error} error
 * @param {Object} object - Object response from API.
 */

export type ObjectCallback = (
  error: Error | null,
  object: object | null
) => void

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

export type PageCallback = (error: Error | null, page: Page | null) => void

export interface QueryParams {
  filter?: string
  filterParams?: Array<string | number>
  pageSize?: number
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
    consumer?: Consumer,
    opts: {} = {}
  ): any => {
    if (!consumer) {
      return queryIterator(client, memberPath, params)
    } else {
      return sharedAPI.queryEachAsync(
        client,
        memberPath,
        params,
        consumer,
        opts
      )
    }
  },

  queryEachAsync: async (
    client: Client,
    memberPath: string,
    params = {},
    consumer: Consumer,
    opts: {} = {}
  ) => {
    const processPages = async () => {
      let over = false
      let error
      // to pass to the consumer
      function done(err?: any) {
        over = true
        if (err) {
          error = err
        }
      }

      let page
      const splitPath = memberPath.split('.')
      const method = splitPath[splitPath.length - 1]
      if (method === 'list' || method === 'sum') {
        page = await getApi(client, memberPath)(params).page()
      } else {
        page = await getApi(client, memberPath).queryPage(params)
      }
      while (!over) {
        for (const item of page.items) {
          // Pass the item to the processor.
          //
          // If the consumer calls done(), it ends the loop
          // (and possibly causes the promise to reject).
          //
          // If the consumer returns a promise that throws an error, it
          // will bubble up and cause this promise to throw an error.
          await consumer(item, done)
          if (over) {
            if (error !== undefined) {
              throw error
            }
            break
          }
        }
        if (page.lastPage) {
          over = true
        } else {
          page = await page.nextPage()
        }
      }
    }

    return processPages()
  },

  queryAll: (
    client: Client,
    memberPath: string,
    params = {},
    opts: {} = {}
  ) => {
    const items: any = []

    const result = sharedAPI
      .queryEach(client, memberPath, params, (item: object) => {
        items.push(item)
      })
      .then(() => items)

    return result
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

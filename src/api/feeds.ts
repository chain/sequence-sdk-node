import * as uuid from 'uuid'
import { Client } from '../client'
import { Query } from '../query'
import { ObjectCallback, QueryParams } from '../shared'
import { CreateRequest, sharedAPI } from '../shared'

export interface FeedCreateParameters extends QueryParams {
  type?: string
  id?: string
}

/**
 * A single action feed or transaction feed that can be consumed.
 * More info: {@link https://dashboard.seq.com/docs/feeds}
 * @class
 *
 * @property {String} id
 * Unique identifier of the feed.
 *
 * @property {String} type
 * Type of feed, "action" or "transaction".
 *
 * @property {String} filter
 * The query filter used to select matching items.
 *
 * @property {Array<string | number>} filterParams
 * A list of values that will be interpolated into the filter expression.
 */
export class Feed {
  public id: string
  public type: string
  public filter: string
  public filterParams: any[]

  private client: Client
  private prevCursor: string
  private cursor: string // (cursor === prevCursor) means ack'd
  private page: {
    items: any[]
    cursors: string[]
  }

  /**
   * Creates a new feed consumer.
   *
   * @param  {Object} data API response for a creation/retrieval of a feed.
   * @param  {Client} client Chain Client.
   */
  constructor(data: object, client: Client) {
    Object.assign(this, data)
    this.client = client
    this.prevCursor = this.cursor
    this.page = { items: [], cursors: [] }
  }

  /**
   * Ack ("acknowledge") saves a feed's position so that a future
   * call to next picks up where the last one left off. Without
   * ack, some of the same items may be redelivered by
   * the feed. The feed does its own internal acks from time to time.
   */
  public async ack() {
    if (this.cursor === this.prevCursor) {
      return
    }
    await this.client.request('/ack-feed', {
      id: this.id,
      cursor: this.cursor,
      previousCursor: this.prevCursor,
    })
    this.prevCursor = this.cursor
  }

  // Advertise that 'this' follows the async iterator protocol.
  public [Symbol.asyncIterator]() {
    return this
  }

  /**
   * Retrieve the next feed result, if available.
   * This method satisfies the async iterator interface.
   *
   * @example <caption>Example usage.</caption>
   * const feed = await ledger.feeds.get(id: 'my-feed')
   * for await (const action of feed) {
   *   console.log("action id: " + action.id)
   * }
   *
   * See {@link https://github.com/tc39/proposal-async-iteration} for more
   * information about async iterators.
   *
   * @return a { value, done } tuple.
   */
  public async next() {
    while (this.page.items.length === 0) {
      const req = { id: this.id }
      this.page = await this.client.request('/stream-feed-items', req)
    }
    const v = this.page.items.shift()
    this.cursor = this.page.cursors.shift() as string
    return { value: v }
  }
}

/**
 * API for interacting with {@link Feed feeds}.
 * You can use feeds to process actions/transactions as they arrive on the
 * blockchain. This is helpful for real-time applications such as notifications
 * or live-updating interfaces.
 *
 * More info: {@link https://dashboard.seq.com/docs/feeds}
 * @module FeedsApi
 */
export const feedsAPI = (client: Client) => {
  /**
   * @typedef {Object} createRequest
   *
   * @property {String} id
   * Unique identifier of the feed.
   *
   * @property {String} type
   * Type of feed, "action" or "transaction".
   *
   * @property {String} filter
   * The query filter used to select matching items.
   *
   * @property {Array<string | number>} filterParams
   * A list of values that will be interpolated into the filter expression.
   */

  /**
   * @typedef {Object} deleteRequest
   *
   * @property {String} id
   * Unique identifier of the feed.
   */

  /**
   * @typedef {Object} getRequest
   *
   * @property {String} id
   * Unique identifier of the feed.
   */

  return {
    /**
     * Create a new feed.
     *
     * @param {module:FeedsApi~createRequest} params - Parameters for feed creation.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Feed>} Newly created feed.
     */
    create: (params: FeedCreateParameters, cb?: ObjectCallback) =>
      sharedAPI.tryCallback(
        client
          .request('/create-feed', params)
          .then(data => new Feed(data, client)),
        cb
      ),

    /**
     * Deletes a feed.
     *
     * @param {module:FeedsApi~deleteRequest} params - Parameters for feed deletion.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise} Promise resolved on success.
     */
    delete: (params: { id: string }, cb?: ObjectCallback) =>
      sharedAPI.tryCallback(client.request('/delete-feed', params), cb),

    /**
     * Retrieves a single feed.
     *
     * @param {module:FeedsApi~getRequest} params - Parameters for feed retrieval.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Feed>} Requested feed.
     */
    get: (params: { id: string }, cb?: ObjectCallback) =>
      sharedAPI.tryCallback(
        client
          .request('/get-feed', params)
          .then(data => new Feed(data, client)),
        cb
      ),

    /**
     * Query a list of feeds.
     *
     * @returns {Query} Query to retrieve results.
     */
    list: () => new Query(client, 'feeds', 'list'),
  }
}

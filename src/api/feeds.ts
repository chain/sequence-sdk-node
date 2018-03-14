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
 *
 * @property {String} cursor
 * The position where the next call to consume should begin.
 */
export class Feed {
  public id: string
  public type: string
  public filter: string
  public filterParams: any[]
  public cursor: string
  public client: Client
  public nextCursor: any

  /**
   * Called once for every item received via the feed.
   *
   * @callback FeedProcessor
   * @param {Object} item - Item to process.
   * @param {function(Boolean)} next - Continue to the next item when it becomes
   *                                   available. Passing true to this callback
   *                                   will update the feed to acknowledge that
   *                                   the current item was consumed.
   * @param {function(Boolean)} stop - Terminate the processing loop. Passing
   *                                   true to this callback will update the
   *                                   feed to acknowledge that the current item
   *                                   was consumed.
   * @param {function(Error)} fail - Terminate the processing loop due to an
   *                                 application-level error. This callback
   *                                 accepts an optional error argument. The
   *                                 feed will not be updated, and the current
   *                                 item will not be acknowledged.
   */

  /**
   * Creates a new feed consumer.
   *
   * @param  {Object} data API response for a creation/retrieval of a feed.
   * @param  {Client} client Chain Client.
   */
  constructor(data: object, client: Client) {
    Object.assign(this, data)
    this.client = client
  }

  /**
   * Ack ("acknowledge") saves a feed's position so that a future
   * call to consume picks up where the last one left off. Without
   * ack, some of the same items may be redelivered by
   * consume. Consume does its own internal acks from time to time.
   */
  public ack() {
    if (this.nextCursor) {
      return this.client
        .request('/ack-feed', {
          id: this.id,
          cursor: this.nextCursor,
          previousCursor: this.cursor,
        })
        .then(() => {
          this.cursor = this.nextCursor
          this.nextCursor = null
        })
    }
  }

  /**
   * Process items returned from a feed in real-time.
   *
   * @param {FeedProcessor} consumer - Called once with each item to do any
   *                                   desired processing. The callback can
   *                                   optionally choose to terminate the loop.
   */
  public consume(consumer: any) {
    const promise = new Promise((resolve, reject) => {
      const nextPage = () => {
        this.client
          .request('/stream-feed-items', {
            id: this.id,
          })
          .then(page => {
            let index = 0
            let prevItem: object

            const stop = (shouldAck?: boolean) => {
              let position: any
              if (shouldAck) {
                position = this.ack()
              } else {
                position = Promise.resolve()
              }
              position.then(resolve).catch(reject)
            }

            const next = (shouldAck?: boolean) => {
              let position: any
              if (shouldAck && prevItem) {
                position = this.ack()
              } else {
                position = Promise.resolve()
              }

              position
                .then(() => {
                  if (index >= page.items.length) {
                    nextPage()
                    return
                  }

                  prevItem = page.items[index]
                  this.nextCursor = page.cursors[index]
                  index++

                  // Pass the next item to the consumer, as well as three loop
                  // operations:
                  //
                  // - next(shouldAck): maybe ack, then continue/long-poll to next item.
                  // - stop(shouldAck): maybe ack, then terminate the loop by fulfilling the outer promise.
                  // - fail(err): terminate the loop by rejecting the outer promise.
                  //              Use this if you want to bubble an async error up to
                  //              the outer promise catch function.
                  //
                  // The consumer can also terminate the loop by returning a promise
                  // that will reject.

                  const res = consumer(prevItem, next, stop, reject)
                  if (res && typeof res.catch === 'function') {
                    res.catch(reject)
                  }
                })
                .catch(reject) // fail consume loop on ack failure, or on thrown exceptions from "then" function
            }

            next()
          })
          .catch(reject) // fail consume loop on query failure
      }

      nextPage()
    })
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

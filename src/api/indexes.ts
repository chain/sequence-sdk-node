import { Client } from '../client'
import { Page } from '../page'
import { Query } from '../query'

/**
 * Indexes are used to pre-compute queries that could potentially be slow.
 *
 * More info: {@link https://dashboard.seq.com/docs/indexes}
 * @typedef {Object} Index
 * @global
 *
 * @property {String} id
 * Unique identifier of the index.
 *
 * @property {String} type
 * Type of index, currently must be "token".
 *
 * @property {String} method
 * Method for index, currently must be "sum".
 *
 * @property {String[]} groupBy
 * Token object fields to group by.
 *
 * @property {String} filter
 * The query filter used to select matching items.
 */

/**
 * API for interacting with {@link Index indexes}.
 *
 * More info: {@link https://dashboard.seq.com/docs/indexes}
 * @module IndexesApi
 */

export const indexesAPI = (client: Client) => {
  return {
    /**
     * Create a new index.
     *
     * @param {Object} params - Parameters for index creation.
     * @param {String} params.type - Type of index, currently only "token".
     * @param {String} params.method - Method for index, currently only "sum".
     * @param {String} params.filter - filter string, see {@link https://dashboard.seq.com/docs/filters}.
     * @param {Array<String>} params.groupBy - object fields to group by.
     * @param {String} params.id - Unique identifier. Will be auto-generated if
     *   not provided.
     * @returns {Promise<Index>} Newly created index.
     */
    create: (params: {
      type: string
      method: string
      id?: string
      filter: string
      groupBy?: string[]
    }) => {
      return client.request('/create-index', params, 'CreateIndexSchema')
    },

    /**
     * Deletes an index.
     *
     * @param {module:IndexesApi~deleteRequest} params - Parameters for index deletion.
     * @returns {Promise} Promise resolved on success.
     */
    delete: (params: { id: string }) => client.request('/delete-index', params),

    /**
     * Query a list of indexes matching the specified query.
     *
     * @returns {Query} Query to retrieve results.
     */
    list: () => new Query(client, 'indexes', 'list'),
  }
}

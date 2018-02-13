import * as uuid from 'uuid'
import { Client } from '../client'
import { Consumer, ObjectCallback, PageCallback, QueryParams } from '../shared'
import { CreateRequest, sharedAPI, UpdateTagsRequest } from '../shared'

/**
 * A flavor is a type of value that can be issued on a blockchain. All units of
 * a given flavor are fungible. Units of a flavor can be transacted directly
 * between parties without the involvement of the issuer.
 *
 * More info: {@link https://dashboard.seq.com/docs/flavors}
 * @typedef {Object} Flavor
 * @global
 *
 * @property {String} id
 * Unique identifier of the flavor.
 *
 * @property {Key[]} keys
 * The list of keys used to issue units of the flavor.
 *
 * @property {Number} quorum
 * The number of signatures required to issue new units of the flavor.
 *
 * @property {Object} tags
 * User-specified tag structure for the flavor.
 */

/**
 * API for interacting with {@link Flavor flavors}.
 *
 * More info: {@link https://dashboard.seq.com/docs/flavors}
 * @module FlavorsApi
 */
export const flavorsAPI = (client: Client) => {
  /**
   * @typedef {Object} createRequest
   *
   * @property {String} [id]
   * Unique identifier. Will be auto-generated if not provided.
   *
   * @property {Key[]} keys
   * The list of keys used to create the issuance program for the flavor. Keys
   * are objects with an `id` field.
   *
   * @property {Number} [quorum]
   * The number of keys required to issue units of the flavor. Defaults to the
   * size of rootXpubs.
   *
   * @property {Object} [tags]
   * User-specified, arbitrary/unstructured data.
   */

  /**
   * @typedef {Object} updateTagsRequest
   *
   * @property {String} id
   * The flavor ID.
   *
   * @property {Object} [tags]
   * A new set of tags, which will replace the existing tags.
   */

  return {
    /**
     * Create a new flavor.
     *
     * @param {module:FlavorsApi~createRequest} params - Parameters for flavor creation.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Flavor>} Newly created flavor.
     */
    create: (params: CreateRequest, cb?: ObjectCallback) =>
      sharedAPI.tryCallback(client.request('/create-flavor', params), cb),

    /**
     * Update flavor tags.
     *
     * @param {module:FlavorsApi~updateTagsRequest} params - Parameters for updating flavor tags.
     * @param {objectCallback} [cb] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Object>} Success message.
     */
    updateTags: (params: UpdateTagsRequest, cb?: ObjectCallback) =>
      sharedAPI.tryCallback(client.request('/update-flavor-tags', params), cb),

    /**
     * Get one page of flavors matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {pageCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Page<Flavor>>} Requested page of results.
     */
    list: (params: QueryParams, cb?: PageCallback) =>
      sharedAPI.queryPage(
        client,
        'flavors',
        'queryPage',
        '/list-flavors',
        params,
        { cb }
      ),
  }
}

import * as uuid from 'uuid'
import { Client } from '../client'
import { Consumer, ObjectCallback, PageCallback, QueryParams } from '../shared'
import { CreateRequest, sharedAPI, UpdateTagsRequest } from '../shared'

/**
 * **Deprecated. Use Flavor instead.**
 * An asset is a type of value that can be issued on a blockchain. All units of
 * a given asset are fungible. Units of an asset can be transacted directly
 * between parties without the involvement of the issuer.
 *
 * More info: {@link https://dashboard.seq.com/docs/assets}
 * @typedef {Object} Asset
 * @global
 *
 * @property {String} id
 * Globally unique identifier of the asset.
 * Asset version 1 specifies the asset id as the hash of:
 * - the asset version
 * - the asset's issuance program
 * - the ledger's VM version
 * - the hash of the network's initial block
 *
 * @property {String} alias
 * User specified, unique identifier.
 *
 * @property {Key[]} keys
 * The list of keys used to issue units of the asset.
 *
 * @property {Number} quorum
 * The number of signatures required to issue new units of the asset.
 *
 * @property {Object} tags
 * User-specified tag structure for the asset.
 */

/**
 * **Deprecated. Use FlavorsApi instead.**
 * API for interacting with {@link Asset assets}.
 *
 * More info: {@link https://dashboard.seq.com/docs/assets}
 * @module AssetsApi
 */
export const assetsAPI = (client: Client) => {
  /**
   * **Deprecated. Use `flavors.createRequest` instead.**
   *
   * @typedef {Object} createRequest
   *
   * @property {String} [alias]
   * User specified, unique identifier.
   *
   * @property {Key[]} keys
   * The list of keys used to create the issuance program for the asset. Keys
   * are objects with either an `id` or `alias` field.
   *
   * @property {Number} [quorum]
   * The number of keys required to issue units of the asset. Defaults to the
   * size of rootXpubs.
   *
   * @property {Object} [tags]
   * User-specified, arbitrary/unstructured data.
   */

  /**
   * **Deprecated. Use `flavors.updateTagsRequest` instead.**
   *
   * @typedef {Object} updateTagsRequest
   *
   * @property {String} [id]
   * The asset ID. Either the ID or alias must be specified, but not both.
   *
   * @property {String} [alias]
   * The asset alias. Either the ID or alias must be specified, but not both.
   *
   * @property {Object} [tags]
   * A new set of tags, which will replace the existing tags.
   */

  return {
    /**
     * **Deprecated. Use `flavors.create` instead.**
     * Create a new asset.
     *
     * @param {module:AssetsApi~createRequest} params - Parameters for asset creation.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Asset>} Newly created asset.
     */
    create: (params: CreateRequest, cb?: ObjectCallback) =>
      sharedAPI.tryCallback(client.request('/create-asset', params), cb),

    /**
     * **Deprecated. Use `flavors.updateTags` instead.**
     * Update asset tags.
     *
     * @param {module:AssetsApi~updateTagsRequest} params - Parameters for updating asset tags.
     * @param {objectCallback} [cb] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Object>} Success message.
     */
    updateTags: (params: UpdateTagsRequest, cb?: ObjectCallback) =>
      sharedAPI.tryCallback(client.request('/update-asset-tags', params), cb),

    /**
     * **Deprecated. Use `flavors.list` instead.**
     * Get one page of assets matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {PageCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Page<Asset>>} Requested page of results.
     */
    queryPage: (params: QueryParams, cb?: PageCallback) =>
      sharedAPI.queryPage(
        client,
        'assets',
        'queryPage',
        '/list-assets',
        params,
        { cb }
      ),

    /**
     * **Deprecated. Use `flavors.list` instead.**
     * Iterate over all assets matching the specified query, calling the
     * supplied consume callback once per item.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of itemsss to return in result set.
     * @param {QueryProcessor<Asset>} processor - Processing callback.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise} A promise resolved upon processing of all items, or
     *                   rejected on error.
     */
    queryEach: (params: QueryParams, consumer: Consumer, cb: any) =>
      sharedAPI.queryEach(client, 'assets', params, consumer, { cb }),

    /**
     * **Deprecated. Use `flavors.list` instead.**
     * Fetch all assets mathcing the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Asset[]>} A promise resolved upon processing of all items, or
     *                   rejected on error.
     */
    queryAll: (params?: QueryParams, cb?: ObjectCallback) =>
      sharedAPI.queryAll(client, 'assets', params, { cb }),
  }
}

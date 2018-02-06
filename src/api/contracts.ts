import { Client } from '../client'
import {
  Consumer,
  ObjectCallback,
  PageCallback,
  QueryParams,
  sharedAPI,
} from '../shared'

/**
 * Each new transaction in the blockchain consumes some contracts and
 * creates others. A contract is considered unspent when it has not yet been used
 * as an input to a new transaction. All asset units on a blockchain exist in
 * the contract set.
 *
 * @typedef {Object} Contract
 * @global
 *
 * @property {String} id
 * Unique transaction identifier.
 *
 * @property {String} type
 * The type of the contract. Possible values are "control" and "retire".
 *
 * @property {String} transactionId
 * The transaction containing the contract.
 *
 * @property {Number} position
 * The contract's position in a transaction's list of conracts.
 *
 * @property {String} assetId
 * The id of the asset being issued or spent.
 *
 * @property {String} assetAlias
 * The alias of the asset being issued or spent (possibly null).
 *
 * @property {Object} assetTags
 * The tags of the asset being issued or spent (possibly null).
 *
 * @property {Number} amount
 * The number of units of the asset being issued or spent.
 *
 * @property {String} accountId
 * The id of the account transferring the asset (possibly null).
 *
 * @property {String} accountAlias
 * **Deprecated. Use accountId instead.**
 * The alias of the account transferring the asset (possibly null).
 *
 * @property {Object} accountTags
 * The tags associated with the account (possibly null).
 *
 * @property {String} controlProgram
 * The control program which must be satisfied to transfer this contract.
 *
 * @property {Object} referenceData
 * User specified, unstructured data embedded within an contract (possibly null).
 */

export interface ContractQueryParameters extends QueryParams {
  timestamp?: number
}

/**
 * API for interacting with {@link Contract contracts}.
 * @module ContractsApi
 */
export const contractsAPI = (client: Client) => {
  return {
    /**
     * Get one page of contracts matching the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Integer} params.timestamp - A millisecond Unix timestamp. By using this parameter, you can perform queries that reflect the state of the blockchain at different points in time.
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {pageCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Page<Contract>>} Requested page of results.
     */
    queryPage: (params: ContractQueryParameters, cb?: PageCallback) =>
      sharedAPI.queryPage(
        client,
        'contracts',
        'queryPage',
        '/list-contracts',
        params,
        {
          cb,
        }
      ),

    /**
     * Iterate over all contracts matching the specified query, calling the
     * supplied consume callback once per item.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Integer} params.timestamp - A millisecond Unix timestamp. By using this parameter, you can perform queries that reflect the state of the blockchain at different points in time.
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {QueryProcessor<Contract>} processor - Processing callback.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise} A promise resolved upon processing of all items, or
     *                   rejected on error.
     */
    queryEach: (
      params: ContractQueryParameters,
      consumer: Consumer,
      cb?: ObjectCallback
    ) => sharedAPI.queryEach(client, 'contracts', params, consumer, { cb }),

    /**
     * Fetch all contracts mathcing the specified query.
     *
     * @param {Object} params={} - Filter and pagination information.
     * @param {String} params.filter - Filter string, see {@link https://dashboard.seq.com/docs/queries}.
     * @param {Array<String|Number>} params.filterParams - Parameter values for filter string (if needed).
     * @param {Integer} params.timestamp - A millisecond Unix timestamp. By using this parameter, you can perform queries that reflect the state of the blockchain at different points in time.
     * @param {Number} params.pageSize - Number of items to return in result set.
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Contract[]>} A promise resolved upon processing of all items, or
     *                   rejected on error.
     */
    queryAll: (params: ContractQueryParameters, cb?: ObjectCallback) =>
      sharedAPI.queryAll(client, 'contracts', params, { cb }),
  }
}

import { Client } from '../client'
import { ObjectCallback, sharedAPI } from '../shared'

/**
 * Summary information about a ledger.
 *
 * @typedef {Object} Stats
 *
 * @property {Number} assetCount
 * @property {Number} accountCount
 * @property {Number} txCount
 */

/**
 * API for interacting with {@link Stats stats}
 * @module StatsApi
 */
export const statsAPI = (client: Client) => {
  return {
    /**
     * Retrieves summary information from the ledger.
     *
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Stats>} Ledger summary information.
     */
    get: (cb?: ObjectCallback) =>
      sharedAPI.tryCallback(client.request('/stats'), cb),
  }
}

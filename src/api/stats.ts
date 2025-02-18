import { Client } from '../client'

/**
 * Summary information about a ledger.
 *
 * @typedef {Object} Stats
 *
 * @property {Number} flavorCount
 * @property {Number} accountCount
 * @property {Number} txCount
 * @property {String} ledgerType
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
     * @returns {Promise<Stats>} Ledger summary information.
     */
    get: () => client.request('/stats'),
  }
}

import { Client } from '../client'
import { ObjectCallback, sharedAPI } from '../shared'

/**
 * Summary information about a ledger.
 *
 * @typedef {Object} Stats
 *
 * @property {Number} flavorCount
 * @property {Number} accountCount
 * @property {Number} txCount
 */

// TODO(kr): remove this once backend sends flavor_count
const fixFlavor = async (p: Promise<any>) => {
  const stats = await p
  if (!stats.flavorCount) {
    stats.flavorCount = stats.assetCount
    delete stats.assetCount
  }
  return stats
}

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
      sharedAPI.tryCallback(fixFlavor(client.request('/stats')), cb),
  }
}

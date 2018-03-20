import { Client } from '../client'

/**
 * API for development-only functions
 * @module DevUtilsApi
 */
export const devUtilsAPI = (client: Client) => {
  return {
    /**
     * Retrieves summary information from the ledger.
     *
     * @returns {Promise<Stats>} Ledger summary information.
     */
    reset: () => client.request('/reset', {}),
  }
}

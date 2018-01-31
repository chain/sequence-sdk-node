import * as uuid from 'uuid'
import { Client } from '../client'
import { ObjectCallback, sharedAPI } from '../shared'

/**
 * API for development-only functions
 * @module DevUtilsApi
 */
export const devUtilsAPI = (client: Client) => {
  return {
    /**
     * Retrieves summary information from the ledger.
     *
     * @param {objectCallback} [callback] - Optional callback. Use instead of Promise return value as desired.
     * @returns {Promise<Stats>} Ledger summary information.
     */
    reset: (cb?: ObjectCallback) =>
      sharedAPI.tryCallback(client.request('/reset', {}), cb),
  }
}

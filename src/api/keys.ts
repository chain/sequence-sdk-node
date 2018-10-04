import { Client } from '../client'
import { Page } from '../page'
import { Query } from '../query'

/**
 * Cryptographic private keys are the primary authorization mechanism on a
 * blockchain.
 *
 * More info: {@link https://dashboard.seq.com/docs/keys}
 *
 * @typedef {Object} Key
 * @global
 *
 * @property {String} id
 * Unique identifier of the key.
 */

/**
 * API for interacting with {@link Key keys}.
 *
 * More info: {@link https://dashboard.seq.com/docs/keys}
 * @module KeysApi
 */

export const keysAPI = (client: Client) => {
  return {
    /**
     * Create a new key.
     *
     * @param {Object} params - Parameters for key creation.
     * @param {String} params.id - Unique identifier. Will be auto-generated if
     *   not provided.
     * @returns {Promise<Key>} Newly created key.
     */
    create: (params?: { id?: string }) => {
      return client.request('/create-key', params, 'CreateKeySchema')
    },

    /**
     * Query a list of keys matching the specified query.
     *
     * @returns {Query} Query to retrieve results.
     */
    list: () => new Query(client, 'keys', 'list'),
  }
}

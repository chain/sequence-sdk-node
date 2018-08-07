// FIXME: Microsoft Edge has issues returning errors for responses
// with a 401 status. We should add browser detection to only
// use the ponyfill for unsupported browsers.
import * as uuid from 'uuid'

import { readFileSync } from 'fs'
import { Agent } from 'https'
import { errors } from './errors'

const crypto = require('crypto')
// some ugly business to get the right types for fetch while still polyfilling
const fetch: typeof window.fetch = require('fetch-ponyfill')().fetch
const JSONbig = require('json-bigint')
const version: string = require('../package.json').version

const userJsonAttributes = [
  'account_tags',
  'action_tags',
  'after',
  'destination_account_tags',
  'flavor_tags',
  'next',
  'source_account_tags',
  'tags',
  'token_tags',
]

export interface ApiObject {
  [key: string]: string | number | ApiObject
}

const snakeize = (object: ApiObject) => {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      let value = object[key]
      let newKey = key

      // Skip all-caps keys
      if (/^[A-Z]+$/.test(key)) {
        continue
      }

      if (/[A-Z]/.test(key)) {
        newKey = key.replace(/([A-Z])/g, v => `_${v.toLowerCase()}`)
        delete object[key]
      }

      if (
        typeof value === 'object' &&
        userJsonAttributes.indexOf(newKey) === -1
      ) {
        value = snakeize(value)
      }

      object[newKey] = value
    }
  }

  return object
}

const camelize = (object: ApiObject) => {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      let value = object[key]
      let newKey = key

      if (/_/.test(key)) {
        newKey = key.replace(/([_][a-z])/g, v => v[1].toUpperCase())
        delete object[key]
      }

      if (typeof value === 'object' && userJsonAttributes.indexOf(key) === -1) {
        value = camelize(value)
      }

      object[newKey] = value
    }
  }

  return object
}

/**
 * @class
 * Information about the connection to the Sequence API.
 */
export class Connection {
  public static snakeize = snakeize
  public static camelize = camelize
  public retryTimeoutMs = 120000 // two minutes
  public retryConnectionTimeoutMs = 5000 // 5 seconds
  public retryBaseDelayMs = 40
  public retryMaxDelayMs = 20000
  public credential?: string
  public agent?: Agent
  public ledgerName: string
  private ledgerUrl: string
  private deadline: number

  /**
   * constructor - create a new Sequence client object.
   *
   * @param {String} ledgerName   Ledger name.
   * @param {String} credential   Sequence credential for API access.
   * @param {https.Agent} agent   https agent for optional TLS/network config.
   * @returns {Client}
   */
  constructor(ledgerName: string, credential?: string, agent?: Agent) {
    this.ledgerName = ledgerName
    this.credential = credential
    this.agent = agent
  }

  /**
   * Submit a request to the configured ledger.
   *
   * @param  {String} path
   * @param  {object} [body={}]
   * @returns {Promise}
   */
  public async request(
    path: string,
    body = {},
    headers = {}
  ): Promise<ApiObject> {
    if (!this.ledgerUrl) {
      await this.getLedgerUrl()
    }

    if (!this.deadline || Date.now() >= this.deadline) {
      // Extend the deadline long enough to get a fresh addr.
      this.deadline = Date.now() + this.retryTimeoutMs

      // Do not block current request. Update deadline, ledgerUrl in background.
      this.getLedgerUrl()
    }

    const reqId = crypto.randomBytes(10).toString('hex')
    return this.requestRaw(
      this.ledgerUrl + path,
      body,
      Object.assign({}, headers, {
        Credential: this.credential,
        'Idempotency-Key': uuid.v4(),
        'Name-Set': 'camel',
      }),
      reqId
    )
  }

  public async requestRaw(
    url: string,
    requestBody = {},
    headers = {},
    reqId = '',
    previousStartTime?: number,
    attempt = 1
  ): Promise<ApiObject> {
    if (!requestBody) {
      requestBody = {}
    }

    const attemptId = `${reqId}/${attempt}`
    const startTime = previousStartTime || Date.now()

    const retry = async (errIfTimeout: Error, timeout: number) => {
      // exponential backoff

      const backoffFactor = 2 ** (attempt - 1)

      const delay = Math.min(
        this.retryBaseDelayMs * backoffFactor,
        this.retryMaxDelayMs
      )

      await sleep(delay)

      if (Date.now() - startTime > timeout) {
        throw errIfTimeout
      }
      return this.requestRaw(
        url,
        requestBody,
        headers,
        reqId,
        startTime,
        attempt + 1
      )
    }

    // Convert camelcased request body field names to use snakecase for API
    // processing.
    const snakeBody = snakeize(requestBody) // Ssssssssssss

    headers = Object.assign(
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Id: attemptId,
      },
      headers
    )

    // Node-only, User-Agent not allowed to be overriden in web browsers
    if (typeof window === 'undefined') {
      headers = Object.assign(
        { 'User-Agent': 'sequence-sdk-node/' + version },
        headers
      )
    }

    // TypeScript's DOM-based RequestInfo "type" doesn't have an "agent" prop
    const req: any = {
      method: 'POST',
      headers,
      body: JSONbig.stringify(snakeBody),
    }

    if (this.agent) {
      req.agent = this.agent
    } else {
      req.agent = new Agent({ keepAlive: true })
    }

    const cafile = process.env.SEQTLSCA
    if (cafile) {
      req.agent.options.ca = readFileSync(cafile)
    }

    let resp: Response

    try {
      resp = await fetch(url, req)
    } catch (err) {
      return retry(
        new errors.ConnectivityError(err, attemptId),
        this.retryConnectionTimeoutMs
      )
    }

    const requestId = resp.headers.get('Chain-Request-Id')
    if (!requestId) {
      return retry(
        new errors.NoRequestIdError(resp),
        this.retryConnectionTimeoutMs
      )
    }

    if (resp.status === 204) {
      return { status: 204 }
    }

    let body
    try {
      const text = await resp.text()
      body = JSONbig.parse(text)
      body = filterLegacyData(body)
    } catch {
      throw new errors.JsonError(resp)
    }
    if (resp.status / 100 === 2) {
      Object.defineProperty(body, '_rawResponse', { writable: true })
      body._rawResponse = resp
      return camelize(body)
    }

    let errClass = errors.BadRequestError
    if (resp.status === 404) {
      errClass = errors.NotFoundError
    } else if (resp.status / 100 === 5) {
      errClass = errors.ServerError
    } else {
      errClass = errors.BadRequestError
    }

    const err = new errClass(resp, camelize(body) as any)

    if (body.retriable) {
      return retry(err, this.retryTimeoutMs)
    } else {
      throw err
    }
  }

  public async getLedgerUrl() {
    const body = (await this.requestRaw(
      'https://' + (process.env.SEQADDR || 'api.seq.com') + '/hello',
      {
        ledger_name: this.ledgerName,
      },
      { Credential: this.credential }
    )) as any

    this.deadline = Date.now() + body.addrTtlSeconds * 1000
    this.ledgerUrl =
      'https://' + body.addr + '/' + body.teamName + '/' + this.ledgerName
  }
}

const legacyAttributes = [
  'after',
  'alias',
  'asset_alias',
  'asset_count',
  'asset_id',
  'asset_tags',
  'code',
  'contract_version',
  'contracts',
  'destination_account_alias',
  'destination_account_tags',
  'keys',
  'next',
  'reference_data',
  'source_account_alias',
  'source_account_tags',
]

const filterLegacyData = (input: any) => {
  const keys = Object.keys(input)
  keys.forEach(key => {
    const value = input[key]
    if (legacyAttributes.includes(key)) {
      delete input[key]
    } else {
      if (
        typeof value === 'object' &&
        value != null &&
        !userJsonAttributes.includes(key)
      ) {
        input[key] = filterLegacyData(value)
      }
    }
  })

  return input
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

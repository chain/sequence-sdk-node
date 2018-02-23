// FIXME: Microsoft Edge has issues returning errors for responses
// with a 401 status. We should add browser detection to only
// use the ponyfill for unsupported browsers.
import * as uuid from 'uuid'

// some ugly business to get the right types for fetch while still polyfilling
const fetch: typeof window.fetch = require('fetch-ponyfill')().fetch
import { Agent } from 'https'
import { errors } from './errors'

export interface SessionToken {
  secret: string
  refreshAt: number
}

const blacklistAttributes = [
  'after',
  'asset_tags',
  'account_tags',
  'next',
  'reference_data',
  'tags',
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
        blacklistAttributes.indexOf(newKey) === -1
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

      if (
        typeof value === 'object' &&
        blacklistAttributes.indexOf(key) === -1
      ) {
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
  public baseUrl: string
  public credential?: string
  public agent?: Agent
  public ledgerName: string
  public sessionBaseUrl: string
  public ledgerUrl: string
  public sessTok: { secret: string; refreshAt: number }

  /**
   * constructor - create a new Sequence client object.
   *
   * @param {String} ledgerName   Ledger alias or ID.
   * @param {String} credential   Sequence credential for API access.
   * @param {String} agent        https.Agent used to provide TLS config.
   * @returns {Client}
   */
  constructor(ledgerName: string, credential?: string, agent?: Agent) {
    const host = process.env.SEQADDR || 'api.seq.com'
    this.baseUrl = 'https://' + host
    this.sessionBaseUrl = 'https://session-' + host
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
    if (this.needRefresh()) {
      await this.refreshSession()
      return this.request(path, body, headers)
    }
    return this.requestRaw(
      this.ledgerUrl + path,
      body,
      Object.assign({}, headers, {
        Macaroon: this.credential,
        'Discharge-Macaroon': this.sessTok.secret,
        'Idempotency-Key': uuid.v4(),
      })
    )
  }

  public async requestRaw(
    url: string,
    requestBody = {},
    headers = {},
    previousStartTime?: number,
    attempt = 1
  ): Promise<ApiObject> {
    if (!requestBody) {
      requestBody = {}
    }

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
      return this.requestRaw(url, requestBody, headers, startTime, attempt + 1)
    }

    // Convert camelcased request body field names to use snakecase for API
    // processing.
    const snakeBody = snakeize(requestBody) // Ssssssssssss

    // TypeScript's DOM-based RequestInfo "type" doesn't have an "agent" prop
    const req: any = {
      method: 'POST',
      headers: Object.assign(
        {
          Accept: 'application/json',
          'Content-Type': 'application/json',

          // TODO(jeffomatic): The Fetch API has inconsistent behavior between
          // browser implementations and polyfills.
          //
          // - For Edge: we can't use the browser's fetch API because it doesn't
          // always returns a WWW-Authenticate challenge to 401s.
          // - For Safari/Chrome: using fetch-ponyfill (the polyfill) causes
          // console warnings if the user agent string is provided.
          //
          // For now, let's not send the UA string.
          // 'User-Agent': 'chain-sdk-js/0.0'
        },
        headers
      ),
      body: JSON.stringify(snakeBody),
    }

    if (this.agent) {
      req.agent = this.agent
    }

    let resp: Response

    try {
      resp = await fetch(url, req)
    } catch (err) {
      return retry(
        new errors.ConnectivityError(err),
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
      body = await resp.json()
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

  public needRefresh() {
    const now = Math.round(new Date().getTime() / 1000)
    return !this.sessTok || this.sessTok.refreshAt < now
  }

  // also sets ledgerUrl
  public async refreshSession() {
    const { sessTok, ledgerUrl } = await this.getRefreshTokenInfo()
    this.ledgerUrl = ledgerUrl
    this.sessTok = sessTok
  }

  // Unit tests can override this to inject a discharge macaroon
  // and far-future refreshAt time.
  public async getRefreshTokenInfo() {
    const url = this.sessionBaseUrl + '/sessions/validate'
    const body = (await this.requestRaw(url, {
      macaroon: this.credential,
    })) as any
    return {
      sessTok: {
        refreshAt: body.refreshAt,
        secret: body.refreshToken,
      } as SessionToken,
      ledgerUrl: this.baseUrl + '/' + body.teamName + '/' + this.ledgerName,
    }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

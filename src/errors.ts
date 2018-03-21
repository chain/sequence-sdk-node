export interface Body {
  detail: string
  message: string
  rawMessage: string
  seqCode: string
}

const formatErrMsg = (body: Body, requestId: string) => {
  const tokens: string[] = []

  if (typeof body.seqCode === 'string' && body.seqCode.length > 0) {
    tokens.push('Code: ' + body.seqCode)
  }

  tokens.push('Message: ' + body.message)

  if (typeof body.detail === 'string' && body.detail.length > 0) {
    tokens.push('Detail: ' + body.detail)
  }

  if (requestId) {
    tokens.push('Request-ID: ' + requestId)
  }

  return tokens.join(' ')
}

export class BaseError {
  public message: string
  public name: string

  constructor(message: string) {
    this.message = message
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  public toString() {
    return `${this.name}: ${this.message}`
  }
}

export class ConnectivityError extends BaseError {
  public source: any

  constructor(sourceErr: any) {
    super('Fetch error: ' + sourceErr.toString())
    this.source = sourceErr
  }
}

export class NoRequestIdError extends BaseError {
  public response: any

  constructor(response?: any) {
    super(
      'Chain-Request-Id header is missing. There may be an issue with your proxy or network configuration.'
    )
    this.response = response
  }
}

export class JsonError extends BaseError {
  public response: any

  constructor(response?: any) {
    super('Could not parse JSON response')
    this.response = response
  }
}

export class ApiError extends BaseError {
  public response: any
  public requestId: string

  constructor(resp: { headers: any }, body: Body) {
    const requestId = resp.headers.get('Chain-Request-Id')
    super(formatErrMsg(body, requestId))

    // copy properties, but don't clobber the original message
    const bodyCopy = Object.assign({}, body)
    delete bodyCopy.message
    bodyCopy.rawMessage = body.message
    Object.assign(this, bodyCopy)

    this.response = resp
    this.requestId = requestId
  }
}

export class AuthError extends ApiError {}
export class BadRequestError extends ApiError {}
export class NotFoundError extends ApiError {}
export class ServerError extends ApiError {}

export const errors = {
  ApiError,
  AuthError,
  BadRequestError,
  BaseError,
  ConnectivityError,
  JsonError,
  NoRequestIdError,
  NotFoundError,
  ServerError,
}

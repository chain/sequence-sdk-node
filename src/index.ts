import { Client } from './client'
import { Connection } from './connection'
import { errors } from './errors'
import {
  ApiError,
  AuthError,
  BadRequestError,
  BaseError,
  ConnectivityError,
  JsonError,
  NoRequestIdError,
  NotFoundError,
  ServerError,
} from './errors'

export default {
  Client,
  Connection,
  errors,
}

export { Client }
export { Connection }
export { errors }

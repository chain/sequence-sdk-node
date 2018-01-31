/* eslint-env mocha */

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as uuid from 'uuid'
import sequence from '../src/index'

import { testHelpers } from './testHelpers'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Errors', () => {
  describe('instanceof', () => {
    it('does not match vanilla errors', () => {
      expect(new Error()).to.not.be.an.instanceof(sequence.errors.BaseError)
    })

    it('does not match sibling classes', () => {
      expect(new sequence.errors.JsonError()).to.be.an.instanceof(
        sequence.errors.BaseError
      )
      expect(new sequence.errors.JsonError()).to.not.be.an.instanceof(
        sequence.errors.ConnectivityError
      )
    })

    describe('ApiError types', () => {
      const mockResponse = { headers: { get: () => null } }
      const mockBody = { code: '', detail: '', message: '', rawMessage: '' }
      const errs = [
        new sequence.errors.BadRequestError(mockResponse, mockBody),
        new sequence.errors.NotFoundError(mockResponse, mockBody),
        new sequence.errors.ServerError(mockResponse, mockBody),
      ]

      it('are instances of BaseError', () => {
        for (const i in errs) {
          if (errs.hasOwnProperty(i)) {
            expect(errs[i]).to.be.an.instanceof(sequence.errors.BaseError)
          }
        }
      })

      it('are instances of ApiError', () => {
        for (const i in errs) {
          if (errs.hasOwnProperty(i)) {
            expect(errs[i]).to.be.an.instanceof(sequence.errors.ApiError)
          }
        }
      })
    })

    describe('Other error types', () => {
      const errs = [
        new sequence.errors.ConnectivityError(''),
        new sequence.errors.NoRequestIdError(),
        new sequence.errors.JsonError(),
      ]

      it('are instances of BaseError', () => {
        for (const i in errs) {
          if (errs.hasOwnProperty(i)) {
            expect(errs[i]).to.be.an.instanceof(sequence.errors.BaseError)
          }
        }
      })
    })
  })

  describe('no access token', () => {
    const unauthedClient = testHelpers.constructClient()
    delete unauthedClient.connection.credential

    it('is an NotFoundError', async () => {
      try {
        await unauthedClient.accounts.queryPage()
      } catch (err) {
        return expect(err).to.be.an.instanceof(sequence.errors.NotFoundError)
      }
      expect.fail()
    })

    it('has status code 404', async () => {
      try {
        await unauthedClient.accounts.queryPage()
      } catch (err) {
        return expect(err.response.status).to.eq(404)
      }
      expect.fail()
    })

    it('has Chain Code of CH002', async () => {
      try {
        await unauthedClient.accounts.queryPage()
      } catch (err) {
        return expect(err.code).to.eq('CH002')
      }
      expect.fail()
    })

    it('has a request ID', async () => {
      try {
        await unauthedClient.accounts.queryPage()
      } catch (err) {
        return expect(err.requestId).to.not.eq(undefined)
      }
      expect.fail()
    })
  })

  describe('no server', () => {
    const unauthedClient = testHelpers.constructClient()
    unauthedClient.connection.baseUrl = 'http://localhost:12345'

    let err: any

    before(async () => {
      try {
        await unauthedClient.accounts.queryPage()
      } catch (e) {
        err = e
      }
    })

    it('is a ConnectivityError', () => {
      expect(err).to.be.an.instanceof(sequence.errors.ConnectivityError)
    })
    it('has no status code', () => {
      return expect(err.status).to.eq(undefined)
    })
    it('has no request ID', () => {
      return expect(err.requestId).to.eq(undefined)
    })
  })

  describe('bad "batch"', () => {
    const client = testHelpers.client

    it('has a request ID', async () => {
      try {
        await client.accounts.create({} as any)
      } catch (err) {
        return expect(err.requestId).to.not.eq(undefined)
      }
      expect.fail()
    })
  })

  describe('transaction errors', () => {
    const client = testHelpers.client

    it('is a BadRequestError', async () => {
      try {
        await client.transactions.transact(builder => {
          return undefined as any
        })
      } catch (err) {
        return expect(err).to.be.an.instanceOf(sequence.errors.BadRequestError)
      }
      expect.fail()
    })

    it('has a request ID', async () => {
      try {
        await client.transactions.transact(builder => {
          return undefined as any
        })
      } catch (err) {
        return expect(err.requestId).to.not.eq(undefined)
      }
      expect.fail()
    })
  })
})

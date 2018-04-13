const assert = require('assert')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const mocha = require('mocha')
const uuid = require('uuid')

const testHelpers = require('./testHelpers').testHelpers

chai.use(chaiAsPromised)

const client = testHelpers.client
const expect = chai.expect

describe('Schemas', () => {
  describe('Account', () => {
    it('rejects creation with alias', () => {
      return client.accounts.create({ alias: 'foo' })
      .then(() => assert(false, 'should not accept `alias` field'))
      .catch(err => {
        expect(err.message).to.contain("should NOT have additional properties '.alias'")
      })
    })
  })

  describe('Key', () => {
    it('rejects creation with alias', () => {
      return client.keys.create({ alias: 'foo' })
      .then(() => assert(false, 'should not accept `alias` field'))
      .catch(err => {
        expect(err.message).to.contain("should NOT have additional properties '.alias'")
      })
    })
  })
})

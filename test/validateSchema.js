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
  describe('Key', () => {
    it('rejects key creation with alias', () => {
      expect(client.keys.create({ alias: 'anything' })).to.be.rejectedWith(
        "should NOT have additional properties '.alias'"
      )
    })
  })
})

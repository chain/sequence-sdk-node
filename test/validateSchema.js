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

    it('rejects tag updates with alias', () => {
      return client.accounts.updateTags({alias: 'foo', tags: {foo: 'bar'}})
      .then(() => assert(false, 'should not accept `alias` field'))
      .catch(err => {
        expect(err.message).to.contain("should NOT have additional properties '.alias'")
      })
    })

    it('rejects creation with keys', () => {
      return client.accounts.create({ keys: [1,2,3] })
      .then(() => assert(false, 'should not accept `keys` field'))
      .catch(err => {
        expect(err.message).to.contain("should NOT have additional properties '.keys'")
      })
    })
  })

  describe('Flavor', () => {
    it('rejects creation with alias', () => {
      return client.flavors.create({ alias: 'foo' })
      .then(() => assert(false, 'should not accept `alias` field'))
      .catch(err => {
        expect(err.message).to.contain("should NOT have additional properties '.alias'")
      })
    })

    it('rejects tag updates with alias', () => {
      return client.flavors.updateTags({alias: 'foo', tags: {foo: 'bar'}})
      .then(() => assert(false, 'should not accept `alias` field'))
      .catch(err => {
        expect(err.message).to.contain("should NOT have additional properties '.alias'")
      })
    })
    
    it('rejects creation with keys', () => {
      return client.flavors.create({ keys: [1,2,3] })
      .then(() => assert(false, 'should not accept `keys` field'))
      .catch(err => {
        expect(err.message).to.contain("should NOT have additional properties '.keys'")
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

  describe('Query', () => {
    it('rejects list with after', () => {
      try {
        client.accounts.list({ after: 'foo' }).all()
      } catch (err) {
        expect(err.message).to.contain("should NOT have additional properties '.after'")
        return
      }
      assert(false, 'should not accept `after` field')
    })

    it('rejects sum with sum by', () => {
      try {
        client.actions.sum({ sumBy: ['foo'] }).all()
      } catch (err) {
        expect(err.message).to.contain("should NOT have additional properties '.sumBy'")
        return
      }
      assert(false, 'should not accept `sumBy` field')
    })

    it('rejects list with start time', () => {
      try {
        client.transactions.list({ startTime: 0 }).all()
      } catch (err) {
        expect(err.message).to.contain("should NOT have additional properties '.startTime'")
        return
      }
      assert(false, 'should not accept `startTime` field')
    })
  })
})

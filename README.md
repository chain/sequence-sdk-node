# Sequence Node SDK

## Usage

### Get the module

The Sequence SDK is available
[via npm](https://www.npmjs.com/package/sequence-sdk). Node 4 or greater is
required.

To install, add the `sequence-sdk` NPM module to your `package.json`:

```json
{
  "dependencies": {
    "sequence-sdk": "~1.5.0"
  }
}
```

### In your code

```js
const sequence = require('sequence-sdk')
const ledger = new sequence.Client({
  ledgerName: 'ledger',
  credential: '...',
})
```

### Async usage

You can use either promises or callbacks for async API calls:

With promises:

```js
ledger.accounts.create({...}).then(result => {
  // operate on result
}).catch(err => {
  // handle errors
})
```

With callbacks:

```js
ledger.accounts.create({...}, (err, result) => {
  if (err) {
    // handle errors
    return
  }

  // operate on result
})
```

### Documentation

Comprehensive instructions and examples are available in the
[developer documentation](https://dashboard.seq.com/docs).

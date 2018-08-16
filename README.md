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
    "sequence-sdk": "~2.2.2"
  }
}
```

### TypeScript

If you're using TypeScript, include the following in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["es2015", "es2016", "esnext"],
    "types": ["node"]
  }
}
```

Also, run:

```
npm i --save-dev @types/node
```

### In your code

```js
const sequence = require('sequence-sdk')
const ledger = new sequence.Client({
  ledgerName: 'ledger',
  credential: '...',
})
```

### Calling convention

Most SDK methods return Promise objects, which you can use with
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function),
or consume directly.

With
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function):

```js
async function main() {
  try {
    const account = await ledger.accounts.create({...})
    // operate on account
  } catch (err) {
    // handle errors
  }
}
```

With the Promise object itself:

```js
function main() {
  return ledger.accounts.create({...}).then(account => {
    // operate on account
  }).catch(err => {
    // handle errors
  })
}
```

### Documentation

Comprehensive instructions and examples are available in the
[developer documentation](https://dashboard.seq.com/docs).

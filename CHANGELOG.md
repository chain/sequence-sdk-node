# Sequence Node SDK changelog

## 2.2.4 (20180907)

* Fix bug that filtered out `snapshot.sourceAccountTags` and
  `snapshot.destinationAccountTags` in actions.

## 2.2.3 (20180823)

* Switch object validation libraries from `ajv` to `yup` to
  support browsers with a strict Content Security Policy.

## 2.2.2 (20180816)

* Add support for setting custom HTTP request headers at
  the client level.

## 2.2.1 (20180814)

* Added support for setting a custom API URL when run outside
  of a Node process.

## 2.2.0 (20180808)

* Added `updateTags` to `Action`.
* Added support for dynamically addressing different API hosts for
  individual ledgers. Internal APIs only, works automatically.

## 2.1.0 (20180516)

* Added transaction tags.
  [More info](https://dashboard.seq.com/docs/transactions)

## 2.0.2 (20180507)

* Deserialize numbers greater than 15 digits into `BigNumber` objects.
  This fixes a bug where numbers that large were losing precision.
* Throw validation error for numbers larger than the max limit.

## 2.0.1 (20180501)

* Generate unique request IDs in the client for easier debugging support
* Restore the ability to set a custom HTTPS agent for specific network
  configuration.

## 2.0.0 (20180418)

* Enabled `keepAlive` on the HTTP agent.
* Added copy of Apache 2.0 license to source.
* Added `User-Agent` header when in a Node program, is
  `sequence-sdk-node/#{VERSION}`.

## 2.0.0-rc.2 (20180416)

* Omit deprecated attributes returned from the API from all response objects.
* Prevent submitting deprecated parameters in API requests.

## 2.0.0-rc.1 (20180411)

* Removed assets, balances, contracts, and all other deprecated code.
* Added `Stats#ledgerType`.

## 1.5.1 (20180417)

* Enable `keepAlive` on the HTTP agent.

## 1.5.0 (20180316)

For full details on the 1.5 release and how to migrate your code,
[visit the Sequence changelog](https://dashboard.seq.com/docs/changelog#release-v1-5).

* Added `Feed`s. [More info](https://dashboard.seq.com/docs/feeds)
* The `keys` field on `Account` and `Flavor` has been deprecated; the new field
  is `keyIds`, containing key ID strings.
* Transaction reference data has been deprecated; you can now use action tags
  instead.
* Added support for camel-case identifiers in filter queries. Identifiers in
  query strings are now consistent with identifiers in Node source code.
  Snake-case names in query strings are deprecated.
* Changed method `all` to return a standard async iterator. The previous
  callback-based interface still works but is deprecated.

## 1.4.0 (20180308)

For full details on the 1.4 release and how to migrate your code,
[visit the Sequence changelog](https://dashboard.seq.com/docs/changelog#release-v1-4).

* Added `tags` to `Action`.
* Added `actionTags` on `Transaction` builder's actions.
* Added timestamp inequalities in filters.
* `referenceData` on `Transaction` builder's actions has been deprecated. You
  can now use `actionTags` instead.

## 1.3.0 (20180302)

For full details on the 1.3 release and how to migrate your code,
[visit the Sequence changelog](https://dashboard.seq.com/docs/changelog#release-v1-3).

* Added `Token`s.
  [More info](https://dashboard.seq.com/docs/changelog#release-v1-3)
* Added `tokenTags` on `Transaction` builder's `issue`/`transfer` actions.
* Added `filter` and `filterParams` on `Transaction` builder's
  `transfer`/`retire` actions.
* Updated pagination interfaces: `.[list|sum]().page(size: size)` to retrieve
  one page. `.[list|sum]().page(cursor: cursor)` to retrieve another page.
  `.[list|sum]().all` to iterate over all items. `pageSize` has been deprecated;
  you can now use `.page(size: size)`.
* Querying balances has been deprecated; you can now use `tokens.sum` to query
  balances in an account.
* Querying contracts has been deprecated; you can now use `tokens.list` to list
  tokens in an account.

## 1.2.0 (20180216)

For full details on the 1.2 release and how to migrate your code,
[visit the Sequence changelog](https://dashboard.seq.com/docs/changelog#release-v1-2).

* `Asset` has been renamed to `Flavor`; all references to assets have been
  deprecated.
* The `code` field on API errors has been deprecated; the new field is
  `seqCode`, containing `SEQXXX` error codes.
* The `sourceAccountTags`, `destinationAccountTags`, and `assetTags` on action
  objects have been deprecated; All tags on actions are now available within a
  new `Action.snapshot` object.

## 1.1.0 (20180206)

For full details on the 1.1 release and how to migrate your code,
[visit the Sequence changelog](https://dashboard.seq.com/docs/changelog#release-v1-1).

* Added support for setting a user-provided id on key and account objects.
* The `alias` field on key and account objects has been deprecated.
* The `ledger` field when creating an API client has been deprecated; the new
  field is named `ledgerName`.
* Added full support for listing and summing actions.

## 1.0.4 (20180119)

* New interface `ledger.actions.list` and `ledger.actions.sum` available. See
  https://dashboard.seq.com/docs/actions for more information.
* Improve retry logic for network errors.
* Codebase converted to TypeScript. TypeScript types are exported and available
  to SDK users who import the `sequence` module.
* Prettier linting applied to source code.

## 1.0.3 (20171021)

* Fixed a bug that affected refresh tokens and consequently all requests.

## 1.0.2 (20171020)

* Added support for new access control permissions. When creating a client, you
  now provide `ledger` and `credential` options to connect to a specific ledger.

  Authentication with the previous style of access tokens has been removed.

  See https://dashboard.seq.com/docs/5-minute-guide#instantiate-sdk-client for
  more information.

## 1.0.1 (20170921)

* Removed the `ttl` property from the `TransactionBuilder` class.

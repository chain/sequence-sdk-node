# Sequence Node SDK changelog

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

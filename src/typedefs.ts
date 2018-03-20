/**
 * Each transaction contains one or more actions. Action queries are designed to provide
 * insights into those actions. There are two types of queries you can run against them;
 * one is "List", one is "Sum". List query simply returns a list of Action objects that
 * match the filter; Sum query sums over the amount fields based on the filter and the
 * groupBy param and returns ActionSum objects. Different from other regular API objects,
 * the amount field in ActionSum represents the summation of the amount fields of those
 * matching actions, and all other fields represent the parameters by which to group
 * actions.
 *
 * More info: {@link https://dashboard.seq.com/docs/filters}
 *
 * @typedef {Object} Action
 * @global
 *
 * @property {Number} amount
 * List: the number of units of the action's flavor.
 * Sum: the summation of the amount fields of the action objects.
 *
 * @property {String} type
 * The type of the action. Possible values are "issue", "transfer", and "retire".
 *
 * @property {String} flavorId
 * The id of the action's flavor.
 *
 * @property {Hash} snapshot
 * A copy of the associated tags (flavor, source account, destination account,
 * action, and token) as they existed at the time of the transaction (possibly
 * null).
 *
 * @property {String} sourceAccountId
 * The id of the account transferring the tokens (possibly null if the
 * action is an issuance).
 *
 * @property {String} sourceAccountTags
 * **Deprecated. Use snapshot instead.**
 * The tags associated with the source account (possibly null).
 *
 * @property {String} destinationAccountId
 * The id of the account receiving the tokens (possibly null if the
 * action is a retirement).
 *
 * @property {String} destinationAccountTags
 * **Deprecated. Use snapshot instead.**
 * The tags associated with the destination account (possibly null).
 *
 * @property {Object} tags
 * User specified, unstructured data embedded within an action (possibly null).
 *
 * @property {Object} referenceData
 * **Deprecated. Use tags instead.**
 * User specified, unstructured data embedded within an action (possibly null).
 */

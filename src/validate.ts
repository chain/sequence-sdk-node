import * as yup from 'yup'
import { InvalidParametersError } from './errors'

const baseSchema = yup
  .object()
  .strict(true)
  .noUnknown(true, 'object had unexpected properties')

const amountErrorMessage = 'amount should be >= 0 and <= 9007199254740991'
const amountTest = (value: any) => {
  if (typeof value === 'number') {
    if (value < 0) {
      return false
    }
    if (value > Number.MAX_SAFE_INTEGER) {
      return false
    }
  }

  return true
}

const schemas: { [key: string]: any } = {
  CreateKeySchema: baseSchema.clone().shape({
    id: yup.string(),
  }),
  CreateAccountOrFlavorSchema: baseSchema.clone().shape({
    id: yup.string(),
    keyIds: yup.array().of(yup.string()),
    quorum: yup.number(),
    tags: yup.object(),
  }),
  UpdateTagsSchema: baseSchema.clone().shape({
    id: yup.string(),
    tags: yup.object(),
  }),
  QueryParamsSchema: baseSchema.clone().shape({
    filter: yup.string(),
    filterParams: yup.array(),
    pageSize: yup.number(),
    cursor: yup.string(),
    summary: yup.boolean(),
    groupBy: yup.array().of(yup.string()),
  }),
  TransferActionSchema: baseSchema.clone().shape({
    actionTags: yup.object(),
    amount: yup.mixed().test('number-in-range', amountErrorMessage, amountTest),
    destinationAccountId: yup.string(),
    filter: yup.string(),
    filterParams: yup.array(),
    flavorId: yup.string(),
    sourceAccountId: yup.string(),
    tokenTags: yup.object(),
  }),
  IssueActionSchema: baseSchema.clone().shape({
    actionTags: yup.object(),
    amount: yup.mixed().test('number-in-range', amountErrorMessage, amountTest),
    destinationAccountId: yup.string(),
    flavorId: yup.string(),
    tokenTags: yup.object(),
  }),
  RetireActionSchema: baseSchema.clone().shape({
    actionTags: yup.object(),
    amount: yup.mixed().test('number-in-range', amountErrorMessage, amountTest),
    filter: yup.string(),
    filterParams: yup.array(),
    flavorId: yup.string(),
    sourceAccountId: yup.string(),
    tokenTags: yup.object(),
  }),
}

export const validate = (object: any, schemaKey: string) => {
  const schema = schemas[schemaKey]

  if (schema) {
    try {
      schema.validateSync(object)
    } catch (err) {
      throw new InvalidParametersError(err.errors[0])
    }
    return
  } else {
    // Missing schema key; do nothing
    return
  }
}

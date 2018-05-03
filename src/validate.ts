import * as Ajv from 'ajv'
import { InvalidParametersError } from './errors'

const ajv = Ajv()

export const validate = (obj: any, schemaKey: string) => {
  const result = ajv.validate(schemaKey, obj)
  if (!result && ajv.errors) {
    throw new InvalidParametersError(ajv.errors[0])
  }
  return
}

ajv.addSchema(
  {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    additionalProperties: false,
  },
  'CreateKeySchema'
)

ajv.addSchema(
  {
    type: 'object',
    properties: {
      id: { type: 'string' },
      keyIds: { type: 'array', items: { type: 'string' } },
      quorum: { type: 'number' },
      tags: { type: 'object' },
    },
    additionalProperties: false,
  },
  'CreateAccountOrFlavorSchema'
)

ajv.addSchema(
  {
    properties: {
      id: { type: 'string' },
      tags: { type: 'object' },
    },
    additionalProperties: false,
  },
  'UpdateTagsSchema'
)

ajv.addSchema(
  {
    type: 'object',
    properties: {
      filter: { type: 'string' },
      filterParams: {
        type: 'array',
        items: {
          anyOf: [{ type: 'string' }, { type: 'number' }],
        },
      },
      pageSize: { type: 'number' },
      cursor: { type: 'string' },
      summary: { type: 'boolean' },
      groupBy: { type: 'array', items: { type: 'string' } },
    },
    additionalProperties: false,
  },
  'QueryParamsSchema'
)

ajv.addSchema(
  {
    properties: {
      actionTags: { type: 'object' },
      amount: {
        anyOf: [{ type: 'number' }, { type: 'object' }],
      },
      destinationAccountId: { type: 'string' },
      filter: { type: 'string' },
      filterParams: { type: 'array' },
      flavorId: { type: 'string' },
      sourceAccountId: { type: 'string' },
      tokenTags: { type: 'object' },
    },
    additionalProperties: false,
  },
  'TransferActionSchema'
)

ajv.addSchema(
  {
    properties: {
      actionTags: { type: 'object' },
      amount: {
        anyOf: [{ type: 'number' }, { type: 'object' }],
      },
      destinationAccountId: { type: 'string' },
      flavorId: { type: 'string' },
      tokenTags: { type: 'object' },
    },
    additionalProperties: false,
  },
  'IssueActionSchema'
)

ajv.addSchema(
  {
    properties: {
      actionTags: { type: 'object' },
      amount: {
        anyOf: [{ type: 'number' }, { type: 'object' }],
      },
      filter: { type: 'string' },
      filterParams: { type: 'array' },
      flavorId: { type: 'string' },
      sourceAccountId: { type: 'string' },
    },
    additionalProperties: false,
  },
  'RetireActionSchema'
)

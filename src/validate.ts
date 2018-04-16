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

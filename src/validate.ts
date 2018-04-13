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
  'CreateAccountSchema'
)

import { pascalCase } from 'change-case';
import { OpenAPIV3Schema } from '../types';

function toTypeScripType(data: OpenAPIV3Schema) {
  if ('$ref' in data) {
    // TODO: Fix $ref object type
    return `any /* is a Ref:${data.$ref} */`;
  }

  if (data.type === 'boolean') {
    return 'boolean';
  }

  if (data.type === 'number') {
    return 'number';
  }

  if (data.type === 'string') {
    return 'string';
  }

  if (data.type === 'integer') {
    return 'number';
  }

  if (data.type === 'array') {
    // TODO: Fix array type
    return 'Array<any>';
  }

  if (data.type === 'object') {
    // TODO: Fix object type
    return 'any';
  }

  return `any /* ${data.type} is unknown */`;
}

export function generateTypes(args: { schemaName: string; schemaObject: OpenAPIV3Schema }) {
  const normalizedSchemaName = pascalCase(args.schemaName);
  const typeOutput = toTypeScripType(args.schemaObject);

  return `export type ${normalizedSchemaName} = ${typeOutput};`;
}

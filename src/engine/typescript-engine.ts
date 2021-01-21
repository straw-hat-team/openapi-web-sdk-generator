import { pascalCase } from 'change-case';
import { OpenAPIV3Schema } from '../types';
import { OpenAPIV3 } from 'openapi-types';

function fromSchemaObjectToTypeScripType(data: OpenAPIV3.BaseSchemaObject) {
  const typeOutput: string[] = [];

  if ('properties' in data) {
    const propertiesOutput = Object.entries(data.properties ?? {}).map((entry) => {
      return `${entry[0]}: ${toTypeScripType(entry[1])}`;
    });

    typeOutput.push(`{ ${propertiesOutput.join(';\n')} }`);
  }

  return typeOutput.join('');
}

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
    return fromSchemaObjectToTypeScripType(data);
  }

  return `any /* ${data.type} is unknown */`;
}

export function generateTypes(args: { schemaName: string; schemaObject: OpenAPIV3Schema }) {
  const normalizedSchemaName = pascalCase(args.schemaName);
  const typeOutput = toTypeScripType(args.schemaObject);

  return `export type ${normalizedSchemaName} = ${typeOutput};`;
}

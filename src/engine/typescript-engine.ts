import { pascalCase } from 'change-case';
import { OpenAPIV3Schema } from '../types';
import { OpenAPIV3 } from 'openapi-types';

function fromSchemaObjectToTypeScripType(data: OpenAPIV3.BaseSchemaObject): { output: string; comment?: string } {
  const typeOutput: string[] = [];

  if ('properties' in data) {
    const propertiesOutput = Object.entries(data.properties ?? {}).map((entry) => {
      const typeOutput = toTypeScripType(entry[1]);
      const optionalFlag = (data.required ?? []).includes(entry[0]) ? '' : '?';
      return `${typeOutput.comment ?? '\n'}${entry[0]}${optionalFlag}: ${typeOutput.output}`;
    });

    typeOutput.push(`{ ${propertiesOutput.join(';\n')} }`);
  }

  return { output: typeOutput.join('') };
}

function toTypeScripType(data: OpenAPIV3Schema): { output: string; comment?: string } {
  if ('$ref' in data) {
    // TODO: Fix $ref object type
    return {
      comment: `
      /**
        * Is a Ref of ${data.$ref}
        */\n`,
      output: 'any',
    };
  }

  if (data.type === 'boolean') {
    return { output: 'boolean' };
  }

  if (data.type === 'number') {
    return { output: 'number' };
  }

  if (data.type === 'string') {
    return { output: 'string' };
  }

  if (data.type === 'integer') {
    return { output: 'number' };
  }

  if (data.type === 'array') {
    // TODO: Fix array type
    return { output: 'Array<any>' };
  }

  if (data.type === 'object') {
    return fromSchemaObjectToTypeScripType(data);
  }

  return {
    comment: `
    /**
      * ${data.type} is unknown
      */\n`,
    output: 'any',
  };
}

export function generateTypes(args: { schemaName: string; schemaObject: OpenAPIV3Schema }) {
  const normalizedSchemaName = pascalCase(args.schemaName);
  const typeOutput = toTypeScripType(args.schemaObject);

  return `
    ${typeOutput.comment ?? '\n'}
    export type ${normalizedSchemaName} = ${typeOutput.output};
  `;
}

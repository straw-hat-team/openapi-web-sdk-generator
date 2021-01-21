import { pascalCase } from 'change-case';
import { OpenAPIV3Schema } from '../types';
import { OpenAPIV3 } from 'openapi-types';

function asString(value: any) {
  return `"${value}"`;
}

function fromSchemaObjectToTypeScripType(data: OpenAPIV3.BaseSchemaObject): { output: string; docs: string } {
  const typeOutput: string[] = [];

  // TODO: handle additionalProperties key

  if ('properties' in data) {
    const propertiesOutput = Object.entries(data.properties ?? {}).map((entry) => {
      const typeOutput = toTypeScripType(entry[1]);
      const optionalFlag = (data.required ?? []).includes(entry[0]) ? '' : '?';
      return `${typeOutput.docs} \n ${entry[0]}${optionalFlag}: ${typeOutput.output}`;
    });

    typeOutput.push(`{ ${propertiesOutput.join(';\n')} }`);
  }

  return { output: typeOutput.join(''), docs: '' };
}

function fromStringSchemaObjectToTypeScripType(data: OpenAPIV3.BaseSchemaObject): { output: string; docs: string } {
  const output = data.enum === undefined ? 'string' : data.enum.map(asString).join('|');

  return {
    output: output,
    docs: createDocs(data),
  };
}

function createDocs(data: OpenAPIV3.SchemaObject) {
  const docs = ['/**'];

  if (data.title) {
    docs.push(`* ${data.title}`);
  }

  if (data.description) {
    docs.push(`* ${data.description}`);
  }

  if (data.externalDocs) {
    docs.push(`* ${data.externalDocs.description}: ${data.externalDocs.url}`);
  }

  if (data.deprecated) {
    docs.push('* @deprecated');
  }

  if (data.default) {
    docs.push(`* @default ${data.default}`);
  }

  if (data.format) {
    docs.push(`* @format ${data.format}`);
  }

  if (data.readOnly) {
    docs.push('* @readonly');
  }

  if (data.writeOnly) {
    docs.push('* @writeonly');
  }

  if (data.multipleOf) {
    docs.push(`* @multipleOf ${data.multipleOf}`);
  }

  if (data.maximum) {
    docs.push(`* @maximum ${data.maximum}`);
  }

  if (data.exclusiveMaximum) {
    docs.push(`* @exclusiveMaximum ${data.exclusiveMaximum}`);
  }

  if (data.minimum) {
    docs.push(`* @minimum ${data.minimum}`);
  }

  if (data.exclusiveMinimum) {
    docs.push(`* @exclusiveMinimum ${data.exclusiveMinimum}`);
  }

  if (data.maxLength) {
    docs.push(`* @maxLength ${data.maxLength}`);
  }

  if (data.minLength) {
    docs.push(`* @minLength ${data.minLength}`);
  }

  if (data.pattern) {
    docs.push(`* @pattern ${data.pattern}`);
  }

  if (data.maxItems) {
    docs.push(`* @maxItems ${data.maxItems}`);
  }

  if (data.minItems) {
    docs.push(`* @minItems ${data.minItems}`);
  }

  if (data.uniqueItems) {
    docs.push(`* @uniqueItems ${data.uniqueItems}`);
  }

  if (data.maxProperties) {
    docs.push(`* @maxProperties ${data.maxProperties}`);
  }

  if (data.minProperties) {
    docs.push(`* @minProperties ${data.minProperties}`);
  }

  docs.push('*/');

  return docs.join('\n');
}

function toTypeScripType(data: OpenAPIV3Schema): { output: string; docs: string } {
  if ('$ref' in data) {
    // TODO: Fix $ref object type
    return {
      docs: `
      /**
        * Is a Ref of ${data.$ref}
        */`,
      output: 'any',
    };
  }

  if (data.type === 'boolean') {
    return { output: 'boolean', docs: '' };
  }

  if (data.type === 'number') {
    return { output: 'number', docs: '' };
  }

  if (data.type === 'string') {
    return fromStringSchemaObjectToTypeScripType(data);
  }

  if (data.type === 'integer') {
    return { output: 'number', docs: '' };
  }

  if (data.type === 'array') {
    // TODO: Fix array type
    return { output: 'Array<any>', docs: '' };
  }

  if (data.type === 'object') {
    return fromSchemaObjectToTypeScripType(data);
  }

  return {
    docs: `
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
    ${typeOutput.docs}
    export type ${normalizedSchemaName} = ${typeOutput.output};
  `;
}

import { ImportsCache } from './imports-cache';
import { OpenAPIV3Schema } from '../types';
import { OpenAPIV3 } from 'openapi-types';
import { pascalCase } from 'change-case';

type TypeScriptType = {
  output: string;
  docs: string;
};

// TODO: handle nullable
// TODO: handle example

function asString(value: any) {
  return `"${value}"`;
}

function schemaObjectToTypeScripType(
  importsCache: ImportsCache,
  importPath: string,
  data: OpenAPIV3.NonArraySchemaObject
): TypeScriptType {
  const typeOutput: string[] = [];

  // TODO: handle additionalProperties key

  if ('properties' in data) {
    const propertiesOutput = Object.entries(data.properties ?? {}).map((entry) => {
      const typeOutput = toTypeScripType(entry[1], importsCache, importPath);
      const optionalFlag = (data.required ?? []).includes(entry[0]) ? '' : '?';
      return `${typeOutput.docs} \n ${entry[0]}${optionalFlag}: ${typeOutput.output}`;
    });

    typeOutput.push(`{ ${propertiesOutput.join(';\n')} }`);
  }

  return { output: typeOutput.join(''), docs: createDocs(data) };
}

function stringSchemaObjectToTypeScripType(data: OpenAPIV3.NonArraySchemaObject): TypeScriptType {
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

function booleanSchemaObjectToTypeScripType(data: OpenAPIV3.NonArraySchemaObject): TypeScriptType {
  return {
    output: 'boolean',
    docs: createDocs(data),
  };
}

function numberSchemaObjectToTypeScripType(data: OpenAPIV3.NonArraySchemaObject): TypeScriptType {
  return {
    output: 'number',
    docs: createDocs(data),
  };
}

function integerSchemaObjectToTypeScripType(data: OpenAPIV3.NonArraySchemaObject): TypeScriptType {
  return numberSchemaObjectToTypeScripType(data);
}

function unknownSchemaObjectToTypeScripType(data: OpenAPIV3.NonArraySchemaObject): TypeScriptType {
  return {
    docs: createDocs(data),
    output: 'any',
  };
}

function allOfSchemaObjectToTypeScripType(
  importsCache: ImportsCache,
  importPath: string,
  data: OpenAPIV3Schema[]
): TypeScriptType {
  return {
    docs: '',
    // TODO: handle Ref returns
    output: data.map((data) => toTypeScripType(data, importsCache, importPath)).join(' & '),
  };
}

function oneOfSchemaObjectToTypeScripType(
  importsCache: ImportsCache,
  importPath: string,
  data: OpenAPIV3Schema[]
): TypeScriptType {
  return {
    docs: '',
    // TODO: handle Ref returns
    output: data.map((data) => toTypeScripType(data, importsCache, importPath)).join(' | '),
  };
}

function anyOfSchemaObjectToTypeScripType(
  importsCache: ImportsCache,
  importPath: string,
  data: OpenAPIV3Schema[]
): TypeScriptType {
  return {
    docs: '',
    output: data.map((data) => toTypeScripType(data, importsCache, importPath)).join(' | '),
  };
}

function arraySchemaObjectToTypeScripType(
  importsCache: ImportsCache,
  importPath: string,
  data: OpenAPIV3.ArraySchemaObject
): TypeScriptType {
  const type = toTypeScripType(data.items, importsCache, importPath);

  return {
    docs: createDocs(data),
    // TODO: handle Ref returns
    output: `Array<${type.output}>`,
  };
}

function referenceObjectToTypeScripType(
  importsCache: ImportsCache,
  importPath: string,
  data: OpenAPIV3.ReferenceObject
): TypeScriptType {
  const refs = data.$ref.replace('#/', '').split('/');
  const referenceModule = refs[1];
  const referenceType = refs[2];

  importsCache.getOrSet(importPath, () => new Set()).add(referenceModule);

  return {
    docs: '',
    output: `${referenceModule}.${pascalCase(referenceType)}`,
  };
}

export function toTypeScripType(data: OpenAPIV3Schema, importsCache: ImportsCache, importPath: string): TypeScriptType {
  if ('$ref' in data) {
    return referenceObjectToTypeScripType(importsCache, importPath, data);
  }

  if (data.allOf) {
    return allOfSchemaObjectToTypeScripType(importsCache, importPath, data.allOf);
  }

  if (data.oneOf) {
    return oneOfSchemaObjectToTypeScripType(importsCache, importPath, data.oneOf);
  }

  if (data.anyOf) {
    return anyOfSchemaObjectToTypeScripType(importsCache, importPath, data.anyOf);
  }

  if (data.type === 'array') {
    return arraySchemaObjectToTypeScripType(importsCache, importPath, data);
  }

  if (data.type === 'object') {
    return schemaObjectToTypeScripType(importsCache, importPath, data);
  }

  if (data.type === 'boolean') {
    return booleanSchemaObjectToTypeScripType(data);
  }

  if (data.type === 'number') {
    return numberSchemaObjectToTypeScripType(data);
  }

  if (data.type === 'string') {
    return stringSchemaObjectToTypeScripType(data);
  }

  if (data.type === 'integer') {
    return integerSchemaObjectToTypeScripType(data);
  }

  return unknownSchemaObjectToTypeScripType(data);
}

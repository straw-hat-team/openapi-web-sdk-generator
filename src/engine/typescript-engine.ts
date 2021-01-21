import { pascalCase } from 'change-case';
import { OpenAPIV3Schema } from '../types';
import { OpenAPIV3 } from 'openapi-types';

type TypeScriptType = {
  importModule?: string;
  output: string;
  docs: string;
};

// TODO: handle nullable
// TODO: handle example

function asString(value: any) {
  return `"${value}"`;
}

function fromSchemaObjectToTypeScripType(data: OpenAPIV3.BaseSchemaObject): TypeScriptType {
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

  return { output: typeOutput.join(''), docs: createDocs(data) };
}

function fromStringSchemaObjectToTypeScripType(data: OpenAPIV3.BaseSchemaObject): TypeScriptType {
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

function fromBooleanSchemaObjectToTypeScripType(data: OpenAPIV3.BaseSchemaObject): TypeScriptType {
  return {
    output: 'boolean',
    docs: createDocs(data),
  };
}

function fromNumberSchemaObjectToTypeScripType(data: OpenAPIV3.BaseSchemaObject): TypeScriptType {
  return {
    output: 'number',
    docs: createDocs(data),
  };
}

function fromIntegerSchemaObjectToTypeScripType(data: OpenAPIV3.BaseSchemaObject): TypeScriptType {
  return fromNumberSchemaObjectToTypeScripType(data);
}

function fromUnknownSchemaObjectToTypeScripType(data: OpenAPIV3.SchemaObject): TypeScriptType {
  return {
    docs: createDocs(data),
    output: 'any',
  };
}

function fromAllOfSchemaObjectToTypeScripType(data: OpenAPIV3Schema[]): TypeScriptType {
  return {
    docs: '',
    // TODO: handle Ref returns
    output: data.map(toTypeScripType).join(' & '),
  };
}

function fromOneOfSchemaObjectToTypeScripType(data: OpenAPIV3Schema[]): TypeScriptType {
  return {
    docs: '',
    // TODO: handle Ref returns
    output: data.map(toTypeScripType).join(' | '),
  };
}

function fromAnyOfSchemaObjectToTypeScripType(data: OpenAPIV3Schema[]): TypeScriptType {
  return {
    docs: '',
    // TODO: handle Ref returns
    output: data.map(toTypeScripType).join(' | '),
  };
}

function fromArraySchemaObjectToTypeScripType(data: OpenAPIV3.ArraySchemaObject): TypeScriptType {
  const type = toTypeScripType(data.items);

  return {
    docs: createDocs(data),
    // TODO: handle Ref returns
    output: `Array<${type.output}>`,
  };
}

function fromRefSchemaObjectToTypeScripType(data: OpenAPIV3.ReferenceObject): TypeScriptType {
  const refs = data.$ref.replace('#/', '').split('/');
  const referenceModule = refs[1];
  const referenceType = refs[2];

  return {
    importModule: referenceModule,
    docs: '',
    output: `${referenceModule}.${referenceType}`,
  };
}

function toTypeScripType(data: OpenAPIV3Schema): TypeScriptType {
  if ('$ref' in data) {
    return fromRefSchemaObjectToTypeScripType(data);
  }

  // #/components/schemas/Category

  if (data.allOf) {
    return fromAllOfSchemaObjectToTypeScripType(data.allOf);
  }

  if (data.oneOf) {
    return fromOneOfSchemaObjectToTypeScripType(data.oneOf);
  }

  if (data.anyOf) {
    return fromAnyOfSchemaObjectToTypeScripType(data.anyOf);
  }

  if (data.type === 'boolean') {
    return fromBooleanSchemaObjectToTypeScripType(data);
  }

  if (data.type === 'number') {
    return fromNumberSchemaObjectToTypeScripType(data);
  }

  if (data.type === 'string') {
    return fromStringSchemaObjectToTypeScripType(data);
  }

  if (data.type === 'integer') {
    return fromIntegerSchemaObjectToTypeScripType(data);
  }

  if (data.type === 'array') {
    return fromArraySchemaObjectToTypeScripType(data);
  }

  if (data.type === 'object') {
    return fromSchemaObjectToTypeScripType(data);
  }

  return fromUnknownSchemaObjectToTypeScripType(data);
}

export function generateTypes(args: { schemaName: string; schemaObject: OpenAPIV3Schema }) {
  const normalizedSchemaName = pascalCase(args.schemaName);
  const typeOutput = toTypeScripType(args.schemaObject);

  return `
    ${typeOutput.docs}
    export type ${normalizedSchemaName} = ${typeOutput.output};
  `;
}

import { ImportsCache } from './imports-cache';
import { OpenAPIV3Schema } from '../types';
import { pascalCase } from 'change-case';
import { toTypeScripType } from './to-typescript-type';

export function generateTypes(
  importsCache: ImportsCache,
  args: { importPath: string; schemaName: string; schemaObject: OpenAPIV3Schema }
) {
  const normalizedSchemaName = pascalCase(args.schemaName);
  const typeOutput = toTypeScripType(args.schemaObject, importsCache, args.importPath);

  return `
    ${typeOutput.docs}
    export type ${normalizedSchemaName} = ${typeOutput.output};
  `;
}

import { BaseGeneratorType } from './base-generator-type';
//import { OpenAPIV3Schema } from '../types';
import { pascalCase } from 'change-case';

function toTypeScripType(data: any) {
  if (data.type === 'integer') {
    return 'number';
  }

  if (data.type === 'array') {
    return 'Array<any>';
  }

  return data.type;
}

export class TypeSrcriptEngine implements BaseGeneratorType {
  private constructor() {}

  private static driller(data: any) {
    const output: string[] = [];

    Object.keys(data).forEach((key) => {
      const type = toTypeScripType(data[key]);

      output.push(`${key}: ${type}`);
    });

    return output.join(';');
  }

  public static generateTypes(args: { schemaName: string; schemaObject: any }) {
    const normalizedSchemaName = pascalCase(args.schemaName);
    const properties = this.driller(args.schemaObject['properties']);
    return `export type ${normalizedSchemaName} = {
      ${properties};
    }`;
  }
}

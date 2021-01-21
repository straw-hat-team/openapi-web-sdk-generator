import { BaseGeneratorType } from "./base-generator-type";
//import { OpenAPIV3Schema } from '../types';
import { pascalCase } from 'change-case';

export class TypeSrcriptEngine implements BaseGeneratorType {
    private constructor() { }

    private static driller(data: any): any {
        let generate_type: any = {};
        Object.keys(data).forEach(key => {
            generate_type[key] = data[key]['type'];
        })
        return JSON.stringify(generate_type);
    }

    public static generateTypes(args: { schemaName: string; schemaObject: any }): String {
        const normalizedSchemaName = pascalCase(args.schemaName);
        const properties = this.driller(args.schemaObject['properties']);
        return `type ${normalizedSchemaName} = ${properties};\n`
    }

}
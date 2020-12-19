import { camelCase, pascalCase } from 'change-case';
import { getOperationDirectory, getOperationFileName } from '../helpers';
import { TemplateDir } from '../template-dir';
import * as path from 'path';
import { CodegenBase } from '../codegen-base';
import { IToolkit, OperationObject, PathItemObject } from '../types';

const templateDir = new TemplateDir(path.join(__dirname, '..', '..', 'templates', 'generators', 'react-query-fetcher'));

function isQuery(operationMethod: string) {
  return ['GET'].includes(operationMethod.toUpperCase());
}

interface ReactQueryFetcherCodegenConfig {
  dirPath?: string;
  importPath: string;
}

export class ReactQueryFetcherCodegen extends CodegenBase {
  private dirPath: string;
  private importPath: string;

  constructor(toolkit: IToolkit, args: ReactQueryFetcherCodegenConfig) {
    super(toolkit);
    this.dirPath = args.dirPath ?? '.';
    this.importPath = args.importPath;
  }

  generateOperation(args: {
    operationMethod: string;
    operationPath: string;
    pathItem: PathItemObject;
    operation: OperationObject;
  }) {
    const operationDirPath = path.join(this.dirPath, getOperationDirectory(args.pathItem, args.operation));
    const operationFilePath = getOperationFileName(operationDirPath, args.operation);

    this.toolkit.outputDir.createDirSync(operationDirPath);

    const sourceCode = isQuery(args.operationMethod)
      ? this.getQueryOperationSourceCode({ operation: args.operation })
      : this.getMutationOperationSourceCode({ operation: args.operation });

    const formattedSourceCode = this.toolkit.formatCode(sourceCode);

    this.toolkit.outputDir.writeFileSync(operationFilePath, formattedSourceCode);
  }

  getMutationOperationSourceCode(args: { operation: OperationObject }) {
    return templateDir.render('mutation-operation.ts.ejs', {
      functionName: camelCase(args.operation.operationId),
      pascalFunctionName: pascalCase(args.operation.operationId),
      importPath: this.importPath,
    });
  }

  getQueryOperationSourceCode(args: { operation: OperationObject }) {
    return templateDir.render('query-operation.ts.ejs', {
      functionName: camelCase(args.operation.operationId),
      pascalFunctionName: pascalCase(args.operation.operationId),
      importPath: this.importPath,
    });
  }
}

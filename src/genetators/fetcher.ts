import { camelCase, pascalCase } from 'change-case';
import { getOperationDirectory, getOperationFileName } from '../helpers';
import { TemplateDir } from '../template-dir';
import * as path from 'path';
import { CodegenBase } from '../codegen-base';
import { IToolkit, OperationObject, PathItemObject } from '../types';

const templateDir = new TemplateDir(path.join(__dirname, '..', '..', 'templates', 'generators', 'fetcher'));

export interface FetcherCodegenArgs {
  dirPath?: string;
}

export class FetcherCodegen extends CodegenBase {
  private dirPath: string;

  constructor(toolkit: IToolkit, args?: FetcherCodegenArgs) {
    super(toolkit);
    this.dirPath = args?.dirPath ?? '.';
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

    const sourceCode = templateDir.render('operation.ts.ejs', {
      functionName: camelCase(args.operation.operationId),
      typePrefix: pascalCase(args.operation.operationId),
      operationMethod: args.operationMethod.toUpperCase(),
      operationPath: args.operationPath,
    });

    const formattedSourceCode = this.toolkit.formatCode(sourceCode);

    this.toolkit.outputDir.writeFileSync(operationFilePath, formattedSourceCode);
  }
}

import { getOperationDirectory, getOperationFilePath } from '../../helpers';
import * as path from 'path';
import { CodegenBase } from '../../codegen-base';
import { IToolkit, OperationObject, PathItemObject } from '../../types';
import {
  getMutationOperationSourceCode,
  getQueryOperationSourceCode,
  renderOperationExportStatement,
} from './template';

function isQuery(operationMethod: string) {
  return ['GET'].includes(operationMethod.toUpperCase());
}

export interface ReactQueryFetcherCodegenConfig {
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
    const indexFilePath = path.join(this.dirPath, 'index');
    const operationDirPath = path.join(this.dirPath, getOperationDirectory(args.pathItem, args.operation));
    const operationFilePath = getOperationFilePath(operationDirPath, args.operation);
    const operationExportPath = path.relative(this.dirPath, operationFilePath);

    this.toolkit.outputDir.createDirSync(operationDirPath);

    const sourceCode = isQuery(args.operationMethod)
      ? getQueryOperationSourceCode({ operation: args.operation, importPath: this.importPath })
      : getMutationOperationSourceCode({ operation: args.operation, importPath: this.importPath });

    this.toolkit.outputDir.writeFileSync(`${operationFilePath}.ts`, this.toolkit.formatCode(sourceCode));

    this.toolkit.outputDir.appendFileSync(
      `${indexFilePath}.ts`,
      renderOperationExportStatement({ operationExportPath: operationExportPath })
    );
  }
}

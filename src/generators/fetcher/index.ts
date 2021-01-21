import { getOperationDirectory, getOperationFilePath } from '../../helpers';
import * as path from 'path';
import { CodegenBase } from '../../codegen-base';
import { IToolkit, OperationObject, PathItemObject, OpenAPIV3Schema } from '../../types';
import { renderOperationExportStatement, renderOperationFileSourceCode } from './template';
import { TypeSrcriptEngine } from '../../engine/typescript-engine';
export interface FetcherCodegenConfig {
  dirPath?: string
}

export class FetcherCodegen extends CodegenBase {
  private dirPath: string;

  constructor(toolkit: IToolkit, args?: FetcherCodegenConfig) {
    super(toolkit);
    this.dirPath = args?.dirPath ?? '.';
  }

  generateSchema(args: { schemaName: string; schemaObject: OpenAPIV3Schema }) {
    this.toolkit.outputDir.appendFileSync(`types.ts`, TypeSrcriptEngine.generateTypes(args));
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

    this.toolkit.outputDir.writeFileSync(
      `${operationFilePath}.ts`,
      this.toolkit.formatCode(renderOperationFileSourceCode(args))
    );

    this.toolkit.outputDir.appendFileSync(
      `${indexFilePath}.ts`,
      renderOperationExportStatement({ operationExportPath: operationExportPath })
    );
  }
}

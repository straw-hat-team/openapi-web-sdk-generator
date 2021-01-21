import { getOperationDirectory, getOperationFilePath } from '../../helpers';
import * as path from 'path';
import { CodegenBase } from '../../codegen-base';
import { IToolkit, OperationObject, PathItemObject, OpenAPIV3Schema } from '../../types';
import { renderOperationExportStatement, renderOperationFileSourceCode } from './template';
import { generateTypes } from '../../engine/typescript-engine';
import { ImportsCache } from '../../imports-cache';
import type { OpenAPIV3 } from 'openapi-types';
export interface FetcherCodegenConfig {
  dirPath?: string;
}

export class FetcherCodegen extends CodegenBase {
  private dirPath: string;
  private importsCache: ImportsCache;

  constructor(toolkit: IToolkit, args?: FetcherCodegenConfig) {
    super(toolkit);
    this.dirPath = args?.dirPath ?? '.';
    this.importsCache = new ImportsCache();
  }

  afterAll(_args: { document: OpenAPIV3.Document }) {
    const importsOutput = Array.from(this.importsCache)
      .map((importModule) => {
        return `import * as ${importModule} from "./${importModule}";`;
      })
      .concat('\n')
      .join('\n');

    this.toolkit.outputDir.prependFileSync('components/schemas.ts', importsOutput);
  }

  generateSchema(args: { schemaName: string; schemaObject: OpenAPIV3Schema }) {
    this.toolkit.outputDir.createDirSync('components');
    this.toolkit.outputDir.appendFileSync(
      'components/schemas.ts',
      this.toolkit.formatCode(generateTypes(this.importsCache, args))
    );
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

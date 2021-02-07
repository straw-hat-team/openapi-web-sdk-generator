import { getOperationDirectory, getOperationFilePath } from '../../helpers';
import * as path from 'path';
import { CodegenBase } from '../../codegen-base';
import {
  IToolkit,
  OperationObject,
  PathItemObject,
  OpenAPIV3Schema,
  OpenAPIV3Response,
  OpenAPIV3RequestBody,
} from '../../types';
import { renderOperationExportStatement, renderOperationFileSourceCode } from './template';
import { ImportsCache } from '../../engine/imports-cache';
import type { OpenAPIV3 } from 'openapi-types';
import { generateTypes } from '../../engine/typescript-engine';
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

  onBeforeAll(args: { document: OpenAPIV3.Document }) {
    this.toolkit.outputDir.appendFileSync('info.ts', `export const VERSION = "${args.document.info.version}";\n`);
    this.toolkit.outputDir.createDirSync('components');
    this.toolkit.outputDir.createDirSync('operations');

    this.generateComponentSchemas(args);
    this.generateComponentResponses(args);
    this.generateComponentRequestBodies(args);
  }

  private generateComponentResponses(args: { document: OpenAPIV3.Document }) {
    const responses = args.document.components?.responses ?? {};

    for (const [responseName, response] of Object.entries<OpenAPIV3Response>(responses)) {
      if ('$ref' in response) {
        this.toolkit.outputDir.appendFileSync(
          'components/responses.ts',
          this.toolkit.formatCode(
            generateTypes(this.importsCache, {
              importPath: 'components/responses',
              schemaObject: response,
              schemaName: responseName,
            })
          )
        );

        return;
      }

      const mediaTypeObject = response.content?.['application/json'];

      if (mediaTypeObject === undefined) {
        throw new Error(`#/component/responses.${responseName} missing "application/json" content`);
      }

      if (mediaTypeObject.schema === undefined) {
        throw new Error(
          `#/component/responses.${responseName} missing schema definition for "application/json" content`
        );
      }

      this.toolkit.outputDir.appendFileSync(
        'components/responses.ts',
        this.toolkit.formatCode(
          generateTypes(this.importsCache, {
            importPath: 'components/responses',
            schemaObject: mediaTypeObject.schema,
            schemaName: responseName,
          })
        )
      );
    }
  }

  private generateComponentRequestBodies(args: { document: OpenAPIV3.Document }) {
    const requestBodies = args.document.components?.requestBodies ?? {};

    for (const [requestBodyName, requestBody] of Object.entries<OpenAPIV3RequestBody>(requestBodies)) {
      if ('$ref' in requestBody) {
        this.toolkit.outputDir.appendFileSync(
          'components/request-bodies.ts',
          this.toolkit.formatCode(
            generateTypes(this.importsCache, {
              importPath: 'components/request-bodies',
              schemaObject: requestBody,
              schemaName: requestBodyName,
            })
          )
        );

        return;
      }

      const mediaTypeObject = requestBody.content?.['application/json'];

      if (mediaTypeObject === undefined) {
        throw new Error(`#/component/requestBodies.${requestBodyName} missing "application/json" content`);
      }

      if (mediaTypeObject.schema === undefined) {
        throw new Error(
          `#/component/requestBodies.${requestBodyName} missing schema definition for "application/json" content`
        );
      }

      this.toolkit.outputDir.appendFileSync(
        'components/request-bodies.ts',
        this.toolkit.formatCode(
          generateTypes(this.importsCache, {
            importPath: 'components/request-bodies',
            schemaObject: mediaTypeObject.schema,
            schemaName: requestBodyName,
          })
        )
      );
    }
  }

  private generateComponentSchemas(args: { document: OpenAPIV3.Document }) {
    const schemas = args.document.components?.schemas ?? {};

    for (const [schemaName, schemaObject] of Object.entries<OpenAPIV3Schema>(schemas)) {
      this.toolkit.outputDir.appendFileSync(
        'components/schemas.ts',
        this.toolkit.formatCode(
          generateTypes(this.importsCache, {
            importPath: 'components/schemas',
            schemaObject,
            schemaName,
          })
        )
      );
    }
  }

  onAfterAll(_args: { document: OpenAPIV3.Document }) {
    Array.from(this.importsCache).forEach(([importPath, imports]) => {
      const importsOutput = Array.from(imports)
        .map((importModule) => {
          return `import * as ${importModule} from "./${importModule}";`;
        })
        .concat('\n')
        .join('\n');

      this.toolkit.outputDir.prependFileSync(`${importPath}.ts`, importsOutput);
    });
  }

  onGenerateOperation(args: {
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
      `operations/${operationFilePath}.ts`,
      this.toolkit.formatCode(renderOperationFileSourceCode(args))
    );

    this.toolkit.outputDir.appendFileSync(
      `./operations/${indexFilePath}.ts`,
      renderOperationExportStatement({ operationExportPath: operationExportPath })
    );
  }
}

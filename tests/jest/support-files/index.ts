import path from 'path';
import { readOpenApiFile } from '../../../src/helpers';
import { TmpDir } from './tmp-dir';
import { OpenAPIV3 } from 'openapi-types';

const TMP_BASE_DIR = path.resolve(__dirname, '..', '..', '..', '.tmp');
const PET_STORE_FILE_PATH = path.resolve(__dirname, 'pet-store.json');

export function prepareTest(
  dirPath: string[],
  callback: (args: { tmpDir: TmpDir; openapiDocument: OpenAPIV3.Document }) => void
) {
  const tmpDir = new TmpDir(path.resolve(TMP_BASE_DIR, ...dirPath));

  tmpDir.resetDir();

  callback({
    tmpDir,
    openapiDocument: readOpenApiFile(PET_STORE_FILE_PATH),
  });
}

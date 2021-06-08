import path from 'path';
import { OpenapiWebSdkGenerator } from '../../../src/openapi-web-sdk-generator';
import { readOpenApiFile } from '../../../src/helpers';
import { TmpDir } from './tmp-dir';

const TMP_BASE_DIR = path.resolve(__dirname, '..', '..', '..', '.tmp');
const PET_STORE_FILE_PATH = path.resolve(__dirname, 'pet-store.json');

export function prepareTest(
  dirPath: string[],
  callback: (args: { tmpDir: TmpDir; generator: OpenapiWebSdkGenerator }) => void
) {
  const outputPath = path.resolve(TMP_BASE_DIR, ...dirPath);
  const tmpDir = new TmpDir(outputPath);
  const generator = new OpenapiWebSdkGenerator({
    document: readOpenApiFile(PET_STORE_FILE_PATH),
    paths: {
      outputDir: outputPath,
    },
  });

  tmpDir.resetDir();

  callback({ tmpDir, generator });
}

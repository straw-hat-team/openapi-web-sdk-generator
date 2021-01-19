import path from 'path';
import { OpenApiWebSdkGenerator } from '../../../src/open-api-web-sdk-generator';
import { readOpenApiFile } from '../../../src/helpers';
import { TmpDir } from './tmp-dir';

const TMP_BASE_DIR = path.resolve(__dirname, '..', '..', '..', '.tmp');
const PET_STORE_FILE_PATH = path.resolve(__dirname, 'pet-store.json');

export function prepareTest(
  dirPath: string[],
  callback: (args: { tmpDir: TmpDir; generator: OpenApiWebSdkGenerator }) => void
) {
  const outputPath = path.resolve(TMP_BASE_DIR, ...dirPath);
  const tmpDir = new TmpDir(outputPath);
  const generator = new OpenApiWebSdkGenerator({
    document: readOpenApiFile(PET_STORE_FILE_PATH),
    paths: {
      outputDir: outputPath,
    },
  });

  tmpDir.resetDir();

  callback({ tmpDir, generator });
}

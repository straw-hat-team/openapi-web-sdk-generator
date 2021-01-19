import path from 'path';
import fs from 'fs';
import { Dir } from '../../../src/dir';
import { OpenApiWebSdkGenerator } from '../../../src/open-api-web-sdk-generator';
import { readOpenApiFile } from '../../../src/helpers';

const TMP_BASE_DIR = path.resolve(__dirname, '..', '..', '..', '.tmp');
const PET_STORE_FILE_PATH = path.resolve(__dirname, 'pet-store.json');

class TmpDir extends Dir {
  exists(...pathsSegments: string[]) {
    const path = this.resolve(...pathsSegments);
    return fs.existsSync(path);
  }
}

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

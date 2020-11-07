import fs from 'fs';
import del from 'del';
import makeDir from 'make-dir';
import { createDebugger } from './debug';
import { Dir } from './dir';

export class OutputDir extends Dir {
  debug = createDebugger('out-dir');

  prepare(...pathsSegments: string[]) {
    if (!this.dirExists(...pathsSegments)) {
      this.createDir(...pathsSegments);
    }
    this.emptyDir(...pathsSegments);
  }

  dirExists(...pathsSegments: string[]) {
    const dirPath = this.resolve(...pathsSegments);
    return fs.existsSync(dirPath);
  }

  createDir(...pathsSegments: string[]) {
    const dirPath = this.resolve(...pathsSegments);
    this.debug(`Creating directory ${dirPath}`);
    return makeDir.sync(dirPath);
  }

  emptyDir(...pathsSegments: string[]) {
    const dirPath = this.resolve(...pathsSegments);
    this.debug(`Removing directory content of ${dirPath}`);
    return del.sync(`${dirPath}/**`);
  }
}

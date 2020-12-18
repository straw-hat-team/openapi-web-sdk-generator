import del from 'del';
import fs from 'fs';
import makeDir from 'make-dir';
import path from 'path';
import { createDebugger } from './debug';

export class Dir {
  protected debug = createDebugger('dir');
  private path: string;

  constructor(thePath: string) {
    this.path = thePath;
  }

  resetDir() {
    this.createDirSync('.');
    this.emptyDirSync('.');
  }

  emptyDirSync(...pathsSegments: string[]) {
    const dirPath = this.resolve(...pathsSegments);
    this.debug(`Removing directory content of ${dirPath}`);
    return del.sync(`${dirPath}/**`);
  }

  resolve(...pathsSegments: string[]) {
    return path.resolve(this.path, ...pathsSegments);
  }

  createDirSync(...pathsSegments: string[]) {
    const dirPath = this.resolve(...pathsSegments);
    this.debug(`Creating directory ${dirPath}`);
    return makeDir.sync(dirPath);
  }

  writeFileSync(relativePath: string, data: any) {
    const filePath = this.resolve(relativePath);
    this.debug(`Writing to ${filePath}`);
    return fs.writeFileSync(filePath, data);
  }

  appendFileSync(relativePath: string, data: any) {
    const filePath = this.resolve(relativePath);
    this.debug(`Appending to ${filePath}`);
    return fs.appendFileSync(filePath, data);
  }
}

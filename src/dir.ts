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
    this.ensureDir();
    this.emptyDir();
  }

  emptyDir() {
    return del.sync(`${this.path}/**/*`);
  }

  ensureDir() {
    return makeDir(this.path);
  }

  resolve(...pathsSegments: string[]) {
    return path.resolve(this.path, ...pathsSegments);
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

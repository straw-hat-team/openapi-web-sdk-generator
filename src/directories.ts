import del from 'del';
import EJS from 'ejs';
import fs from 'fs';
import makeDir from 'make-dir';
import path from 'path';
import { FancyMap } from '@straw-hat/fancy-map';
import { createDebugger } from './debug';

export class Dir {
  debug = createDebugger('dir');
  path: string;

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

export class OutDir extends Dir {
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

export class TemplateDir extends Dir {
  templates = new FancyMap<string, string>();

  render(relativePath: string, data = {}) {
    const templatePath = this.resolve(relativePath);
    const templateContent = this.templates.getOrSet(templatePath, () =>
      fs.readFileSync(templatePath, { encoding: 'utf8' })
    );

    return EJS.render(templateContent, data);
  }
}

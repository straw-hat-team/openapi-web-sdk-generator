import fs from 'fs';
import { Dir } from '../../../src/dir';

export class TmpDir extends Dir {
  exists(...pathsSegments: string[]) {
    const path = this.resolve(...pathsSegments);
    return fs.existsSync(path);
  }
}

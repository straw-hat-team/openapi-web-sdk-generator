import fs from 'fs';
import Mustache from 'mustache';
import { FancyMap } from '@straw-hat/fancy-map';
import { Dir } from './dir';
import { createDebugger } from './helpers';

export class TemplateDir extends Dir {
  protected debug = createDebugger('template-dir');
  private templates = new FancyMap<string, string>();

  render(relativePath: string, data: Record<any, any> = {}) {
    const templatePath = this.resolve(relativePath);
    const templateContent = this.templates.getOrSet(templatePath, () => {
      this.debug(`Reading template ${templatePath}`);
      return fs.readFileSync(templatePath, { encoding: 'utf8' });
    });

    return Mustache.render(templateContent, data);
  }
}

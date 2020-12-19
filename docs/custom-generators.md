# Custom generators

You could create your own generator. A generator extends from `CodeGenBase`
object, and you will have to define some callbacks:

```typescript
const path = require('path');
const { TemplateDir } = require('@straw-hat/openapi-web-sdk-generator/dist/template-dir');
const { CodegenBase } = require('@straw-hat/openapi-web-sdk-generator/dist/codegen-base');

// Define some template directory somewhere
const templateDir = new TemplateDir(path.join(__dirname, '..', 'templates'));

class MyCodegen extends CodegenBase {
  // You must override this callback
  generateOperation(args) {
    // Create some directories
    this.toolkit.outputDir.createDirSync('...');
    
    // Use template dir to render some files using EJS template engine
    const sourceCode = templateDir.render('my-file.ts.ejs', {
      functionName: args.operation.operationId,
    });
  
    // Format the code using prettier
    const formattedSourceCode = this.toolkit.formatCode(sourceCode);
    
    // Write to disk
    this.toolkit.outputDir.writeFileSync('.../my-file.ts', formattedSourceCode);
  }
}

module.exports = { MyCodegen };
```

export class MissingImplementation extends Error {
  ctor: any;

  constructor(ctor: any, methodName: string) {
    super(`${methodName} is not implemented in ${ctor.constructor.name} object`);
    this.ctor = ctor;
  }
}

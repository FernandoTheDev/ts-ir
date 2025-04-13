import { LLVMFunction } from "./LLVMFunction.ts";

export class LLVMModule {
  public globals: string[] = [];
  public externals: string[] = [];
  public functions: LLVMFunction[] = [];

  constructor(public name: string = "module") {}

  public addGlobal(declaration: string): void {
    this.globals.push(declaration);
  }

  public addExternal(declaration: string): void {
    this.externals.push(declaration);
  }

  public addFunction(func: LLVMFunction): void {
    this.functions.push(func);
  }

  public toString(): string {
    const extStr = this.externals.join("\n");
    const globalsStr = this.globals.join("\n");
    const funcsStr = this.functions.map((fn) => fn.toString()).join("\n\n");
    return `${extStr}\n\n${globalsStr}\n\n${funcsStr}`;
  }
}

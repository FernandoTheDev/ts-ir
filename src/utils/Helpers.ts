// src/utils/Helpers.ts
import { LLVMModule } from "../core/LLVMModule.ts";

export function createStringGlobal(
  module: LLVMModule,
  content: string,
): string {
  const escContent = content.replace(/\\/g, "\\5C").replace(/"/g, "\\22");
  const label = `@.str${module.globals.length}`;
  const decl = `${label} = private constant [${
    content.length + 1
  } x i8] c"${escContent}\\00"`;
  module.addGlobal(decl);
  return label;
}

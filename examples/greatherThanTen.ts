import { LLVMModule } from "../src/core/LLVMModule.ts";
import { LLVMFunction } from "../src/core/LLVMFunction.ts";
import { createStringGlobal } from "../src/utils/Helpers.ts";

const mod = new LLVMModule("Compare10");

mod.addExternal("declare i32 @printf(i8*, ...)");
mod.addExternal("declare i32 @scanf(i8*, ...)");

// Format strings
const printfFmt = "Enter a number: ";
const scanfFmt = "%d";
const msgLess = "It's less than 10\\n";
const msgEqual = "It's equal to 10\\n";
const msgGreater = "It's greater than 10\\n";

// Globais
const printfLabel = createStringGlobal(mod, printfFmt);
const scanfLabel = createStringGlobal(mod, scanfFmt);
const lessLabel = createStringGlobal(mod, msgLess);
const equalLabel = createStringGlobal(mod, msgEqual);
const greatLabel = createStringGlobal(mod, msgGreater);

// Função main
const main = new LLVMFunction("main", "i32", []);
mod.addFunction(main);

// Blocos
const entry = main.createBasicBlock("entry");
const ifLess = main.createBasicBlock("if_less");
const elseIfEqual = main.createBasicBlock("else_if_equal");
const equalBlock = main.createBasicBlock("equal");
const elseGreater = main.createBasicBlock("else_greater");
const endBlock = main.createBasicBlock("end");

// --- entry ---
const numPtr = entry.allocaInst("i32");

// prompt
const pFmtPtr = entry.getElementPtr(
  `[${printfFmt.length + 1} x i8]`,
  printfLabel,
);
entry.callInst("i32", "printf", [{ value: pFmtPtr.value, type: "i8*" }], [
  "i8*",
]);

// scanf
const sFmtPtr = entry.getElementPtr(
  `[${scanfFmt.length + 1} x i8]`,
  scanfLabel,
);
entry.callInst(
  "i32",
  "scanf",
  [{ value: sFmtPtr.value, type: "i8*" }, numPtr],
  ["i8*", "i32*"],
);

// load value
const numVal = entry.loadInst(numPtr);

// compare < 10
const cmpLess = entry.nextTemp();
entry.add(`${cmpLess} = icmp slt i32 ${numVal.value}, 10`);
entry.add(
  `br i1 ${cmpLess}, label %${ifLess.label}, label %${elseIfEqual.label}`,
);

// --- if_less ---
const lessPtr = ifLess.getElementPtr(
  `[${msgLess.length + 1} x i8]`,
  lessLabel,
);
ifLess.callInst("i32", "printf", [{ value: lessPtr.value, type: "i8*" }], [
  "i8*",
]);
ifLess.add(`br label %${endBlock.label}`);

// --- else_if_equal ---
const cmpEqual = elseIfEqual.nextTemp();
elseIfEqual.add(`${cmpEqual} = icmp eq i32 ${numVal.value}, 10`);
elseIfEqual.add(
  `br i1 ${cmpEqual}, label %${equalBlock.label}, label %${elseGreater.label}`,
);

// --- equal ---
const eqPtr = equalBlock.getElementPtr(
  `[${msgEqual.length + 1} x i8]`,
  equalLabel,
);
equalBlock.callInst("i32", "printf", [{ value: eqPtr.value, type: "i8*" }], [
  "i8*",
]);
equalBlock.add(`br label %${endBlock.label}`);

// --- else_greater ---
const gtPtr = elseGreater.getElementPtr(
  `[${msgGreater.length + 1} x i8]`,
  greatLabel,
);
elseGreater.callInst("i32", "printf", [{ value: gtPtr.value, type: "i8*" }], [
  "i8*",
]);
elseGreater.add(`br label %${endBlock.label}`);

// --- end ---
endBlock.retInst({ value: "0", type: "i32" });

// Imprime LLVM IR final
console.log(mod.toString());

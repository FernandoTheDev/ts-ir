import { LLVMModule } from "../src/core/LLVMModule.ts";
import { LLVMFunction } from "../src/core/LLVMFunction.ts";
import { LLVMBasicBlock as _LLVMBasicBlock } from "../src/core/LLVMBasicBlock.ts";
import { createStringGlobal } from "../src/utils/Helpers.ts";

const mod = new LLVMModule("Example");

mod.addExternal("declare i32 @printf(i8*, ...)");

const fmtStr = "Result: %d\n";
const fmtLabel = createStringGlobal(mod, fmtStr);

const mainFunc = new LLVMFunction("main", "i32", []);
mod.addFunction(mainFunc);

const entry = mainFunc.createBasicBlock("entry");

const varA = entry.allocaInst("i32");
const varB = entry.allocaInst("i32");

entry.storeInst({ value: "10", type: "i32" }, varA);
entry.storeInst({ value: "20", type: "i32" }, varB);

const aVal = entry.smartLoad(varA);
const bVal = entry.smartLoad(varB);

const sum = entry.smartAdd(aVal, bVal);

const fmtPtr = entry.getElementPtr(`[${fmtStr.length + 1} x i8]`, fmtLabel);
entry.callInst("i32", "printf", [fmtPtr, sum], ["i8*", "i32"]);

entry.retInst(sum);

console.log(mod.toString());

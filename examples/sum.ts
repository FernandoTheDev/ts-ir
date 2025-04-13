import { LLVMModule } from "../src/core/LLVMModule.ts";
import { LLVMFunction } from "../src/core/LLVMFunction.ts";
import { LLVMBasicBlock as _LLVMBasicBlock } from "../src/core/LLVMBasicBlock.ts";
import { createStringGlobal } from "../src/utils/Helpers.ts";
import { IRValue } from "../src/types/IRTypes.ts";

const mod = new LLVMModule("Sum");

mod.addExternal("declare i32 @printf(i8*, ...)");

const fmtStr = "%d + %d = %d\n";
const fmtLabel = createStringGlobal(mod, fmtStr);

const sumFunc = new LLVMFunction("sum", "i32", [
  { name: "x", type: "i32" },
  { name: "y", type: "i32" },
]);
mod.addFunction(sumFunc);

const sumEntry = sumFunc.createBasicBlock("entry");

const x_param: IRValue = { value: "%x", type: "i32" };
const y_param: IRValue = { value: "%y", type: "i32" };

const sumResult = sumEntry.smartAdd(x_param, y_param);

sumEntry.retInst(sumResult);

const mainFunc = new LLVMFunction("main", "i32", []);
mod.addFunction(mainFunc);

const entry = mainFunc.createBasicBlock("entry");

const x = entry.allocaInst("i32");
const y = entry.allocaInst("i32");

entry.storeInst({ value: "10", type: "i32" }, x);
entry.storeInst({ value: "20", type: "i32" }, y);

const x_val = entry.smartLoad(x);
const y_val = entry.smartLoad(y);

const result = entry.callInst("i32", "sum", [x_val, y_val], ["i32", "i32"]);
const fmtPtr = entry.getElementPtr(`[${fmtStr.length + 1} x i8]`, fmtLabel);

entry.callInst("i32", "printf", [fmtPtr, x_val, y_val, result], [
  "i8*",
  "i32",
  "i32",
  "i32",
]);

entry.retInst({ value: "0", type: "i32" });

console.log(mod.toString());

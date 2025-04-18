import { LLVMModule } from "../src/core/LLVMModule.ts";
import { LLVMFunction } from "../src/core/LLVMFunction.ts";
import { createStringGlobal } from "../src/utils/Helpers.ts";

const mod = new LLVMModule("ForLoop");

// Adiciona printf externo
mod.addExternal("declare i32 @printf(i8*, ...)");

// Mensagem formatada
const msg = "Value of i: %d\n";
const msgLabel = createStringGlobal(mod, msg);

// Função main
const main = new LLVMFunction("main", "i32", []);
mod.addFunction(main);

// Blocos
const entry = main.createBasicBlock("entry");
const condBlock = main.createBasicBlock("for.cond");
const bodyBlock = main.createBasicBlock("for.body");
const incBlock = main.createBasicBlock("for.inc");
const endBlock = main.createBasicBlock("for.end");

// --- entry ---
const ptrI = entry.allocaInst("i32");
entry.storeInst({ value: "0", type: "i32" }, ptrI); // i = 0
entry.add(`br label %${condBlock.label}`);

// --- cond ---
const iCond = condBlock.loadInst(ptrI); // load i
const cmp = condBlock.nextTemp();
condBlock.add(`${cmp} = icmp slt i32 ${iCond.value}, 5`);
condBlock.add(
  `br i1 ${cmp}, label %${bodyBlock.label}, label %${endBlock.label}`,
);

// --- body ---
const iBody = bodyBlock.loadInst(ptrI);
const msgPtr = bodyBlock.getElementPtr(`[${msg.length + 1} x i8]`, msgLabel);
bodyBlock.callInst("i32", "printf", [
  { value: msgPtr.value, type: "i8*" },
  { value: iBody.value, type: "i32" },
], ["i8*", "i32"]);
bodyBlock.add(`br label %${incBlock.label}`);

// --- inc ---
const iOld = incBlock.loadInst(ptrI);
const iNext = incBlock.nextTemp();
incBlock.add(`${iNext} = add i32 ${iOld.value}, 1`);
incBlock.storeInst({ value: iNext, type: "i32" }, ptrI);
incBlock.add(`br label %${condBlock.label}`);

// --- end ---
endBlock.retInst({ value: "0", type: "i32" });

// LLVM IR final
console.log(mod.toString());

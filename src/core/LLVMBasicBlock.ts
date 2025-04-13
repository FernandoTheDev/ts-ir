import { TempCounter } from "./TempCounter.ts";
import { IRValue } from "../types/IRTypes.ts";

export class LLVMBasicBlock {
  public instructions: string[] = [];
  constructor(public label: string, private tempCounter: TempCounter) {}

  public add(instruction: string): void {
    this.instructions.push("  " + instruction);
  }

  public nextTemp(): string {
    return this.tempCounter.next();
  }

  // Arithmetic operations
  public addInst(op1: string, op2: string, tipo: string = "i32"): string {
    const temp = this.nextTemp();
    this.add(`${temp} = add ${tipo} ${op1}, ${op2}`);
    return temp;
  }

  public subInst(op1: string, op2: string, tipo: string = "i32"): string {
    const temp = this.nextTemp();
    this.add(`${temp} = sub ${tipo} ${op1}, ${op2}`);
    return temp;
  }

  public mulInst(op1: string, op2: string, tipo: string = "i32"): string {
    const temp = this.nextTemp();
    this.add(`${temp} = mul ${tipo} ${op1}, ${op2}`);
    return temp;
  }

  public divInst(op1: string, op2: string, tipo: string = "i32"): string {
    const temp = this.nextTemp();
    this.add(`${temp} = sdiv ${tipo} ${op1}, ${op2}`);
    return temp;
  }

  // Memory manipulation instructions
  public allocaInst(varType: string = "i32"): IRValue {
    const temp = this.nextTemp();
    this.add(`${temp} = alloca ${varType}, align 4`);
    return { value: temp, type: varType + "*" };
  }

  public storeInst(value: IRValue, ptr: IRValue): void {
    if (!ptr.type.endsWith("*")) {
      throw new Error(
        `Erro: Tentativa de armazenar em um operando que não é ponteiro (${ptr.value} do tipo ${ptr.type}).`,
      );
    }
    const pointedType = ptr.type.slice(0, -1);
    if (value.type !== pointedType) {
      throw new Error(
        `Erro: Tipos incompatíveis em store. Esperava ${pointedType} mas recebeu ${value.type}.`,
      );
    }
    this.add(
      `store ${pointedType} ${value.value}, ${pointedType}* ${ptr.value}, align 4`,
    );
  }

  public loadInst(ptr: IRValue): IRValue {
    if (!ptr.type.endsWith("*")) {
      throw new Error(
        `Erro: Tentativa de load em um operando não ponteiro (${ptr.value} do tipo ${ptr.type}).`,
      );
    }
    const pointedType = ptr.type.slice(0, -1);
    const temp = this.nextTemp();
    this.add(
      `${temp} = load ${pointedType}, ${pointedType}* ${ptr.value}, align 4`,
    );
    return { value: temp, type: pointedType };
  }

  public callInst(
    retType: string,
    funcName: string,
    args: IRValue[],
    argTypes: string[],
  ): IRValue {
    const temp = this.nextTemp();
    const argsStr = args.map((arg, i) => `${argTypes[i]} ${arg.value}`).join(
      ", ",
    );
    this.add(`${temp} = call ${retType} @${funcName}(${argsStr})`);
    return { value: temp, type: retType };
  }

  public retInst(value: IRValue): void {
    this.add(`ret ${value.type} ${value.value}`);
  }

  public getElementPtr(arrayType: string, globalLabel: string): IRValue {
    const temp = this.nextTemp();
    this.add(
      `${temp} = getelementptr inbounds ${arrayType}, ${arrayType}* ${globalLabel}, i32 0, i32 0`,
    );
    return { value: temp, type: "i8*" };
  }

  // "Smart" methods to evaluate if the operand is a pointer
  public isPointer(val: IRValue): boolean {
    return val.type.endsWith("*");
  }

  public smartLoad(val: IRValue): IRValue {
    if (this.isPointer(val)) {
      return this.loadInst(val);
    }
    return val;
  }

  public smartAdd(op1: IRValue, op2: IRValue): IRValue {
    const op1IsPtr = this.isPointer(op1);
    const op2IsPtr = this.isPointer(op2);

    if (op1IsPtr && !op2IsPtr) {
      const baseType = op1.type.slice(0, -1);
      const temp = this.nextTemp();
      this.add(
        `${temp} = getelementptr inbounds ${baseType}, ${baseType}* ${op1.value}, i32 ${op2.value}`,
      );
      return { value: temp, type: op1.type };
    } else if (!op1IsPtr && !op2IsPtr) {
      const temp = this.nextTemp();
      if (op1.type !== op2.type) {
        throw new Error(
          `Erro de tipos na soma: ${op1.type} e ${op2.type} são incompatíveis.`,
        );
      }
      this.add(`${temp} = add ${op1.type} ${op1.value}, ${op2.value}`);
      return { value: temp, type: op1.type };
    } else if (op1IsPtr && op2IsPtr) {
      throw new Error("Erro: Não é possível somar dois ponteiros.");
    } else {
      throw new Error(
        "Erro: Para aritmética de ponteiros, o ponteiro deve ser o primeiro operando e o índice (inteiro) o segundo.",
      );
    }
  }

  /**
   * toPtr utility method:
   * If IRValue is already a pointer, returns it; otherwise,
   * allocates space, stores it, and returns the pointer.
   */
  public toPtr(val: IRValue): IRValue {
    if (this.isPointer(val)) {
      return val;
    }
    const ptr = this.allocaInst(val.type);
    this.storeInst(val, ptr);
    return ptr;
  }

  public toString(): string {
    return `${this.label}:\n${this.instructions.join("\n")}`;
  }
}

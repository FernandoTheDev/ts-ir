# ts-ir

LLVM IR code generator completely from scratch, no need for external dependencies, use of ffi and other things.

## Example

Run the following commands

```bash
deno run examples/example.ts >> test.ll
```

```bash
clang test.ll -o test; ./test
```

Output

```bash
Result: 30
```

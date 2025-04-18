# ts-ir

<p align="center">
  <img src="assets/img.png" width="500" alt="ts-ir logo"/>
</p>

A lightweight LLVM IR code generator built completely from scratch, with no external dependencies, FFI, or third-party libraries.

## Examples

### Example 1: Basic Addition

Generate IR code:

```bash
deno run examples/example.ts >> test.ll
```

Generated LLVM IR:

```llvm
declare i32 @printf(i8*, ...)

@.str0 = private constant [12 x i8] c"Result: %d\00"

define i32 @main() {
entry:
  %t0 = alloca i32, align 4
  %t1 = alloca i32, align 4
  store i32 10, i32* %t0, align 4
  store i32 20, i32* %t1, align 4
  %t2 = load i32, i32* %t0, align 4
  %t3 = load i32, i32* %t1, align 4
  %t4 = add i32 %t2, %t3
  %t5 = getelementptr inbounds [12 x i8], [12 x i8]* @.str0, i32 0, i32 0
  %t6 = call i32 @printf(i8* %t5, i32 %t4)
  ret i32 %t4
}
```

Compile and run:

```bash
clang test.ll -o test
./test
```

Output:

```
Result: 30
```

### Example 2: Function Call

Generate IR code:

```bash
deno run examples/sum.ts >> sum.ll
```

Generated LLVM IR:

```llvm
declare i32 @printf(i8*, ...)

@.str0 = private constant [14 x i8] c"%d + %d = %d\00"

define i32 @sum(i32 %x, i32 %y) {
entry:
  %t0 = add i32 %x, %y
  ret i32 %t0
}

define i32 @main() {
entry:
  %t0 = alloca i32, align 4
  %t1 = alloca i32, align 4
  store i32 10, i32* %t0, align 4
  store i32 20, i32* %t1, align 4
  %t2 = load i32, i32* %t0, align 4
  %t3 = load i32, i32* %t1, align 4
  %t4 = call i32 @sum(i32 %t2, i32 %t3)
  %t5 = getelementptr inbounds [14 x i8], [14 x i8]* @.str0, i32 0, i32 0
  %t6 = call i32 @printf(i8* %t5, i32 %t2, i32 %t3, i32 %t4)
  ret i32 0
}
```

Compile and run:

```bash
clang sum.ll -o sum
./sum
```

Output:

```
10 + 20 = 30
```

### Example 3: Greater than ten

Generate IR code:

```bash
deno run examples/greatherThanTen.ts >> ten.ll
```

Generated LLVM IR:

```llvm
declare i32 @printf(i8*, ...)
declare i32 @scanf(i8*, ...)

@.str0 = private constant [17 x i8] c"Enter a number: \00"
@.str1 = private constant [3 x i8] c"%d\00"
@.str2 = private constant [20 x i8] c"It's less than 10\5Cn\00"
@.str3 = private constant [19 x i8] c"It's equal to 10\5Cn\00"
@.str4 = private constant [23 x i8] c"It's greater than 10\5Cn\00"

define i32 @main() {
entry:
  %t0 = alloca i32, align 4
  %t1 = getelementptr inbounds [17 x i8], [17 x i8]* @.str0, i32 0, i32 0
  %t2 = call i32 @printf(i8* %t1)
  %t3 = getelementptr inbounds [3 x i8], [3 x i8]* @.str1, i32 0, i32 0
  %t4 = call i32 @scanf(i8* %t3, i32* %t0)
  %t5 = load i32, i32* %t0, align 4
  %t6 = icmp slt i32 %t5, 10
  br i1 %t6, label %if_less, label %else_if_equal
if_less:
  %t7 = getelementptr inbounds [20 x i8], [20 x i8]* @.str2, i32 0, i32 0
  %t8 = call i32 @printf(i8* %t7)
  br label %end
else_if_equal:
  %t9 = icmp eq i32 %t5, 10
  br i1 %t9, label %equal, label %else_greater
equal:
  %t10 = getelementptr inbounds [19 x i8], [19 x i8]* @.str3, i32 0, i32 0
  %t11 = call i32 @printf(i8* %t10)
  br label %end
else_greater:
  %t12 = getelementptr inbounds [23 x i8], [23 x i8]* @.str4, i32 0, i32 0
  %t13 = call i32 @printf(i8* %t12)
  br label %end
end:
  ret i32 0
}
```

Compile and run:

```bash
clang ten.ll -o ten

./ten
Enter a number: 10
It's equal to 10

./ten
Enter a number: 100
It's greater than 10

./ten
Enter a number: 1
It's less than 10
```

### Example 4: For Loop

Generate IR code:

```bash
deno run examples/for.ts >> for.ll
```

Generated LLVM IR:

```llvm
declare i32 @printf(i8*, ...)

@.str0 = private constant [16 x i8] c"Value of i: %d
\00"

define i32 @main() {
entry:
  %t0 = alloca i32, align 4
  store i32 0, i32* %t0, align 4
  br label %for.cond
for.cond:
  %t1 = load i32, i32* %t0, align 4
  %t2 = icmp slt i32 %t1, 5
  br i1 %t2, label %for.body, label %for.end
for.body:
  %t3 = load i32, i32* %t0, align 4
  %t4 = getelementptr inbounds [16 x i8], [16 x i8]* @.str0, i32 0, i32 0
  %t5 = call i32 @printf(i8* %t4, i32 %t3)
  br label %for.inc
for.inc:
  %t6 = load i32, i32* %t0, align 4
  %t7 = add i32 %t6, 1
  store i32 %t7, i32* %t0, align 4
  br label %for.cond
for.end:
  ret i32 0
}
```

Compile and run:

```bash
clang for.ll -o for
./for
```

Output:

```
./for
Value of i: 0
Value of i: 1
Value of i: 2
Value of i: 3
Value of i: 4
```

## Project Status

⚠️ **Development Status**: This library is currently in early development and is considered **experimental**. Bugs and incomplete features are expected.

**DO NOT USE IN PRODUCTION ENVIRONMENTS.**

The API is unstable and subject to change without notice as we continue to refine the implementation.

## Contributing

Contributions are welcome! Feel free to:
- Submit bug reports
- Propose new features
- Create pull requests
- Improve documentation

## License

[MIT License](LICENSE)

## Author

Created and maintained by Fernando - [@fernandothedev](https://github.com/fernandothedev)

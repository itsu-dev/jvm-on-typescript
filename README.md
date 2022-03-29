# jvm-on-typescript
A tiny JVM (Java Virtual Machine) program written in TypeScript.  
This virtual machine specification compliants [Java Virtual Machine Specification (Java 8 Edition)](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html).

## Functions
- Print "Hello, World!"

## Usage
### Instant Run
1. Open index.html on Browser.
2. Select a *.class file.
3. Open "Developer Tool" and open "Console" tab.

## Run in code
```TypeScript
const buffer: ArrayBuffer = new ArrayBuffer();  // Binary data of the class file;
const jvm = new JVM(buffer);
jvm.load();  // Load class file and invoke main method.
```

## References
- [Java Virtual Machine Specification (Java 8 Edition)](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html)
- [PHPでJVMを実装してHello Worldを出力するまで (How to implement JVM in PHP and print "Hello, World".)](https://speakerdeck.com/memory1994/php-de-jvm-woshi-zhuang-site-hello-world-wochu-li-surumade)

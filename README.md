# jvm-on-typescript
A tiny JVM (Java Virtual Machine) program written in TypeScript.  
This virtual machine specification compliants [Java Virtual Machine Specification (Java 8 Edition)](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html).

## Functions
- Print "Hello, World!"
- int x = 1;
- sum of int, String (E.g. "A" + "B", 1 + 2)

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
- [バイトコード (ByteCode)](https://www.ne.jp/asahi/hishidama/home/tech/java/bytecode.html)
- [JVM Stacks and Stack Frames](https://alvinalexander.com/scala/fp-book/recursion-jvm-stacks-stack-frames/)
- [Hotspot JVMのFrameについて (About Frame on Hotspot JVM)](https://blog.tiqwab.com/2019/08/25/openjdk-frame.html#:~:text=Hotspot%20JVM%20%E3%81%AE%20Template%20Interpreter,%E3%82%82%E3%81%AE%E3%81%8C%E5%90%AB%E3%81%BE%E3%82%8C%E3%81%BE%E3%81%99%E3%80%82)
- [Use cases of jvm dup instruction (StackOverFlow)](https://stackoverflow.com/questions/54781284/use-cases-of-jvm-dup-instruction)

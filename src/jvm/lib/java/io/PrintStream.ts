import {FilterOutputStream} from "./FilterOutputStream.js";
import {JavaObject} from "../lang/JavaObject.js";
import {OutputStream} from "./OutputStream.js";
import {System} from "../lang/System.js";

export class PrintStream extends FilterOutputStream {

    private out: OutputStream = new OutputStream();

    constructor();

    constructor(o?: OutputStream) {
        super();

        if (!o) this.out = o
    }

    print();
    print(b: boolean);
    print(n: number);
    print(obj: JavaObject);
    print(s: string);

    print(arg?: any) {
        this.write(new TextEncoder().encode(String(arg ? arg : "")))
    }

    println();
    println(b: boolean);
    println(n: number);
    println(obj: JavaObject);
    println(s: string);

    println(arg?: any) {
        this.write(new TextEncoder().encode(String(arg ? arg : "") + "\n"))
    }

    toString(): string {
        return `java.io.PrintStream`;
    }

}
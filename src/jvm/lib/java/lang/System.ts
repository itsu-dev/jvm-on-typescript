import {JavaObject} from "./JavaObject.js";
import {PrintStream} from "../io/PrintStream.js";

export class System extends JavaObject {

    static readonly out: PrintStream = new PrintStream();
    static readonly err: PrintStream = new PrintStream();
    static readonly _instance: System = new System();

    private constructor() {
        super();
    }

    toString(): string {
        return `java.lang.System`;
    }

}
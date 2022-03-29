import {JavaObject} from "./JavaObject.js";

export class StringBuilder extends JavaObject {

    private value: string = "";

    constructor() {
        super();
    }

    append(str: string);
    append(b: boolean);
    append(n: number);
    append(obj: JavaObject);

    append(a: any): StringBuilder {
        this.value += String(a);
        return this;
    }

    toString(): string {
        return this.value;
    }

}
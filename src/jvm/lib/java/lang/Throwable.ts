import {Serializable} from "../io/Serializable.js";

export class Throwable implements Serializable{

    message: string;

    constructor();

    constructor(message?: string) {
        this.message = message ? message : ".js";
    }

    printStackTrace() {
        console.error(toString());
    }

    toString(): string {
        return `java.lang.Throwable: ${this.message}`;
    }

}
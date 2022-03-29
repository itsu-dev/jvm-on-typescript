import {Error} from "./Error.js";

export class LinkageError extends Error {

    constructor();

    constructor(message?: string) {
        super();
        this.message = message;
    }

    toString(): string {
        return `java.lang.LinkageError: ${this.message}`;
    }

}
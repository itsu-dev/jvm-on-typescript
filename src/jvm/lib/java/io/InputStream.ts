import {JavaObject} from "../lang/JavaObject.js";
import Closeable from "./Closeable.js";

export default abstract class InputStream extends JavaObject implements Closeable {

    abstract available(): number;
    abstract close();
    abstract mark(readlimit: number);
    abstract markSupported(): boolean;
    abstract read(): number;
    abstract read(b: Uint8Array);
    abstract read(b: Uint8Array, off: number, len: number): number;
    abstract reset();
    abstract skip(n: number): number;

}
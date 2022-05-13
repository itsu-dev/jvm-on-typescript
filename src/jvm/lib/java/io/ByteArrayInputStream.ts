import InputStream from "./InputStream.js";

export default class ByteArrayInputStream extends InputStream {

    protected buf: Uint8Array;
    protected count: number;
    protected _mark: number;
    protected pos: number;

    constructor(buf: Uint8Array);
    constructor(buf: Uint8Array, offset?: number, length?: number) {
        super();
        if (offset == null) offset = 0;
        if (length == null) length = buf.length;
        this.buf = buf;
        this.count = length;
        this._mark = 0;
        this.pos = offset;
    }

    available(): number {
        return this.count - this.pos;
    }

    close() {
        this.buf = undefined;
    }

    mark(readAheadLimit: number) {
        this._mark = readAheadLimit;
    }

    markSupported(): boolean {
        return true;
    }

    read(): number;
    read(b: number[]);
    read(b: number[], off: number, len: number): number;
    read(b?: number[], off?: number, len?: number): number {
        if (this.pos === this.count) return -1;

        if (b == null) b = [];
        if (off == null) off = 0;
        if (len == null) len = b.length;

        let k = Math.min(len, this.available());
        if (k >= 0) {
            for (let i = this.pos; i < this.pos + k; i++) {
                b[off + i] = this.buf[this.pos + i];
            }
            this.pos += k;
        }

        return k;
    }

    reset() {
        this.pos = this._mark;
    }

    skip(n: number): number {
        let k = Math.min(n, this.available());
        this.pos += k;
        return k;
    }

}
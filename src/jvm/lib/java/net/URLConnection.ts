import {JavaObject} from "../lang/JavaObject.js";
import {IllegalStateException} from "../lang/IllegalStateException.js";
import {throwErrorOrException} from "../../../jvm.js";
import URL from "./URL.js";
import InputStream from "../io/InputStream.js";

export default abstract class URLConnection extends JavaObject {

    private allowUserInteraction: boolean = false;
    protected connected: boolean = false;
    protected doInput: boolean = true;
    protected doOutput: boolean = false;
    protected url: URL = undefined;
    protected ifModifiedSince: number = undefined;
    protected useCaches: boolean = false;
    private requestProperties: {} = {};

    // TODO delete
    protected inputStream: InputStream = undefined;

    protected constructor(url: URL) {
        super();
        this.url = url;
    }

    abstract connect();

    getInputStream(): InputStream {
        return this.inputStream;
    }

    getURL(): URL {
        return this.url;
    }

    setDoInput(doInput: boolean) {
        if (this.connected) throwErrorOrException(new IllegalStateException());

        this.doInput = doInput;
    }

    setDoOutput(doOutput: boolean) {
        if (this.connected) throwErrorOrException(new IllegalStateException());

        this.doOutput = doOutput;
    }

    setRequestProperty(key: string, value: string) {
        if (this.connected) throwErrorOrException(new IllegalStateException());

        this.requestProperties[key] = value;
    }

    addRequestProperty(key: string, value: string) {
        if (this.connected) throwErrorOrException(new IllegalStateException());

        this.requestProperties[key] = value;
    }

    getRequestProperty(key: string): string {
        if (this.connected) throwErrorOrException(new IllegalStateException());

        return this.requestProperties[key];
    }

}
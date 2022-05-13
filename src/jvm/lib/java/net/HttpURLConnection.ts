import URLConnection from "./URLConnection.js";
import URL from "./URL.js";
import ByteArrayInputStream from "../io/ByteArrayInputStream.js";

export default class HttpURLConnection extends URLConnection {

    static readonly HTTP_ACCEPTED = 202;
    static readonly HTTP_BAD_GATEWAY = 502;
    static readonly HTTP_BAD_METHOD = 405;
    static readonly HTTP_BAD_REQUEST = 400;
    static readonly HTTP_CLIENT_TIMEOUT = 408;
    static readonly HTTP_CONFLICT = 409;
    static readonly HTTP_CREATED = 201;
    static readonly HTTP_ENTITY_TOO_LARGE = 413;
    static readonly HTTP_FORBIDDEN = 403;
    static readonly HTTP_GATEWAY_TIMEOUT = 504;
    static readonly HTTP_GONE = 410;
    static readonly HTTP_INTERNAL_ERROR = 500;
    static readonly HTTP_LENGTH_REQUIRED = 411;
    static readonly HTTP_MOVED_PERM = 301;
    static readonly HTTP_MOVED_TEMP = 302;
    static readonly HTTP_MULT_CHOICE = 300;
    static readonly HTTP_NO_CONTENT = 204;
    static readonly HTTP_NOT_ACCEPTABLE = 406;
    static readonly HTTP_NOT_AUTHORITATIVE = 203;
    static readonly HTTP_NOT_FOUND = 404;
    static readonly HTTP_NOT_IMPLEMENTED = 501;
    static readonly HTTP_NOT_MODIFIED = 304;
    static readonly HTTP_OK = 200;
    static readonly HTTP_PARTIAL = 206;
    static readonly HTTP_PAYMENT_REQUIRED = 402;
    static readonly HTTP_PRECON_FAILED = 412;
    static readonly HTTP_PROXY_AUTH = 407;
    static readonly HTTP_REQ_TOO_LONG = 414;
    static readonly HTTP_RESET = 205;
    static readonly HTTP_SEE_OTHER = 303;
    static readonly HTTP_UNAUTHORIZED = 401;
    static readonly HTTP_UNAVAILABLE = 503;
    static readonly HTTP_UNSUPPORTED_TYPE = 415;
    static readonly HTTP_USE_PROXY = 305;
    static readonly HTTP_VERSION = 505;

    protected instanceFollowRedirects: boolean = false;
    protected method: string = "GET";
    protected responseCode: number = -1;
    protected responseMessage?: string = null;
    private requestHeaders: {} = {};

    public constructor(u: URL) {
        super(u);
    }

    async connect() {
        if (this.connected) return;

        const response = await fetch(this.url.toString(), {
            method: this.method,
            "mode": "cors"
        });

        if (response.ok) {
            const text = await response.text();
            this.responseCode = response.status;
            this.responseMessage = response.statusText;
            this.inputStream = new ByteArrayInputStream(new TextEncoder().encode(text));
        }
    }

    setRequestMethod(method: string) {
        this.method = method;
    }

    getRequestMethod(): string {
        return this.method;
    }

}
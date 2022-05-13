import {JavaObject} from "../lang/JavaObject.js";
import URLConnection from "./URLConnection.js";
import URL from "./URL.js";

export default abstract class URLStreamHandler extends JavaObject {

    constructor() {
        super();
    }

    abstract openConnection(u: URL): URLConnection;

}
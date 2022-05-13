import {JavaObject} from "../lang/JavaObject.js";
import URLConnection from "./URLConnection.js";
import {Serializable} from "../io/Serializable.js";
import URLStreamHandlerFactory from "./URLStreamHandlerFactory.js";
import URLStreamHandler from "./URLStreamHandler.js";
import HttpURLConnection from "./HttpURLConnection.js";

export default class URL extends JavaObject implements Serializable {

    spec: string;
    protocol: string;

    urlStreamHandlerFactory: URLStreamHandlerFactory;

    constructor(spec: string) {
        super();
        this.spec = spec;
        this.protocol = spec.split("://")[0];
        this.urlStreamHandlerFactory = new class implements URLStreamHandlerFactory {
            createURLStreamHandler(protocol: string) {
                switch(protocol) {
                    case "https":
                    case "http": {
                        return new class extends URLStreamHandler {
                            openConnection(u: URL): URLConnection {
                                return new HttpURLConnection(u);
                            }
                        }
                    }

                    default: {
                        return undefined;
                    }
                }
            }
        }
    }

    openConnection(): URLConnection {
        return this.urlStreamHandlerFactory.createURLStreamHandler(this.protocol).openConnection(this);
    }

    setURLStreamHandlerFactory(fac: URLStreamHandlerFactory) {
        this.urlStreamHandlerFactory = fac;
    }

    toString(): string {
        return this.spec;
    }

}
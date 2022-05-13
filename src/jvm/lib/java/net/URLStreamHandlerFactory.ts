import URLStreamHandler from "./URLStreamHandler.js";
import URLConnection from "./URLConnection.js";

export default interface URLStreamHandlerFactory {

    createURLStreamHandler(protocol: string);

}
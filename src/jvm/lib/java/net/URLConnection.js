var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { JavaObject } from "../lang/JavaObject.js";
import { IllegalStateException } from "../lang/IllegalStateException.js";
import { throwErrorOrException } from "../../../jvm.js";
var URLConnection = /** @class */ (function (_super) {
    __extends(URLConnection, _super);
    function URLConnection(url) {
        var _this = _super.call(this) || this;
        _this.allowUserInteraction = false;
        _this.connected = false;
        _this.doInput = true;
        _this.doOutput = false;
        _this.url = undefined;
        _this.ifModifiedSince = undefined;
        _this.useCaches = false;
        _this.requestProperties = {};
        // TODO delete
        _this.inputStream = undefined;
        _this.url = url;
        return _this;
    }
    URLConnection.prototype.getInputStream = function () {
        return this.inputStream;
    };
    URLConnection.prototype.getURL = function () {
        return this.url;
    };
    URLConnection.prototype.setDoInput = function (doInput) {
        if (this.connected)
            throwErrorOrException(new IllegalStateException());
        this.doInput = doInput;
    };
    URLConnection.prototype.setDoOutput = function (doOutput) {
        if (this.connected)
            throwErrorOrException(new IllegalStateException());
        this.doOutput = doOutput;
    };
    URLConnection.prototype.setRequestProperty = function (key, value) {
        if (this.connected)
            throwErrorOrException(new IllegalStateException());
        this.requestProperties[key] = value;
    };
    URLConnection.prototype.addRequestProperty = function (key, value) {
        if (this.connected)
            throwErrorOrException(new IllegalStateException());
        this.requestProperties[key] = value;
    };
    URLConnection.prototype.getRequestProperty = function (key) {
        if (this.connected)
            throwErrorOrException(new IllegalStateException());
        return this.requestProperties[key];
    };
    return URLConnection;
}(JavaObject));
export default URLConnection;
//# sourceMappingURL=URLConnection.js.map
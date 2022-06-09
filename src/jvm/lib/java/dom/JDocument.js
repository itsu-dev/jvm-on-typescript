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
import JNode from "./nodes/JNode.js";
import JHTMLElement from "./nodes/JHTMLElement.js";
import JNodeListOf from "./collection/JNodeListOf.js";
var JDocument = /** @class */ (function (_super) {
    __extends(JDocument, _super);
    function JDocument(ref) {
        return _super.call(this, ref) || this;
    }
    JDocument._valueOf = function (ref) {
        return new JDocument(ref);
    };
    JDocument.getDefault = function () {
        return this.defaultRef;
    };
    JDocument.prototype._get = function () {
        return this.ref;
    };
    JDocument.prototype.getElementById = function (elementId) {
        var element = this._get().getElementById(elementId);
        return element == null ? null : JHTMLElement._valueOf(element);
    };
    JDocument.prototype.getElementByName = function (elementName) {
        var elements = this._get().getElementsByName(elementName);
        return elements == null ? null : JNodeListOf._valueOf(elements);
    };
    JDocument.defaultRef = JDocument._valueOf(document);
    return JDocument;
}(JNode));
export default JDocument;
//# sourceMappingURL=JDocument.js.map
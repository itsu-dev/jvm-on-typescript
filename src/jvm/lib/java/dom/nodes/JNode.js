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
import { JavaObject } from "../../lang/JavaObject.js";
import JDocument from "../JDocument.js";
var JNode = /** @class */ (function (_super) {
    __extends(JNode, _super);
    function JNode(ref) {
        var _this = _super.call(this) || this;
        _this.ref = ref;
        return _this;
    }
    JNode._valueOf = function (ref) {
        return new JNode(ref);
    };
    JNode.prototype.getBaseURI = function () {
        return this.ref.baseURI;
    };
    JNode.prototype.getFirstChild = function () {
        return this.ref.firstChild == null ? null : JNode._valueOf(this.ref.firstChild);
    };
    JNode.prototype.isConnected = function () {
        return this.ref.isConnected;
    };
    JNode.prototype.getLastChild = function () {
        return this.ref.lastChild == null ? null : JNode._valueOf(this.ref.lastChild);
    };
    JNode.prototype.getNamespaceURI = function () {
        return this.ref.namespaceURI;
    };
    JNode.prototype.getNextSibling = function () {
        return this.ref.nextSibling == null ? null : JNode._valueOf(this.ref.nextSibling);
    };
    JNode.prototype.getNodeName = function () {
        return this.ref.nodeName;
    };
    JNode.prototype.getNodeType = function () {
        return this.ref.nodeType;
    };
    JNode.prototype.getNodeValue = function () {
        return this.ref.nodeValue;
    };
    JNode.prototype.setNodeValue = function (value) {
        this.ref.nodeValue = value;
    };
    JNode.prototype.getOwnerDocument = function () {
        return this.ref.ownerDocument == null ? null : JDocument._valueOf(this.ref.ownerDocument);
    };
    return JNode;
}(JavaObject));
export default JNode;
//# sourceMappingURL=JNode.js.map
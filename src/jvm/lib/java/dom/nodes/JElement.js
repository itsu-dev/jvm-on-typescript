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
import JNode from "./JNode.js";
import JDocument from "../JDocument.js";
var JElement = /** @class */ (function (_super) {
    __extends(JElement, _super);
    function JElement(ref) {
        return _super.call(this, ref) || this;
    }
    JElement._valueOf = function (ref) {
        return new JElement(ref);
    };
    JElement.prototype._get = function () {
        return this.ref;
    };
    JElement.prototype.addInnerHTML = function (innerHTML) {
        this._get().innerHTML += innerHTML;
    };
    JElement.prototype.setInnerHTML = function (innerHTML) {
        this._get().innerHTML = innerHTML;
    };
    JElement.prototype.getInnerHTML = function () {
        return this._get().innerHTML;
    };
    JElement.prototype.getClassName = function () {
        return this._get().className;
    };
    JElement.prototype.setClassName = function (className) {
        this._get().className = className;
    };
    JElement.prototype.getClientHeight = function () {
        return this._get().clientHeight;
    };
    JElement.prototype.getClientLeft = function () {
        return this._get().clientLeft;
    };
    JElement.prototype.getClientTop = function () {
        return this._get().clientTop;
    };
    JElement.prototype.getClientWidth = function () {
        return this._get().clientWidth;
    };
    JElement.prototype.getId = function () {
        return this._get().id;
    };
    JElement.prototype.getLocalName = function () {
        return this._get().localName;
    };
    JElement.prototype.getNamespaceURI = function () {
        return this._get().namespaceURI;
    };
    JElement.prototype.getOwnerDocument = function () {
        return this._get().ownerDocument == null ? null : JDocument._valueOf(this._get().ownerDocument);
    };
    JElement.prototype.getPrefix = function () {
        return this._get().prefix == null ? null : this._get().prefix;
    };
    JElement.prototype.getScrollHeight = function () {
        return this._get().scrollHeight;
    };
    JElement.prototype.getScrollLeft = function () {
        return this._get().scrollLeft;
    };
    JElement.prototype.setScrollLeft = function (scrollLeft) {
        this._get().scrollLeft = scrollLeft;
    };
    JElement.prototype.getScrollTop = function () {
        return this._get().scrollTop;
    };
    JElement.prototype.setScrollTop = function (scrollTop) {
        this._get().scrollTop = scrollTop;
    };
    JElement.prototype.getScrollWidth = function () {
        return this._get().scrollWidth;
    };
    JElement.prototype.getSlot = function () {
        return this._get().slot;
    };
    JElement.prototype.setSlot = function (slot) {
        this._get().slot = slot;
    };
    JElement.prototype.getAttribute = function (qualifiedName) {
        return this._get().getAttribute(qualifiedName);
    };
    JElement.prototype.getAttributeNS = function (namespace, localName) {
        return this._get().getAttributeNS(namespace, localName);
    };
    JElement.prototype.getAttributeNames = function () {
        return this._get().getAttributeNames();
    };
    JElement.prototype.hasAttribute = function (qualifiedName) {
        return this._get().hasAttribute(qualifiedName);
    };
    JElement.prototype.hasAttributeNS = function (namespace, localName) {
        return this._get().hasAttributeNS(namespace, localName);
    };
    JElement.prototype.hasPointerCapture = function (pointerId) {
        return this._get().hasPointerCapture(pointerId);
    };
    JElement.prototype.matches = function (selectors) {
        return this._get().matches(selectors);
    };
    JElement.prototype.msGetRegionContent = function () {
        return this._get().msGetRegionContent();
    };
    JElement.prototype.releasePointerCapture = function (pointerId) {
        this._get().releasePointerCapture(pointerId);
    };
    JElement.prototype.removeAttribute = function (qualifiedName) {
        this._get().removeAttribute(qualifiedName);
    };
    JElement.prototype.removeAttributeNS = function (namespace, localName) {
        this._get().removeAttributeNS(namespace, localName);
    };
    JElement.prototype.setAttribute = function (qualifiedName, value) {
        this._get().setAttribute(qualifiedName, value);
    };
    JElement.prototype.setAttributeNS = function (namespace, qualifiedName, value) {
        this._get().setAttributeNS(namespace, qualifiedName, value);
    };
    JElement.prototype.setPointerCapture = function (pointerId) {
        this.setPointerCapture(pointerId);
    };
    JElement.prototype.toggleAttribute = function (qualifiedName, force) {
        return this._get().toggleAttribute(qualifiedName, force);
    };
    JElement.prototype.webkitMatchesSelector = function (selectors) {
        return this._get().webkitMatchesSelector(selectors);
    };
    return JElement;
}(JNode));
export default JElement;
//# sourceMappingURL=JElement.js.map
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
import JElement from "./JElement.js";
var JHTMLElement = /** @class */ (function (_super) {
    __extends(JHTMLElement, _super);
    function JHTMLElement(ref) {
        return _super.call(this, ref) || this;
    }
    JHTMLElement._valueOf = function (ref) {
        return new JHTMLElement(ref);
    };
    JHTMLElement.prototype._get = function () {
        return this.ref;
    };
    JHTMLElement.prototype.getAccessKey = function () {
        this._get().innerHTML;
        return this._get().accessKey;
    };
    JHTMLElement.prototype.setAccessKey = function (accessKey) {
        this._get().accessKey = accessKey;
    };
    JHTMLElement.prototype.getAccessKeyLabel = function () {
        return this._get().accessKeyLabel;
    };
    JHTMLElement.prototype.getAutoCapitalize = function () {
        return this._get().autocapitalize;
    };
    JHTMLElement.prototype.setAutoCapitalize = function (autoCapitalize) {
        this._get().autocapitalize = autoCapitalize;
    };
    JHTMLElement.prototype.getDir = function () {
        return this._get().dir;
    };
    JHTMLElement.prototype.setDir = function (dir) {
        this._get().dir = dir;
    };
    JHTMLElement.prototype.isDraggable = function () {
        return this._get().draggable;
    };
    JHTMLElement.prototype.setDraggable = function (draggable) {
        this._get().draggable = draggable;
    };
    JHTMLElement.prototype.isHidden = function () {
        return this._get().hidden;
    };
    JHTMLElement.prototype.setHidden = function (hidden) {
        this._get().hidden = hidden;
    };
    JHTMLElement.prototype.getInnerText = function () {
        return this._get().innerText;
    };
    JHTMLElement.prototype.addInnerText = function (innerText) {
        this._get().innerText += innerText;
    };
    JHTMLElement.prototype.setInnerText = function (innerText) {
        this._get().innerText = innerText;
    };
    JHTMLElement.prototype.getLang = function () {
        return this._get().lang;
    };
    JHTMLElement.prototype.setLang = function (lang) {
        this._get().lang = lang;
    };
    JHTMLElement.prototype.getOffsetHeight = function () {
        return this._get().offsetHeight;
    };
    JHTMLElement.prototype.getOffsetLeft = function () {
        return this._get().offsetLeft;
    };
    JHTMLElement.prototype.getOffsetParent = function () {
        return this._get().offsetParent == null ? null : JElement._valueOf(this._get().offsetParent);
    };
    JHTMLElement.prototype.getOffsetTop = function () {
        return this._get().offsetTop;
    };
    JHTMLElement.prototype.getOffsetWidth = function () {
        return this._get().offsetWidth;
    };
    JHTMLElement.prototype.getSpellCheck = function () {
        return this._get().spellcheck;
    };
    JHTMLElement.prototype.setSpellCheck = function (spellCheck) {
        this._get().spellcheck = spellCheck;
    };
    JHTMLElement.prototype.getTitle = function () {
        return this._get().title;
    };
    JHTMLElement.prototype.setTitle = function (title) {
        this._get().title = title;
    };
    JHTMLElement.prototype.getTranslate = function () {
        return this._get().translate;
    };
    JHTMLElement.prototype.setTranslate = function (translate) {
        this._get().translate = translate;
    };
    JHTMLElement.prototype.click = function () {
        this._get().click();
    };
    return JHTMLElement;
}(JElement));
export default JHTMLElement;
//# sourceMappingURL=JHTMLElement.js.map
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { CONSTANT_CLASS, CONSTANT_DOUBLE, CONSTANT_FIELD_REF, CONSTANT_FLOAT, CONSTANT_INTEGER, CONSTANT_INTERFACE_METHOD_REF, CONSTANT_INVOKE_DYNAMIC, CONSTANT_LONG, CONSTANT_METHOD_HANDLE, CONSTANT_METHOD_REF, CONSTANT_METHOD_TYPE, CONSTANT_NAME_AND_TYPE, CONSTANT_STRING, CONSTANT_UTF8, isConstantFieldRefInfo } from "./models/info/ConstantPoolInfo.js";
import { ByteBuffer } from "./ByteBuffer.js";
import { NoSuchFieldError } from "./lib/java/lang/NoSuchFieldError.js";
var JVM = /** @class */ (function () {
    function JVM(array) {
        this.operandStack = [];
        this.buffer = new ByteBuffer(array);
    }
    JVM.prototype.load = function () {
        if (!this.buffer) {
            console.error("buffer must not be undefined!");
            return;
        }
        var classFile = this.loadClassFile();
        this.invoke("main", classFile.constantPool, classFile.methods);
    };
    JVM.prototype.invoke = function (methodName, constantPool, methods) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, methods_1, method, name, codeAttributes, codeAttribute, code, opcode, _a, indexByte1, indexByte2, constantPoolInfo, fieldRef, classRef, fieldNameAndTypeRef, module, fieldClassFileName, map, index, stringRef, indexByte1, indexByte2, methodRef, methodNameAndTypeRef, invokeMethodName, argumentsCount, methodArgs, i;
            var _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, methods_1 = methods;
                        _c.label = 1;
                    case 1:
                        if (!(_i < methods_1.length)) return [3 /*break*/, 10];
                        method = methods_1[_i];
                        name = this.readUtf8FromConstantPool(constantPool, method.nameIndex);
                        if (name !== methodName)
                            return [3 /*break*/, 9];
                        codeAttributes = method.attributes.filter(function (attribute) { return _this.readUtf8FromConstantPool(constantPool, attribute.attributeNameIndex) === "Code"; });
                        if (!codeAttributes || codeAttributes.length == 0)
                            return [2 /*return*/];
                        codeAttribute = codeAttributes[0];
                        code = codeAttribute.code;
                        code.resetOffset();
                        opcode = code.getUint8();
                        _c.label = 2;
                    case 2:
                        if (!(code.offset < code.getLength())) return [3 /*break*/, 9];
                        _a = opcode;
                        switch (_a) {
                            case 0xb2: return [3 /*break*/, 3];
                            case 0x12: return [3 /*break*/, 5];
                            case 0xb6: return [3 /*break*/, 6];
                            case 0xb1: return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 8];
                    case 3:
                        indexByte1 = code.getUint8();
                        indexByte2 = code.getUint8();
                        constantPoolInfo = this.getConstantPoolInfo(constantPool, (indexByte1 << 8) | indexByte2);
                        if (!constantPoolInfo || !isConstantFieldRefInfo(constantPoolInfo.info)) {
                            this.throwErrorOrException(new NoSuchFieldError());
                            return [2 /*return*/];
                        }
                        fieldRef = constantPoolInfo.info;
                        classRef = this.getConstantPoolInfo(constantPool, fieldRef.classIndex).info;
                        fieldNameAndTypeRef = this.getConstantPoolInfo(constantPool, fieldRef.nameAndTypeIndex).info;
                        return [4 /*yield*/, import("./lib/" + this.readUtf8FromConstantPool(constantPool, classRef.nameIndex) + ".js")];
                    case 4:
                        module = _c.sent();
                        fieldClassFileName = this.readUtf8FromConstantPool(constantPool, fieldNameAndTypeRef.nameIndex);
                        map = new Map();
                        map.set("callable", module[this.getClassName(this.readUtf8FromConstantPool(constantPool, classRef.nameIndex))][fieldClassFileName]);
                        map.set("return", this.readUtf8FromConstantPool(constantPool, fieldNameAndTypeRef.descriptorIndex));
                        this.operandStack.push(map);
                        return [3 /*break*/, 8];
                    case 5:
                        {
                            index = code.getUint8();
                            stringRef = this.getConstantPoolInfo(constantPool, index).info;
                            this.operandStack.push(this.readUtf8FromConstantPool(constantPool, stringRef.stringIndex));
                            return [3 /*break*/, 8];
                        }
                        _c.label = 6;
                    case 6:
                        {
                            indexByte1 = code.getUint8();
                            indexByte2 = code.getUint8();
                            methodRef = this.getConstantPoolInfo(constantPool, (indexByte1 << 8) | indexByte2).info;
                            methodNameAndTypeRef = this.getConstantPoolInfo(constantPool, methodRef.nameAndTypeIndex).info;
                            invokeMethodName = this.readUtf8FromConstantPool(constantPool, methodNameAndTypeRef.nameIndex);
                            argumentsCount = this.readUtf8FromConstantPool(constantPool, methodNameAndTypeRef.descriptorIndex).split(";").length - 1;
                            methodArgs = [];
                            for (i = 0; i < argumentsCount; i++) {
                                methodArgs.push(this.operandStack.pop());
                            }
                            (_b = this.operandStack.pop().get("callable"))[invokeMethodName].apply(_b, methodArgs);
                            return [3 /*break*/, 8];
                        }
                        _c.label = 7;
                    case 7:
                        {
                            return [2 /*return*/];
                        }
                        _c.label = 8;
                    case 8:
                        opcode = code.getUint8();
                        return [3 /*break*/, 2];
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    JVM.prototype.loadClassFile = function () {
        var magic = this.buffer.getUint32();
        var minorVersion = this.buffer.getUint16();
        var majorVersion = this.buffer.getUint16();
        var constantPoolCount = this.buffer.getUint16();
        var constantPool = [];
        for (var i = 1; i < constantPoolCount; i++) {
            var tag = this.buffer.getUint8();
            var info = [];
            switch (tag) {
                case CONSTANT_CLASS:
                    info = {
                        tag: tag,
                        nameIndex: this.buffer.getUint16()
                    };
                    break;
                case CONSTANT_FIELD_REF:
                case CONSTANT_METHOD_REF:
                case CONSTANT_INTERFACE_METHOD_REF:
                    info = {
                        tag: tag,
                        classIndex: this.buffer.getUint16(),
                        nameAndTypeIndex: this.buffer.getUint16()
                    };
                    break;
                case CONSTANT_STRING:
                    info = {
                        tag: tag,
                        stringIndex: this.buffer.getUint16()
                    };
                    break;
                case CONSTANT_INTEGER:
                case CONSTANT_FLOAT:
                    info = {
                        tag: tag,
                        bytes: this.buffer.getUint32()
                    };
                    break;
                case CONSTANT_LONG:
                case CONSTANT_DOUBLE:
                    info = {
                        tag: tag,
                        highBytes: this.buffer.getUint32(),
                        lowBytes: this.buffer.getUint32(),
                    };
                    break;
                case CONSTANT_NAME_AND_TYPE:
                    info = {
                        tag: tag,
                        nameIndex: this.buffer.getUint16(),
                        descriptorIndex: this.buffer.getUint16()
                    };
                    break;
                case CONSTANT_UTF8:
                    var length = this.buffer.getUint16();
                    var utf8Buffer = new ByteBuffer(new ArrayBuffer(length));
                    for (var j = 0; j < length; j++) {
                        utf8Buffer.setUint8(this.buffer.getUint8());
                    }
                    info = {
                        tag: tag,
                        length: length,
                        bytes: utf8Buffer
                    };
                    break;
                case CONSTANT_METHOD_HANDLE:
                    info = {
                        tag: tag,
                        referenceKind: this.buffer.getUint8(),
                        referenceIndex: this.buffer.getUint16()
                    };
                    break;
                case CONSTANT_METHOD_TYPE:
                    info = {
                        tag: tag,
                        descriptorIndex: this.buffer.getUint16()
                    };
                    break;
                case CONSTANT_INVOKE_DYNAMIC:
                    info = {
                        tag: tag,
                        bootstrapMethodAttrIndex: this.buffer.getUint16(),
                        nameAndTypeIndex: this.buffer.getUint16()
                    };
                    break;
            }
            constantPool.push({
                tag: tag,
                info: info
            });
        }
        var accessFlags = this.buffer.getUint16();
        var thisClass = this.buffer.getUint16();
        var superClass = this.buffer.getUint16();
        var interfacesCount = this.buffer.getUint16();
        var interfaces = [];
        for (var i = 0; i < interfacesCount; i++) {
            interfaces.push(this.buffer.getUint16());
        }
        var fieldsCount = this.buffer.getUint16();
        // TODO Hello, Worldでは必要ない
        var fields = [];
        for (var i = 0; i < fieldsCount; i++) {
            var accessFlags_1 = this.buffer.getUint16();
            var nameIndex = this.buffer.getUint16();
            var descriptorIndex = this.buffer.getUint16();
            var attributesCount = this.buffer.getUint16();
            var attributes = this.loadAttributes(constantPool, attributesCount);
            fields.push({
                accessFlags: accessFlags_1,
                nameIndex: nameIndex,
                descriptorIndex: descriptorIndex,
                attributesCount: attributesCount,
                attributes: attributes
            });
        }
        var methodsCount = this.buffer.getUint16();
        var methods = [];
        for (var i = 0; i < methodsCount; i++) {
            var accessFlags_2 = this.buffer.getUint16();
            var nameIndex = this.buffer.getUint16();
            var descriptorIndex = this.buffer.getUint16();
            var attributeCount = this.buffer.getUint16();
            var attributes = this.loadAttributes(constantPool, attributeCount);
            methods.push({
                accessFlags: accessFlags_2,
                nameIndex: nameIndex,
                descriptorIndex: descriptorIndex,
                attributesCount: attributeCount,
                attributes: attributes
            });
        }
        return {
            magic: magic,
            minorVersion: minorVersion,
            majorVersion: majorVersion,
            constantPoolCount: constantPoolCount,
            constantPool: constantPool,
            accessFlags: accessFlags,
            thisClass: thisClass,
            superClass: superClass,
            interfacesCount: interfacesCount,
            interfaces: interfaces,
            fieldsCount: fieldsCount,
            fields: fields,
            methodsCount: methodsCount,
            methods: methods,
            attributesCount: 0,
            attributes: []
        };
    };
    JVM.prototype.loadAttributes = function (constantPool, length) {
        var result = [];
        for (var j = 0; j < length; j++) {
            var attributeNameIndex = this.buffer.getUint16();
            var attributeLength = this.buffer.getUint32();
            var name = this.readUtf8FromConstantPool(constantPool, attributeNameIndex);
            switch (name) {
                case "Code": {
                    var maxStack = this.buffer.getUint16();
                    var maxLocals = this.buffer.getUint16();
                    var codeLength = this.buffer.getUint32();
                    var code = new ByteBuffer(new ArrayBuffer(codeLength));
                    for (var i = 0; i < codeLength; i++) {
                        code.setUint8(this.buffer.getUint8());
                    }
                    var exceptionTableLength = this.buffer.getUint16();
                    var exceptionTable = [];
                    for (var i = 0; i < exceptionTableLength; i++) {
                        exceptionTable.push({
                            startPc: this.buffer.getUint16(),
                            endPc: this.buffer.getUint16(),
                            handlerPc: this.buffer.getUint16(),
                            catchType: this.buffer.getUint16()
                        });
                    }
                    var attributesCount = this.buffer.getUint16();
                    var attributes = [];
                    if (attributesCount > 0) {
                        attributes = this.loadAttributes(constantPool, attributesCount);
                    }
                    var codeAttribute = {
                        attributeNameIndex: attributeNameIndex,
                        attributeLength: attributeLength,
                        info: [],
                        maxStack: maxStack,
                        maxLocals: maxLocals,
                        codeLength: codeLength,
                        code: code,
                        exceptionTableLength: exceptionTableLength,
                        exceptionTable: exceptionTable,
                        attributesCount: attributesCount,
                        attributes: attributes
                    };
                    result.push(codeAttribute);
                    break;
                }
                case "LineNumberTable": {
                    var lineNumberTableLength = this.buffer.getUint16();
                    var lineNumberTable = [];
                    for (var i = 0; i < lineNumberTableLength; i++) {
                        lineNumberTable.push({
                            startPc: this.buffer.getUint16(),
                            lineNumber: this.buffer.getUint16()
                        });
                    }
                    var lineNumberTableAttribute = {
                        attributeNameIndex: attributeNameIndex,
                        attributeLength: attributeLength,
                        info: [],
                        lineNumberTableLength: lineNumberTableLength,
                        lineNumberTable: lineNumberTable
                    };
                    result.push(lineNumberTableAttribute);
                    break;
                }
            }
        }
        return result;
    };
    JVM.prototype.throwErrorOrException = function (throwable) {
        throwable.printStackTrace();
    };
    JVM.prototype.getConstantPoolInfo = function (constantPool, index) {
        return constantPool[index - 1];
    };
    JVM.prototype.readUtf8FromConstantPool = function (constantPool, index) {
        return new TextDecoder("utf-8").decode(this.getConstantPoolInfo(constantPool, index).info.bytes.view);
    };
    JVM.prototype.getClassName = function (packageName) {
        var split = packageName.split("/");
        return split[split.length - 1];
    };
    return JVM;
}());
export { JVM };
//# sourceMappingURL=jvm.js.map
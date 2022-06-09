import { CONSTANT_CLASS, CONSTANT_DOUBLE, CONSTANT_FIELD_REF, CONSTANT_FLOAT, CONSTANT_INTEGER, CONSTANT_INTERFACE_METHOD_REF, CONSTANT_INVOKE_DYNAMIC, CONSTANT_LONG, CONSTANT_METHOD_HANDLE, CONSTANT_METHOD_REF, CONSTANT_METHOD_TYPE, CONSTANT_NAME_AND_TYPE, CONSTANT_STRING, CONSTANT_UTF8 } from "../../models/info/ConstantPoolInfo.js";
import { ByteBuffer } from "../../utils/ByteBuffer.js";
import { readAttributes } from "../../models/info/AttributeInfo.js";
var ClassFileLoader = /** @class */ (function () {
    function ClassFileLoader() {
    }
    ClassFileLoader.loadClassFile = function (buffer) {
        var magic = buffer.getUint32();
        var minorVersion = buffer.getUint16();
        var majorVersion = buffer.getUint16();
        var constantPoolCount = buffer.getUint16();
        var constantPool = [];
        for (var i = 1; i < constantPoolCount; i++) {
            var tag = buffer.getUint8();
            var info = void 0;
            switch (tag) {
                case CONSTANT_CLASS:
                    info = {
                        tag: tag,
                        nameIndex: buffer.getUint16()
                    };
                    break;
                case CONSTANT_FIELD_REF:
                case CONSTANT_METHOD_REF:
                case CONSTANT_INTERFACE_METHOD_REF:
                    info = {
                        tag: tag,
                        classIndex: buffer.getUint16(),
                        nameAndTypeIndex: buffer.getUint16()
                    };
                    break;
                case CONSTANT_STRING:
                    info = {
                        tag: tag,
                        stringIndex: buffer.getUint16()
                    };
                    break;
                case CONSTANT_INTEGER:
                    info = {
                        tag: tag,
                        bytes: buffer.getInt32()
                    };
                    break;
                case CONSTANT_FLOAT:
                    info = {
                        tag: tag,
                        bytes: buffer.getUint32()
                    };
                    break;
                case CONSTANT_LONG:
                    info = {
                        tag: tag,
                        highBytes: buffer.getUint32(),
                        lowBytes: buffer.getUint32()
                    };
                    break;
                case CONSTANT_DOUBLE:
                    info = {
                        tag: tag,
                        highBytes: buffer.getUint32(),
                        lowBytes: buffer.getUint32()
                    };
                    break;
                case CONSTANT_NAME_AND_TYPE:
                    info = {
                        tag: tag,
                        nameIndex: buffer.getUint16(),
                        descriptorIndex: buffer.getUint16()
                    };
                    break;
                case CONSTANT_UTF8:
                    var length_1 = buffer.getUint16();
                    var utf8Buffer = new ByteBuffer(new ArrayBuffer(length_1));
                    for (var j = 0; j < length_1; j++) {
                        utf8Buffer.setUint8(buffer.getUint8());
                    }
                    info = {
                        tag: tag,
                        length: length_1,
                        bytes: utf8Buffer
                    };
                    break;
                case CONSTANT_METHOD_HANDLE:
                    info = {
                        tag: tag,
                        referenceKind: buffer.getUint8(),
                        referenceIndex: buffer.getUint16()
                    };
                    break;
                case CONSTANT_METHOD_TYPE:
                    info = {
                        tag: tag,
                        descriptorIndex: buffer.getUint16()
                    };
                    break;
                case CONSTANT_INVOKE_DYNAMIC:
                    info = {
                        tag: tag,
                        bootstrapMethodAttrIndex: buffer.getUint16(),
                        nameAndTypeIndex: buffer.getUint16()
                    };
                    break;
            }
            constantPool.push({
                tag: tag,
                id: i,
                info: info
            });
            if (tag === CONSTANT_LONG || tag === CONSTANT_DOUBLE)
                i += 1;
        }
        var accessFlags = buffer.getUint16();
        var thisClass = buffer.getUint16();
        var superClass = buffer.getUint16();
        var interfacesCount = buffer.getUint16();
        var interfaces = [];
        for (var i = 0; i < interfacesCount; i++) {
            interfaces.push(buffer.getUint16());
        }
        var fieldsCount = buffer.getUint16();
        var fields = [];
        for (var i = 0; i < fieldsCount; i++) {
            var accessFlags_1 = buffer.getUint16();
            var nameIndex = buffer.getUint16();
            var descriptorIndex = buffer.getUint16();
            var attributesCount = buffer.getUint16();
            var attributes = readAttributes(constantPool, attributesCount, buffer);
            fields.push({
                accessFlags: accessFlags_1,
                nameIndex: nameIndex,
                descriptorIndex: descriptorIndex,
                attributesCount: attributesCount,
                attributes: attributes
            });
        }
        var methodsCount = buffer.getUint16();
        var methods = [];
        for (var i = 0; i < methodsCount; i++) {
            var accessFlags_2 = buffer.getUint16();
            var nameIndex = buffer.getUint16();
            var descriptorIndex = buffer.getUint16();
            var attributeCount = buffer.getUint16();
            var attributes = readAttributes(constantPool, attributeCount, buffer);
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
    ClassFileLoader.getClassName = function (packageName) {
        var split = packageName.split("/");
        return split[split.length - 1];
    };
    return ClassFileLoader;
}());
export default ClassFileLoader;
export var getConstantPoolInfo = function (constantPool, index) {
    return constantPool.filter(function (constant) { return constant.id === index; })[0];
};
export var parseDescriptor = function (descriptor) {
    var _a;
    var temp = (_a = descriptor.match("(?<=\\()[^\\(\\)]+(?=\\))")) === null || _a === void 0 ? void 0 : _a[0];
    if (temp == null)
        return [];
    var primitives = ["B", "C", "D", "F", "I", "J", "S", "Z"];
    var args = [];
    var STATE_NORMAL = 0;
    var STATE_OBJECT = 1;
    var state = STATE_NORMAL;
    var isArray = false;
    var objectName = "";
    temp.split("").forEach(function (char) {
        switch (state) {
            case STATE_NORMAL: {
                if (primitives.includes(char)) {
                    args.push((isArray ? "[" : "") + char);
                    isArray = false;
                }
                else if (char === "L")
                    state = STATE_OBJECT;
                else if (char === "[")
                    isArray = true;
                break;
            }
            case STATE_OBJECT: {
                if (char !== ";")
                    objectName += char;
                else {
                    args.push((isArray ? "[" : "") + objectName);
                    isArray = false;
                    objectName = "";
                    state = STATE_NORMAL;
                }
                break;
            }
        }
    });
    return args;
};
export var getArgumentsAndReturnType = function (descriptor) {
    var returnTypeSplit = descriptor.split(")");
    return [parseDescriptor(descriptor), returnTypeSplit[returnTypeSplit.length - 1]];
};
//# sourceMappingURL=ClassFileLoader.js.map
import {VerificationTypeInfo} from "./VerificationTypeInfo.js";

export type StackMapFrame = {
    frame: SameFrame
        | SameLocals1StackItemFrame
        | SameLocals1StackItemFrameExtended
        | ChopFrame
        | SameFrameExtended
        | AppendFrame
        | FullFrame
}

export type SameFrame = {
    frameType: number
}

export type SameLocals1StackItemFrame = {
    frameType: number,
    stack: VerificationTypeInfo[]
}

export type SameLocals1StackItemFrameExtended = {
    frameType: number,
    offsetDelta: number,
    stack: VerificationTypeInfo[]
}

export type ChopFrame = {
    frameType: number,
    offsetDelta: number
}

export type SameFrameExtended = {
    frameType: number,
    offsetDelta: number
}

export type AppendFrame = {
    frameType: number,
    offsetDelta: number,
    locals: VerificationTypeInfo[]
}

export type FullFrame = {
    frameType: number,
    offsetDelta: number,
    numberOfLocals: number,
    locals: VerificationTypeInfo[],
    numberOfStackItems: number,
    stack: VerificationTypeInfo[]
}
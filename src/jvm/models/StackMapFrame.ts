import {VerificationTypeInfo} from "./VerificationTypeInfo.js";

export type StackMapFrame = {
    sameFrame: SameFrame,
    sameLocals1StackItemFrame: SameLocals1StackItemFrame,
    sameLocals1StackItemFrameExtended: SameLocals1StackItemFrameExtended,
    chopFrame: ChopFrame,
    saneFrameExtended: SameFrameExtended,
    appendFrame: AppendFrame,
    fullFrame: FullFrame
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
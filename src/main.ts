import {JVM} from "./jvm/jvm.js";

window.onload = () => {
    const reader = new FileReader();
    const fileInput = document.getElementById("file_input") as HTMLInputElement;

    fileInput.onchange = () => {
        reader.readAsArrayBuffer(fileInput.files[0])
    }

    reader.onload = () => {
        const jvm = new JVM(reader.result as ArrayBuffer);
        jvm.load();
    }
}
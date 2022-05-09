import {JVM} from "./jvm/jvm.js";

window.onload = () => {
    const reader = new FileReader();
    const fileInput = document.getElementById("file_input") as HTMLInputElement;

    fileInput.onchange = () => {
        reader.readAsArrayBuffer(fileInput.files[0])
    }

    reader.onload = () => {
        const jvmArgs = {
            Xss: 1000
        }
        const jvm = new JVM(reader.result as ArrayBuffer, jvmArgs, []);
        jvm.load();
    }
}
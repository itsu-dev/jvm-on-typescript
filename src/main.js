import { JVM } from "./jvm/jvm.js";
window.onload = function () {
    var reader = new FileReader();
    var fileInput = document.getElementById("file_input");
    fileInput.onchange = function () {
        reader.readAsArrayBuffer(fileInput.files[0]);
    };
    reader.onload = function () {
        var jvm = new JVM(reader.result);
        jvm.load();
    };
};
//# sourceMappingURL=main.js.map
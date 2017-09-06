//Buttons/Event Listeners
var clrBtn = document.getElementById("clrBtn");
var srcNodeBtn = document.getElementById("srcNodeBtn");
var destNodeBtn = document.getElementById("destNodeBtn");
var calcBtn = document.getElementById("calcBtn");
var editorCanvas = document.getElementById("editorCanvas");
console.log("HELLO? ");

clrBtn.addEventListener("click", initialize);
srcNodeBtn.addEventListener("click", setModeFunc(DEF_SRC));

//defined constants
destNodeBtn.addEventListener("click", setModeFunc(DEF_DEST));
console.log(calcBtn);
calcBtn.addEventListener("click", function(){
        console.log("calculating path");
        console.log(node1);
        console.log(node2);
        console.log(makePath(node1, node2));
});


editorCanvas.addEventListener('contextmenu', setModeFunc(DEFAULT), false);

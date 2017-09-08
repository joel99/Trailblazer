//Buttons/Event Listeners
var clrBtn = document.getElementById("clrBtn");
var srcNodeBtn = document.getElementById("srcNodeBtn");
var destNodeBtn = document.getElementById("destNodeBtn");
var calcBtn = document.getElementById("calcBtn");
var editorCanvas = document.getElementById("editorCanvas");

var nextPgBtn = document.getElementById("nextPgBtn");
var lastPgBtn = document.getElementById("lastPgBtn");


nextPgBtn.addEventListener("click", toNextPage);
prevPgBtn.addEventListener("click", toPrevPage);

clrBtn.addEventListener("click", clearQuery);
srcNodeBtn.addEventListener("click", setModeFunc(DEF_SRC));

//defined constants
destNodeBtn.addEventListener("click", setModeFunc(DEF_DEST));

calcBtn.addEventListener("click", calcPath);

editorCanvas.addEventListener('contextmenu', setModeFunc(DEFAULT), false);

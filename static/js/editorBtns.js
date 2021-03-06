//Buttons/Event Listeners

var ptBtn = document.getElementById("ptBtn");
var pathBtn = document.getElementById("pathBtn");
var cnxnBtn = document.getElementById("cnxnBtn");
var delElBtn = document.getElementById("delElBtn");
var linkBtn = document.getElementById("linkBtn");

var clrBtn = document.getElementById("clrBtn");
var delPgBtn = document.getElementById("delPgBtn");
var delMapBtn = document.getElementById("delMapBtn");
var pubMapBtn = document.getElementById("pubMapBtn");
var saveMapBtn = document.getElementById("saveMapBtn");
var addPgBtn = document.getElementById("addPgBtn");
var uploadImgBtn = document.getElementById("upload-button");

//note: might be replaced with better navigation system
var nextPgBtn = document.getElementById("nextPgBtn");
var lastPgBtn = document.getElementById("lastPgBtn");

var saveMapBtn = document.getElementById("saveMapBtn");
var pubMapBtn = document.getElementById("pubMapBtn");

editorCanvas.addEventListener("click", canvasClick);
editorCanvas.addEventListener("mousemove", updateCanvas);
editorCanvas.addEventListener('contextmenu', rClick, false);

ptBtn.addEventListener("click", setModeFunc(ADD_PT));
pathBtn.addEventListener("click", setModeFunc(ADD_PATH));
cnxnBtn.addEventListener("click", setModeFunc(ADD_CNXN));
linkBtn.addEventListener("click", setModeFunc(LINK_CNXN));

clrBtn.addEventListener("click", clrEditor);
addPgBtn.addEventListener("click", addPage);
delPgBtn.addEventListener("click", delPage);
nextPgBtn.addEventListener("click", toNextPage);
prevPgBtn.addEventListener("click", toPrevPage);
delElBtn.addEventListener("click", delEl);
saveMapBtn.addEventListener("click", saveMap);
delMapBtn.addEventListener("click", delMap);
//uploadImgBtn.addEventListener("click", uploadImg);


/* JS for canvas navigation/drawing
 */

var editorCanvas = document.getElementById("editorCanvas");
var width = editorCanvas.getAttribute("width");
var height = editorCanvas.getAttribute("height");

var mousex, mousey;

editorCanvas.addEventListener("mousemove", function(e) {
    mousex = e.offsetX;
    mousey = e.offsetY;
});

var logStatus = function(s){
    document.getElementById("status").innerHTML = s;
}

var loadMap = function(){
    //ajax load page
}

var idCount = 0; 

/* PAGING */

var totalPages = 0; //load
var idCount = 0; //simple id scheme, just count up every time element is made


var getActivePage = function(){
    for (i = 0; i < editorCanvas.children.length; i++){
	var child = editorCanvas.childNodes[i];
	if ( child.getAttribute("isCurrent") == "true" ){
	    return child;
	}
    }
    return null;
}


var getPage = function(num){
    for (i = 0; i < editorCanvas.children.length; i++){
	var child = editorCanvas.childNodes[i];
	if ( child.getAttribute("num") == num ){
	    return child;
	}
    }
    return null;    
}

var setPage = function(num){

    clrActive();
    clrMonitor();
    
    var page = getActivePage();
    if (page != null){
    var i;
    var child;
    for (i = 0; i < page.children.length; i++){
	var child = page.childNodes[i];
	child.setAttribute("visibility", "hidden");
    }

    page.setAttribute("isCurrent", "false");
    }
    getPage(num).setAttribute("isCurrent", "true");
    page = getActivePage();
    page.setAttribute("id", "viewport");
    
    clrActive();
    page = getActivePage();
    pgNum.innerHTML = page.getAttribute('num');
   //pgNum.innerHTML = "blah";
    pgTitle.innerHTML =  page.getAttribute("name");

    for (i = 0; i < page.children.length; i++){
	var child = page.childNodes[i];
	child.setAttribute("visibility", "visible");
    }
    
}

var toNextPage = function(){
    var page = getActivePage();
    if (parseInt(page.getAttribute("num")) != totalPages){
	setPage(parseInt(page.getAttribute("num")) + 1);
    }
    else{
	logStatus("You're on the last page");
    }
}

var toPrevPage = function(){
    var page = getActivePage();
    if (parseInt(page.getAttribute("num")) != 1){
	setPage(parseInt(page.getAttribute("num")) - 1);
    }
    else {
	logStatus("You're on the first page");
    }
}

var addPage = function(){
    totalPages++;
    var p = document.createElementNS("http://www.w3.org/2000/svg", "g");
    p.setAttribute("name", "Example");
    p.setAttribute("num", totalPages);
    //p.setAttribute("imgUrl", "white.png");//smh

    /*
    var d = document.createElement("defs");
    var pat = document.createElement("pattern");
    pat.setAttribute('id', totalPages + "bg");
    pat.setAttribute('patternUnits', 'userSpaceOnUse');
    pat.setAttribute('width', 4);
    pat.setAttribute('height', 4);
    d.appendChild(pat);
    var im = document.createElement("image");
    im.setAttribute("xlink:href", "white.png")//ADD A THING
	im.setAttribute("width", 4);
	im.setAttribute("height", 4);
	pat.appendChild(im);
    p.appendChild(d);
    
    var r= document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", 0);
	r.setAttribute("y", 0);
	r.setAttribute("width", width);
	r.setAttribute("height", height);
	r.setAttribute("id", totalPages + "bgRect");
	r.setAttribute("fill", "url(#" + totalPages + "bg)");
	p.appendChild(r);
    */
    
    if (totalPages == 1){
	p.setAttribute("isCurrent", "true");
	editorCanvas.appendChild(p);		
	p.setAttribute("id", "viewport");
    }
    else if (getActivePage().getAttribute("num") == totalPages - 1){//there is already a page, and this is the last page
	editorCanvas.appendChild(p);
	toNextPage();
	p.setAttribute("id", "viewport");
    }
    
    return p;

}

var delPage = function(){

    //TODO : ADD PROMPT!
    if (totalPages == 0) logStatus("can't remove page");
    else {
	logStatus("page removed");
	var curPage = getActivePage();
	if (totalPages == 1){
	    //disable thing...
	    pgNum.innerHTML = "";
	    pgTitle.innerHTML = "NO PAGES LEFT.";
	}
	else{
	    if (curPage.getAttribute("num") == 1){
		//doubly inefficient! for sake of saving code!
		setPage(2);
		getPage(2).setAttribute("num", 1);
		
	    }
	    else{
		toPrevPage();//inefficient, just remove...
		for (i = parseInt(curPage.getAttribute("num")); i < editorCanvas.children.length; i++){
		    var child = editorCanvas.childNodes[i];
		    child.setAttribute("num", i);
		}
	    } //reorder pages	    
	}
	
	for (i = 0; i < curPage.children.length; i++){
	    var child = curPage.childNodes[i];
	    if (child.getAttribute("customType") == "cnxn")
		clrCnxn(child);
	}

	editorCanvas.removeChild(curPage);
	totalPages -= 1;
    }
}




//EDITOR UI
const DEFAULT = 1;
const ADD_PT = 2;
const ADD_NODE = 3;
const ADD_PATH = 4;
const ADD_CNXN = 5;
const EDIT = 6;
const CONF_PATH = 7;

var mode = DEFAULT;

var setMode = function(m){
    mode = m;
}

var setModeFunc = function(newMode){
    return function(){
	clrActive();
	clrMonitor();
	if (newMode == ADD_PT ||
	    newMode == ADD_CNXN ||
	    newMode == ADD_NODE){
	    //var page = getActivePage();
	    //if (page != null || page != undefined)
	    editorCanvas.appendChild(makeShadow(0, 0, 20, newMode));
	}
	setMode(newMode);
    };
}

/* ENTITY CREATION / MANAGEMENT */

var makePt = function(x,y,r){
    
    var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", r);
    c.setAttribute("fill", "black");
    c.setAttribute("customType", "pt");

    return c;
    
}

var makePath = function(x1, y1, x2, y2){

    var l = document.createElementNS("http://www.w3.org/2000/svg", "line");

    l.setAttribute("x1", x1);
    l.setAttribute("y1", y1);
    l.setAttribute("x2", x2);
    l.setAttribute("y2", y2);
    l.setAttribute("stroke", "black");
    l.setAttribute("stroke-width", "4");
    l.setAttribute("customType", "path");
    l.setAttribute("active", true);
    l.setAttribute("dist", 0);
    
    return l;
}

var makeShadow = function(x, y, r, mode){
    var s = null;
    switch(mode){
    case ADD_PT:
	s = makePt(x, y, r);
	break;
    case ADD_NODE:
	s = makeNode(x, y, r);
	break;
    case ADD_CNXN:
	s = makeCnxn(x, y, r);
	break;
    }

    s.setAttribute("fill", "grey");
    s.setAttribute("customType", s.getAttribute("customType") + "Shadow");
    s.setAttribute("active", true);
    s.setAttribute("visibility", "hidden");   

    return s;

}


var updateCanvas = function(e){ //for managing shadow
    
    //var page = getActivePage();
    //if (page == null){
	
    //}
    //else{
	for (i = 0; i < editorCanvas.children.length; i++){
	    var child = editorCanvas.childNodes[i];
	    
	    if (child.getAttribute("active") == "true"){
		switch (mode){
		case CONF_PATH:
		    //if (child.getAttribute("x2") != mousex.toString()){
		    //    console.log("Unfair!");
		    //}
		    child.setAttribute("x2", mousex);
		    child.setAttribute("y2", mousey);
		    break;
		case ADD_PT:		
		    child.setAttribute("visibility", "visible");
		    child.setAttribute("cx", mousex);
		    child.setAttribute("cy", mousey);
		     console.log(mousex);
		    console.log(mousey);
		    console.log(child.getAttribute("cx"));
		    
		    break;
		case ADD_CNXN:
		    child.setAttribute("visibility", "visible");
		    child.setAttribute("cx", mousex);
		    child.setAttribute("cy", mousey);
		    child.setAttribute("points", cnxnPts(mousex, mousey, child.getAttribute("r")));	
		    break;
		case ADD_NODE:		
		    child.setAttribute("visibility", "visible");
		    child.setAttribute("cx", mousex);
		    child.setAttribute("cy", mousey);
		    child.setAttribute("points", nodePts(mousex, mousey, child.getAttribute("r")));
		    break;
		}	    

		
	    }
	}
   // }
}



var clrActive = function(){
    
    for (i = 0; i < editorCanvas.children.length; i++){
	var child = editorCanvas.childNodes[i];
	if ( child.getAttribute("active") == "true" ){
	    editorCanvas.removeChild(child);
	    break;
	}
    }
    
}

var rClick = function(e){
    e.preventDefault();
    setMode(DEFAULT);
    logStatus("Canceled!");
    //clear active shapes
    //there's probably an easier way of doing this - check later
    //    console.log(editorCanvas.children);
    clrActive();
}

var distance = function(x1,y1,x2,y2){
    return Math.sqrt( Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2) );
}

var validPtDistance = function(x, y){
    var i;
    for (i = 0; i < editorCanvas.children.length; i++){
	var child = editorCanvas.childNodes[i];
	var type = child.getAttribute("customType");
	if (type == "pt"){
	    childX = child.getAttribute("cx");
	    childY = child.getAttribute("cy");
	    if (distance(x,y,childX, childY) < 30)
		return false;
	}
    }
    return true;

}

var closestPathDrop = function(x,y){

    var ret = null;
    var champDist = 10000;
    const minThresh = 30;
    //var page = getActivePage();
    var i;
    for (i = 0; i < editorCanvas.children.length; i++){
	var child = editorCanvas.childNodes[i];
	var type = editorCanvas.getAttribute("customType");
	if (type == "pt" || type == "cnxn" || type == "node"){
	    childX = child.getAttribute("cx");
	    childY = child.getAttribute("cy");
	    if (distance(x,y,childX, childY) < champDist) {
		ret = child;
		champDist = distance(x,y,childX, childY);
	    }
	}
    }
    
    if (champDist < minThresh) return ret;
    else return null;

}


    

var canvasClick = function(e){

    switch (mode){
    case ADD_PT:
	if (validPtDistance(mousex, mousey)){
	    addEl(mousex, mousey, mode);
	    logStatus("something added!");
	}
	else{
	    logStatus("too close");
	}
	break;	

    case ADD_PATH:
	closest = closestPathDrop(mousex, mousey); 
	if (closest == null){
	    logStatus("No anchor node");
	}
	else {
	    var newPath = addEl(closest.getAttribute("cx"), closest.getAttribute("cy"), ADD_PATH);
	    newPath.setAttribute("p1", closest.getAttribute("id"));
	    mode = CONF_PATH;
	}

	break;

    case CONF_PATH:
	//edits last child
	var closest = closestPathDrop(mousex, mousey); 
	if (closest == null){
	    logStatus("No anchor node");
	}
	else {		   
	    mode = ADD_PATH;
	    var line = getActivePage().lastChild;
	    line.setAttribute("active", false);
	    line.setAttribute("x2", closest.getAttribute("cx"));
	    line.setAttribute("y2", closest.getAttribute("cy"));
	    if (distance(line.getAttribute("x1"), line.getAttribute("y1"),
			 line.getAttribute("x2"), line.getAttribute("y2")) < 5){
		getActivePage().removeChild(line);//prevent self-attachment
		logStatus("No self-attachment!");
	    }
	    line.setAttribute("p2", closest.getAttribute("id"));
	    var page = getActivePage();
	    for (i = 0; i < page.children.length - 1; i++){
		var child = page.childNodes[i];
		if (child.getAttribute("customType") == "path"){
		    if ((child.getAttribute("p1") == line.getAttribute("p1") &&
			 child.getAttribute("p2") == line.getAttribute("p2")) ||
			(child.getAttribute("p1") == line.getAttribute("p2") &&
			 child.getAttribute("p2") == line.getAttribute("p1"))
		       ){
			page.removeChild(line);
			logStatus("The path already exists!");
			break;
		    }
		}
	    }
	    
	    //set default distance
	    var x1 = line.getAttribute("x1");
	    var y1 = line.getAttribute("y1");
	    var x2 = line.getAttribute("x2");
	    var y2 = line.getAttribute("y2");
	    line.setAttribute("dist", pythDist(x1, y1, x2, y2));
	    
	    line.addEventListener("click", elClick);
	}
	break;
    default:
	logStatus("Non-functional/default");
	break;
    }
    console.log("canvas clicked");
    clickedEl = null;
}

var addEl = function(x, y, type){
    var child;
    switch(type){
    case ADD_PT:
	child = makePt( x, y, 20 );
	child.addEventListener("click", elClick);
	child.setAttribute("id", idCount);
	child.setAttribute("name", child.getAttribute("customType") + idCount++);
	break;
    case ADD_PATH:
	child = makePath( x, y, mousex, mousey );
	child.addEventListener("click", elClick);
	break;
    }

    //getActivePage().appendChild(child);
    editorCanvas.appendChild(child);
    return child;
}


//Monitor bs
var elClick = function(e){
    if (mode == DEFAULT){
	clickedEl = this;
	event.stopPropagation();
	refreshMonitor(this);	
	console.log(this.getAttribute("customType") + " clicked.");
    }
}

var delEl = function(){
    if (clickedEl != null){
	//remove associations
	var page = getActivePage();
	switch (clickedEl.getAttribute("customType")){
	    case "node":
	    case "pt":
	    case "cnxn":
	    for (i = 0; i < page.children.length; i++){
		var child = page.childNodes[i];
		if (child.getAttribute("customType") == "path"){
		    if (child.getAttribute("p1") == clickedEl.getAttribute("id") ||
		        child.getAttribute("p2") == clickedEl.getAttribute("id") )
			page.removeChild(child);
		    }
	    }
	    break;
	}

	if (clickedEl.getAttribute("customType") == "cnxn")
	    clrCnxn(clickedEl);
	clrMonitor();
	page.removeChild(clickedEl);
	clickedEl = null;
	clrMonitor();
    }
}

var clrEditor = function(){
    var page = getActivePage()
    while (page.hasChildNodes()){
	page.removeChild(page.lastChild);
    }
};

var clrMonitor = function(){
    monitor.innerHTML = "";
}

var refreshMonitor = function(item){
    clrMonitor();
    console.log("monitor refreshing");
    updateMonitor(item.getAttribute("customType"), item.getAttribute("name"));
    addMonitorField("Name", "name");
//    addMonitorField("Color", "color");
    updateMonitor("Id", item.getAttribute("id"));

    switch (item.getAttribute("customType")){
    case "path":
	updateMonitor("Point One", item.getAttribute("p1"));
	updateMonitor("Point Two", item.getAttribute("p2"));
	addMonitorField("Link Distance", "dist")
	break;
    case "cnxn":
	updateMonitor("Link", item.getAttribute("link"));
	addMonitorField("Link", "link");
	addMonitorField("Connection Distance", "linkDist")
	break;
    }
}


var getActivePage = function(){
    return 0;
}

var updateMonitor = function(s1, s2){
    var s = document.createElement("p");
    //s.setAttribute("class", djlksjfd);
    s.innerHTML = s1 + " : " + s2;
    monitor.appendChild(s);
}

var addMonitorField = function(fieldName, attr){//to be changed
    var d = document.createElement("div");
    var s = document.createElement("span");
    s.innerHTML = fieldName + " " + clickedEl.getAttribute(attr);
    var f = document.createElement("input");
    f.setAttribute("srcAttr", attr);
    f.innerHTML = clickedEl.getAttribute(attr);
    d.appendChild(s);
    d.appendChild(f);
    d.addEventListener("change", updateField);
    monitor.appendChild(d);
}

var updateField = function(){
    var newData = this.lastChild.value;
    console.log(this.lastChild.getAttribute("srcAttr") + " has changed to " + newData);
    clickedEl.setAttribute(this.lastChild.getAttribute("srcAttr"), newData);
    //get that first part:
	var res =  this.firstChild.innerHTML.split(" ")[0];
	this.firstChild.innerHTML = res + " " + newData;
    refreshMonitor(clickedEl);
}

$(document).ready(loadMap());

//Rough organization
//updateCanvas, canvasClick, and elClick are most important funcitons. everything else just helps

//ROAD MAP for JOEL:
//add panning/moving via public library
//submission fields for editable attributes
//add file upload/download for background images
//pretty submission areas

//to do: add weights on paths

//Notes:
//you can edit map name in main dashboard AND map edit page (for user friendliness)

var editorCanvas = document.getElementById("editorCanvas");
var width = editorCanvas.getAttribute("width");
var height = editorCanvas.getAttribute("height");
var pgNum = document.getElementById("pgNum");
var pgTitle = document.getElementById("pgTitle");

var mousex, mousey;

editorCanvas.addEventListener("mousemove", function(e) {
    mousex = e.offsetX;
    mousey = e.offsetY;
});

var logStatus = function(s){
    document.getElementById("status").innerHTML = s;
}

//GENERAL UI

//Page stuff
var mapTitle = document.getElementById("mapTitle");
var monitor = document.getElementById("monitor");

//Information
//var mapName = document.getElementById("mapName");
//var pgName = document.getElementById("pgName");

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
    p.setAttribute("imgUrl", "white.png");//smh
    
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

var mode = DEFAULT; //edited with other buttons on editor page

//TODO: ADD OPTIONS FOR ADD_ UI

var setMode = function(m){
    mode = m;
}

//PLEASE NOTE: for proximity concerns, each shape that requires space needs "cx", "cy" attributes

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

var nodePts = function(x, y, r){//triangle
    r = parseInt(r);
    x = parseInt(x);
    y = parseInt(y);
    var t = x + "," + (y-r);
    var bL = Math.floor(x - r * .866) + "," + Math.floor(y + r * .5);
    var bR = Math.floor(x + r * .866) + "," + Math.floor(y + r * .5); 
    return  t + " " + bL + " " + bR;
}

var makeNode = function(x, y, r){
    
    var t = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

    t.setAttribute("cx", x);
    t.setAttribute("cy", y);
    t.setAttribute("r", r);
    t.setAttribute("points", nodePts(x, y, r));
    t.setAttribute("customType", "node");

    return t;
    
}

var cnxnPts = function(x, y, r){//square
    r = parseInt(r);
    x = parseInt(x);
    y = parseInt(y);
    var tL = (x - r) + "," + (y - r);
    var tR = (x + r) + "," + (y - r);
    var bL = (x - r) + "," + (y + r);
    var bR = (x + r) + "," + (y + r);
    return tL + " " + tR + " " + bR + " " + bL;
}

var makeCnxn = function(x, y, r){//forbid "unlinked" name
    
    var s = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

    s.setAttribute("cx", x);
    s.setAttribute("cy", y);
    s.setAttribute("r", r);
    s.setAttribute("points", cnxnPts(x, y, r));
    s.setAttribute("customType", "cnxn");
    s.setAttribute("link", "unlinked");
    s.setAttribute("linkDist", 0);
    
    return s;

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

var addEl = function(x, y, type){
    var child;
    switch(type){
    case ADD_PT:
	child = makePt( x, y, 20 );
	child.addEventListener("click", elClick);
	break;
    case ADD_PATH:
	child = makePath( x, y, mousex, mousey );
	break;
    case ADD_NODE:
	child = makeNode( x, y, 20 );
	child.addEventListener("click", elClick);
	break;
    case ADD_CNXN:
	child = makeCnxn( x, y, 20 );
	child.addEventListener("click", elClick);
	break;
    }

    if (type >= ADD_PT && type <= ADD_CNXN){
	child.setAttribute("id", idCount);
	child.setAttribute("name", child.getAttribute("customType") + idCount++);
	
    }
    getActivePage().appendChild(child);
    return child;
}

var updateCanvas = function(e){
    
    var page = getActivePage();
    if (page == null){
	
    }
    else{
	for (i = 0; i < page.children.length; i++){
	    var child = page.childNodes[i];
	    
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
    }
}

var distance = function(x1,y1,x2,y2){
    //x1 = parseInt(x1);
    //y1 = parseInt(y1);
    //x2 = parseInt(x2);
    //y2 = parseInt(y2);
    return Math.sqrt( Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2) );
}

var validPtDistance = function(x, y){
    var page = getActivePage();
    for (i = 0; i < page.children.length; i++){
		var child = page.childNodes[i];
		var type = child.getAttribute("customType");
		if (type == "pt" || type == "cnxn" || type == "node"){
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
    var page = getActivePage();
    
    for (i = 0; i < page.children.length; i++){
	var child = page.childNodes[i];
	var type = child.getAttribute("customType");
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

var clickedEl = null; //tracking
//concerns: runtime
var canvasClick = function(e){

    switch (mode){
    case ADD_PT:
    case ADD_NODE:
    case ADD_CNXN:
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

var clrCnxn = function(cnxn){
    var tarID = cnxn.getAttribute("link");
    var i,j;
    for (i = 0; i < editorCanvas.children.length; i++){
		var page = editorCanvas.childNodes[i];
		for (j = 0; j < page.children.length; j++){
		    var child = page.childNodes[j];
		    if (child.getAttribute("id") == tarID){
			child.setAttribute("link", "unlinked");
		    }
		}
    }
}

//To do - add restrictions on clicking, status bar (error log)
//Custom colors and path etc
//LOAD DATA!

//MORE UI FUNCTIONS
var setModeFunc = function(newMode){
    return function(){
	clrActive();
	clrMonitor();
	if (newMode == ADD_PT ||
	    newMode == ADD_CNXN ||
	    newMode == ADD_NODE){
	    var page = getActivePage();
	    if (page != null || page != undefined)
	    page.appendChild(makeShadow(0, 0, 20, newMode));
	}
	setMode(newMode);
    };
}

var clrActive = function(){
    var page = getActivePage();
    if (page != null){
    for (i = 0; i < page.children.length; i++){
	var child = page.childNodes[i];
	if ( child.getAttribute("active") == "true" ){
	    page.removeChild(child);
	    break;
	}
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

//Monitors
//==================================================================


//Needs to be edited to remove dependencies
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

//LOADING PAGE : needs refactoring
var globalMapData = {};

var loadMap = function(mapDataWrap){
	//console.log("loading");
	//console.log(mapDataWrap);
	loadTitle(mapDataWrap["mapName"]); //UNCOMMENT
	
	
    if (mapDataWrap["data"] == null) {
	    totalPages = 0; //load
	    idCount = 0; //simple id scheme, just count up every time element is made
	    addPage();
	    page = getActivePage();
	    
    	pgNum.innerHTML = page.getAttribute('num');
    	pgTitle.innerHTML =  page.getAttribute("name");
	    mode = DEFAULT;
    	} 
    else {
    	var canvasJSON = JSON.parse(mapDataWrap["data"]);
		totalPages = 0;
		console.log(canvasJSON);
		idCount = canvasJSON["idCt"];
		var pageData;
		for (i = 0; i < canvasJSON["canvas"].length; i++){
			pageData = canvasJSON["canvas"][i];
		    var page = addPage();
		    page.setAttribute( "name", pageData["name"] );
		    //page.setAtribute( "num", pageData["num"] ); //not sure we need this
		    page.setAttribute( "imgUrl", pageData["imgUrl"] );
		    //set the img in the thing
		    page.firstChild.setAttribute("xlink:href", pageData["imgUrl"]);
		    page.setAttribute( "isCurrent", "true" );
		    page.setAttribute( "id", "viewport" );

		    var item;

		    //console.log("PAGE DATA LENGTH IS " + pageData["data"].length);
		    
		    for (j = 0; j < pageData["data"].length; j++){//the first one is itself for some reason
				item = pageData["data"][j];
				//console.log(item);
		    	//console.log("registering item " + item["type"]);
		    	
				var el;
				switch (item["type"]){
				    //name, id
				case "pt":
				    el = makePt(item["cx"], item["cy"], item["r"]);
				    el.addEventListener("click", elClick);
				    break;
				case "node":
				    el = makeNode(item["cx"], item["cy"], item["r"]);
				    el.addEventListener("click", elClick);
				    break;
				case "cnxn":
				    el = makeCnxn(item["cx"], item["cy"], item["r"]);
				    el.setAttribute("link", item["link"]);
				    el.setAttribute("linkDist", item["linkDist"]);
				    el.addEventListener("click", elClick);
				    break;
				case "path":
				    el = makePath(item["x1"], item["y1"], item["x2"], item["y2"]);
				    el.setAttribute("p1", item["p1"]);
				    el.setAttribute("p2", item["p2"]);
				    el.setAttribute("stroke-width", item["width"]);
				    el.setAttribute("dist", item["dist"]);
				    el.setAttribute("active", "false");
				    el.addEventListener("click", elClick);
				    //console.log("active set to false");
				    break;
				}
			
				el.setAttribute("name", item["name"]);
				el.setAttribute("id", item["id"]);
				el.setAttribute("visibility", "hidden");
				page.appendChild(el);
				//console.log("j is " + j);
				//console.log(el);
		    }
		    
		}
		
		totalPages = canvasJSON["pages"];

		if (totalPages != 0){
			
	    	setPage(1);
		}

    }
	
}


var loadMapWrap = function(){//initalization script
	var mapData;
    $.ajax({	   
	    url: "/loadData/",
	    type: "POST",
	    //data: {"mapId" : id},
	    dataType: "json",
	    success: function(data) {
			loadMap(data);
			console.log("wrapper");
			console.log(data);
			globalMapData["data"] = data;
		},
		error: function() {
			console.log("unable to pull Data");
	    }
	});
}

loadMapWrap();

var loadTitle = function(title){
    mapTitle.innerHTML = title;
}

//SAVING AND LOADING
var saveMap = function(){
    var mapJSON = canvasToJSON();
    console.log(mapJSON);
    $.ajax({
	    url : "/saveData/",
	    type: "POST",
	    data: {"canvas": mapJSON},
	    dataType: "json",
	    success: function(response) {
		console.log("map saved");
	    },
	    error: function(data) {
		console.log(data);
		console.log("nope");
	    }
	});
    return null;
}

var canvasToJSON = function(){

    //not sure if we need pages
    var canvasJSON = {"canvas": [], "pages" : totalPages, "idCt" : idCount };
    for (i = 0; i < editorCanvas.children.length; i++){
	var child = editorCanvas.childNodes[i]; //store pages
	var pageDict = {"name": child.getAttribute("name"), 
			    "num": child.getAttribute("num"),
			    "imgUrl": child.getAttribute("imgUrl"),
			    "data" : []}; 
	canvasJSON["canvas"].push(pageDict);
	for (j = 0; j < child.children.length; j++){//first two are irrelevant
	    var item = child.childNodes[j];
	    if (item.getAttribute("name") == null || item.getAttribute("name") == "") 
	    	continue;
	    var itemDict = {"name": item.getAttribute("name"),
			    "id": item.getAttribute("id"),
			    "type": item.getAttribute("customType"),
			   }//add color here

	    switch (item.getAttribute("customType")){
		case "pt":
		case "node":
		itemDict["cx"] = item.getAttribute("cx");
		itemDict["cy"] = item.getAttribute("cy");
		itemDict["r"] = item.getAttribute("r");
		break;
		case "cnxn":
		itemDict["cx"] = item.getAttribute("cx");
		itemDict["cy"] = item.getAttribute("cy");
		itemDict["r"] = item.getAttribute("r");
		itemDict["link"] = item.getAttribute("link");
		itemDict["linkDist"] = item.getAttribute('linkDist');
		break;
		case "path":
		itemDict["x1"] = item.getAttribute("x1");
		itemDict["y1"] = item.getAttribute("y1");
		itemDict["x2"] = item.getAttribute("x2");
		itemDict["y2"] = item.getAttribute("y2");
		itemDict["p1"] = item.getAttribute("p1");
		itemDict["p2"] = item.getAttribute("p2");
		itemDict["width"] = item.getAttribute("stroke-width");
		itemDict["dist"] = item.getAttribute("dist");
		break;
	    }
	    pageDict["data"].push(itemDict);
	    /*
	    switch (item.getAttribute("customType")){
		case "pt":
		case "node":
		itemDict.cx = item.getAttribute("cx");
		itemDict.cy = item.getAttribute("cy");
		itemDict.r = item.getAttribute("r");
		break;
		case "cnxn":
		itemDict.cx = item.getAttribute("cx");
		itemDict.cy = item.getAttribute("cy");
		itemDict.r = item.getAttribute("r");
		itemDict.link = item.getAttribute("link");
		break;
		case "path":
		itemDict.x1 = item.getAttribute("x1");
		itemDict.y1 = item.getAttribute("y1");
		itemDict.x2 = item.getAttribute("x2");
		itemDict.y2 = item.getAttribute("y2");
		itemDict.p1 = item.getAttribute("p1");
		itemDict.p2 = item.getAttribute("p2");
		itemDict.width = item.getAttribute("stroke-width");
		break;
	    }
	    pageDict["data"].push(itemDict);
	    */
	}
    }
    console.log(JSON.stringify(canvasJSON));
    //    return canvasJSON;
    return JSON.stringify(canvasJSON)
}

var refreshIDs = function(){
    //to prevent overflow (long term sustainability)
}

    //i need to do the image stuff on the page.


var pythDist = function(x1, y1, x2, y2){
	
	var dx = x2 - x1;
	var dy = y2 - y1;
	return Math.round( Math.sqrt(dy * dy + dx * dx) );
	
}

var delMap = function(){
	
	alert("Are you sure?"); //are you sure?
	
}

//FILE UPLOAD
//REDO THESE SO THAT IT FITS OUR TEMPLATE
var form = document.getElementById('form_upload');
var fileSelect = document.getElementById('upload_input');
var uploadButton = document.getElementById('upload-button');

var imgUpload = function(event){

	
	event.preventDefault();
	
	// Update button text.
	uploadButton.innerHTML = 'Uploading...';

	 // Get the selected files from the input.
	var files = upLoadButton.files;
	
	// Create a new FormData object.
	var formData = new FormData();
	
	var file = files[0];
	
	// Check the file type.
	if (!file.type.match('image.*')) {
    	//continue;
	}

	// Add the file to the request.
	formData.append('photos[]', file, file.name);
	
	// Set up the request.
	var xhr = new XMLHttpRequest();
	
	// Open the connection.
	xhr.open('POST', 'handler.php', true);
	
	// Set up a handler for when the request finishes.
	xhr.onload = function () {
		if (xhr.status === 200) {
			// File(s) uploaded.
			uploadButton.innerHTML = 'Upload';
		} 
		else {
	    	alert('An error occurred!');
	  }
	};

    // Send the Data.
	xhr.send(formData);
    
    //$.ajax({	   
	  //  url: "/map/upload/",
	   // type: "POST",
	   // dataType: "json",
		//data : {"upload": formData
		// },//put relevant data in here so python /upload/ route can function
		
	
	$.ajax($.extend({}, {
		url: "/map/upload/",
		type: 'POST',
		data: formData,//put relevant data in here so python /upload/ route can function
		cache: false,
		dataType: 'json',
		success: function(data, textStatus, jqXHR){ self.settings.success(data, textStatus, jqXHR); },
		error: function(jqXHR, textStatus, errorThrown){ self.settings.error(jqXHR, textStatus, errorThrown); },
		complete: function(jqXHR, textStatus){ self.settings.complete(jqXHR, textStatus); }
		
	}, self.settings.submitOptions));
		
		/*
	    success: function(data) {
	    	
	    	getActivePage().firstChild.setAttribute("xlink:href", response);
			getActivePage().setAttribute("imgUrl", response);

		},
		error: function() {
			console.log("unable to pull Data");
	    }
	);
	*/
	
	return null;
	
}
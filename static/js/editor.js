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
var width = editorCanvas.getBoundingClientRect().width;
var height = editorCanvas.getBoundingClientRect().height;
var pgNum = document.getElementById("pgNum");
var pgTitle = document.getElementById("pgTitle");
var mapID = document.getElementById("mapID").innerHTML;
var mousex, mousey;
var modeDisplay = document.getElementById("modeDisplay");
var canvasData = {
    "mapID": mapID,
    "title": pgTitle.innerHTML,
    "updateDate": 0,
    "pages": [],
    "activePageCtr" : 0,
    "guidCtr" : 0
}; 

var mapMode;

//FIX MOUSE BUG...
editorCanvas.addEventListener("mousemove", function(e) {
    mousex = e.offsetX;
    mousey = e.offsetY;
});

var logStatus = function(s){
    document.getElementById("status").innerHTML = s;
}

//GENERAL UI

/* Page components */
var mapTitle = document.getElementById("mapTitle").innerHTML;
var monitor = document.getElementById("monitor");

//Information
//var mapName = document.getElementById("mapName");
//var pgName = document.getElementById("pgName");

var getNewID = function(){
    canvasData["guidCtr"] += 1;
    return canvasData["guidCtr"];
}

/* Page js */
var totalPages = 0; //load
var idCount = 0; //simple id scheme, just count up every time element is made

var getPage = function(num){
    return canvasData["pages"][num];
}

var getPageDOM = function(num){
    return editorCanvas.childNodes[num];
}

var getActivePage = function(){
    return getPage(canvasData["activePageCtr"]);
}

var getActivePageDOM = function(){
    return getPageDOM(canvasData["activePageCtr"]);
}

// pre : number
// post: activePage set to page <num>
var setPage = function(num){

    clrActive();
    clrMonitor();

    hidePage(canvasData["activePageCtr"]);
    canvasData["activePageCtr"] = num;
    showPage(canvasData["activePageCtr"]);
}

// pre :
// post: activePage switched to next page
var toNextPage = function(){
    if (canvasData["activePageCtr"] == totalPages() - 1){
	logStatus("You're on the last page");
    }
    else {
	hidePage(canvasData["activePageCtr"]);
	canvasData["activePageCtr"] += 1;
	showPage(canvasData["activePageCtr"]);
    }
}

// pre :
// post: activePage switched to previous page
var toPrevPage = function(){
    if (canvasData["activePageCtr"] == 0){
	logStatus("You're on the first page");	
    }
    else {
	hidePage(canvasData["activePageCtr"]);
	canvasData["activePageCtr"] -= 1;
	showPage(canvasData["activePageCtr"]);
    }
}

// pre : number
// post: page <num> DOM hidden
var hidePage = function(num){
    var page = getPageDOM(num);
    if (page != null){
	page.setAttribute("visibility", "hidden");
    }
}

// pre : number
// post: page <num> DOM revealed
var showPage = function(num){
    var page = getPageDOM(num);
    if (page != null){
	page.setAttribute("visibility", "visible");
	page.setAttribute("id", "viewport");
	pgNum.innerHTML = num+1;
	pgTitle.innerHTML =  page.getAttribute("name");
    }
}

// pre :
// post: returns number of pages in canvasDict
var totalPages = function(){
    return canvasData["pages"].length;
}

// pre :
// post: new page added to canvasData and DOM, returns canvasPage
var addPage = function(){
    //construct the page
    
    //CANVAS DATA
    canvasData["pages"].push({
	"pageNum" : totalPages(),
	"pageName" : "Default Page Name",
	"backgroundImage" : "defaultBackgroundImage.png",
	"id" : getNewID(), //i have no good ideas
	"nodes" : [],
	"edges" : [],
	"status" : "n"
    });
    
    editorCanvas.append(makePageDOM(canvasData["pages"][totalPages()-1]));
    
    if (totalPages() == 1){ //this was our first page
	canvasData["activePageCtr"] = 0;
	showPage(0);
    }
    else if (canvasData["activePageCtr"] == totalPages() - 2){//we were on the last page
	toNextPage();
    }
    
    return canvasData["pages"][totalPages()-1];
}

var makePageDOM = function(pageDict){
    var p = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    p.setAttribute("name", pageDict["pageName"]);
    p.setAttribute("id", "viewport");
    return p;
}

var delPage = function(){ //not done...

    //TODO : ADD PROMPT!
    if (totalPages() <= 1) logStatus("Can't remove page");
    else {
	//Do the DOM
	var curPageDOM = getActivePageDOM();
	editorCanvas.removeChild(curPageDOM);

	var curPage = getActivePage();
	//take care of backend

	//we can't have connections on a 1 page map
	for (i = 0; i < curPage["nodes"].length; i++){ //optimize!
	    var child = curPage["nodes"][i];
	    if (child["customType"] == "cnxn")
		clrCnxn(child);
	}


	if (curPage["status"] == "r") { 
	    canvasData["deletePages"].push(curPage["id"]);
	}
	logStatus("page removed");
	
	if (canvasData["activePageCtr"] == totalPages() - 1){ //we're on last page
	    canvasData["pages"].splice(canvasData["activePageCtr"], 1);
	    canvasData["activePageCtr"] -= 1;

	}
	else{	    
	    for (i = canvasData["activePageCtr"] + 1; i < totalPages(); i++){
		getPage(i)["pageNum"] -= 1;
		//update everyone else's pageNum
	    }
	    canvasData["pages"].splice(canvasData["activePageCtr"], 1);
	}
	
	
	showPage(canvasData["activePageCtr"]);
    }
}


//EDITOR UI
const DEFAULT = 1;
const ADD_PT = 2;
const ADD_PATH = 4;
const ADD_CNXN = 5;
const CONF_PATH = 7;
const LINK_CNXN = 8;
const CONF_CNXN = 9;
const DEF_SRC = 10;
const DEF_DEST = 11;


var mode = DEFAULT; //edited with other buttons on editor page

//TODO: ADD OPTIONS FOR ADD_ UI

var setMode = function(m){
    mode = m;
    switch (mode){
    case DEFAULT:
	setModeDisplay("Default");
	break;
    case ADD_PT:
	setModeDisplay("Add point");
	break;	
    case ADD_CNXN:
	setModeDisplay("Add connection");
	break;
    case ADD_PATH:
	setModeDisplay("Add path");
	break;
    case CONF_PATH:
	setModeDisplay("Confirm path");
	break;
    case DEF_SRC:
	setModeDisplay("Pick source");
	break;
    case DEF_DEST:
	setModeDisplay("Pick destination");
	break;
    }
}

var setModeDisplay = function(s){
    modeDisplay.innerHTML = s;
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
    l.setAttribute("weight", 0);
    
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

// pre : data
// post: shadow for cur active made, added to DOM
var makeShadow = function(x, y, r, mode){
    var s = null;
    switch(mode){
    case ADD_PT:
	s = makePt(x, y, r);
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

var changePageStatus = function(){
    if (getActivePage()["status"] != "n") {
	getActivePage()["status"] = "u";
    }
}

var changePageStatusByNum = function(num){
    if (getPage(num)["status"] != "n"){
	getPage(num)["status"] = "u";
    }
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
    case ADD_CNXN:
	child = makeCnxn( x, y, 20 );
	child.addEventListener("click", elClick);
	break;
    }

    if (type >= ADD_PT && type <= ADD_CNXN){
	child.setAttribute("id", getNewID());
	child.setAttribute("name", child.getAttribute("customType") + child.getAttribute("id"));	
	child.setAttribute("settings", "");
	child.setAttribute("desc", "");
    }

    //add to js
    var newEntryDict;
    
    if (type != ADD_PATH){	
	newEntryDict = {
	    "id" : child.getAttribute("id"),
	    "status" : "n",
	    "data" : {
		"settings" : "",
		"name" : child.getAttribute("name"),
		"x" : x,
		"y" : y,
		"desc" : ""
	    }
	};
	if (type == ADD_PT){
	    newEntryDict["nodeType"] = 0;
	}
	else if (type == ADD_CNXN){
	    newEntryDict["nodeType"] = 1;
	    newEntryDict["link"] = null;
	    newEntryDict["linkDist"] = 0;
	}
	getActivePage()["nodes"].push(newEntryDict);
	changePageStatus();
    }
    //add to DOM
    getActivePageDOM().appendChild(child);
    return child;
}

var updateCanvas = function(e){ //for shadow/path
    
    var page = getActivePageDOM();
    if (page == null){
	
    }
    else{
	for (i = 0; i < page.children.length; i++){
	    var child = page.childNodes[i];
	    
	    if (child.getAttribute("active") == "true"){
		switch (mode){
		case CONF_PATH:
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
		}	    

		
	    }
	}
    }
}

// pre : id
// post: DOM
var findDOM = function(id){
    var pageDOM = getActivePageDOM();
    for (i = 0; i < pageDOM.children.length; i++){
	if (pageDOM.childNodes[i]["id"] == id) return pageDOM.childNodes[i];
    }
    return null;
}

var findEdgeDOM = function(n1, n2) {
    var pageDOM = getActivePageDOM();
    for (i = 0; i < pageDOM.children.length; i++){
	if (pageDOM.childNodes[i].getAttribute("customType") == "path"){
	    var curEdge = pageDOM.childNodes[i];
	    if ((curEdge.getAttribute("x1") == n1["data"]["x"] && curEdge.getAttribute("y1") == n1["data"]["y"]
		&& curEdge.getAttribute("x2") == n2["data"]["x"] && curEdge.getAttribute("y2") == n2["data"]["y"]) || 
		(curEdge.getAttribute("x2") == n1["data"]["x"] && curEdge.getAttribute("y2") == n1["data"]["y"]
		 && curEdge.getAttribute("x1") == n2["data"]["x"] && curEdge.getAttribute("y1") == n2["data"]["y"]))
		return curEdge;
	}
    }
    return null;
}

// pre : id
// post: dict
var findNode = function(id){
    var activePage = getActivePage();
    for (node of activePage["nodes"]){
	if (node["id"] == id) return node;
    }
    return node;
}

var findByID = function(id){
    console.log("searching for " + id);
    for (var k = 0; k < totalPages(); k++){
	for (node of getPage(k)["nodes"]){
	    if (node["id"] == id) {
		changePageStatus(); //nice...
		console.log("I found it!");
		console.log(node);
		return {"node": node,
			"pageNum": k
		       };
	    }
	}
    }
}

var findEdgeFromDOM = function(edgeDOM){
    var activePage = getActivePage();
    for (edge of activePage["edges"]){
	var node1 = findNode(edge["node1ID"]);
	var node2 = findNode(edge["node2ID"]);
	if ((node1["data"]["x"] == edgeDOM.getAttribute("x1") && node1["data"]["y"] == edgeDOM.getAttribute("y1")
	     && node2["data"]["x"] == edgeDOM.getAttribute("x2") && node2["data"]["y"] == edgeDOM.getAttribute("y2")) ||
	    (node1["data"]["x"] == edgeDOM.getAttribute("x2") && node1["data"]["y"] == edgeDOM.getAttribute("y2")
	     && node2["data"]["x"] == edgeDOM.getAttribute("x1") && node2["data"]["y"] == edgeDOM.getAttribute("y1")))
	    return edge;
    }
    return null;

}


var updateDOM = function(nodeDict){
    var pageDOM = getPageDOM(nodeDict["pageNum"]);
    for (i = 0; i < pageDOM.children.length; i++){
	if (pageDOM.childNodes[i].getAttribute("customType") == "pt" || pageDOM.childNodes[i].getAttribute("customType") == "cnxn"){
	    var curNode = pageDOM.childNodes[i];
	    if (curNode.getAttribute("customType") == "cnxn"){
		curNode.setAttribute("link", nodeDict["node"]["link"]);
		curNode.setAttribute("linkDist", nodeDict["node"]["linkDist"]);
	    }
	}
    }
    changePageStatusByNum(nodeDict["pageNum"]);
}

// pre : coords
// post: pyth distance
var distance = function(x1,y1,x2,y2){
    return Math.sqrt( Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2) );
}

// pre : node ids
// post: pyth distance
var nodeDistance = function(n1ID, n2ID){
    var n1 = findNode(n1ID);
    var n2 = findNode(n2ID);
    return distance(n1["data"]["x"], n1["data"]["y"], n2["data"]["x"], n2["data"]["y"]);
}

// pre : x,y, threshold
// post: if x,y is far enough from all nodes
var validPtDistance = function(x, y, threshold){
    var page = getActivePage();
    for (i = 0; i < page["nodes"].length; i++){
	var node = page["nodes"][i];
	if (distance(x,y, node["data"]["x"], node["data"]["y"]) < threshold)
	    return false;
    }
    return true;
}

// pre : x, y
// post: closest node 
var closestPathDrop = function(x,y){

    var ret = null;
    var champDist = 10000;
    const minThresh = 30;
    var page = getActivePage();
    
    for (node of page["nodes"]){
	if (distance(x,y,node["data"]["x"], node["data"]["y"]) < champDist) {
	    ret = node;
	    champDist = distance(x,y, node["data"]["x"], node["data"]["y"]);
	}
    }
    
    if (champDist < minThresh) return ret;
    else return null;

}

var clickedEl = null; //tracking
var MIN_DIST_THRESHOLD = 30;
//concerns: runtime
var canvasClick = function(e){

    switch (mode){
    case ADD_PT:
    case ADD_CNXN:
	if (validPtDistance(mousex, mousey, MIN_DIST_THRESHOLD)){
	    addEl(mousex, mousey, mode);
	    logStatus("Node added");
	}
	else{
	    logStatus("Too close to neighboring node");
	}
	break;	

    case ADD_PATH:
	closest = closestPathDrop(mousex, mousey); 
	if (closest == null){
	    logStatus("Can't locate anchor node");
	}
	else {
	    var newPath = addEl(closest["data"]["x"], closest["data"]["y"], ADD_PATH);
	    newPath.setAttribute("node1ID", closest["id"]);
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
	    var activePageDOM = getActivePageDOM();
	    var closestDOM = findDOM(closest["id"]);
	    mode = ADD_PATH;
	    var line = activePageDOM.lastChild;
	    var success = true;
	    line.setAttribute("active", false);
	    line.setAttribute("x2", closestDOM.getAttribute("cx")); //BOOKMARKED
	    line.setAttribute("y2", closestDOM.getAttribute("cy"));
	    if (line.getAttribute("node1ID") == closestDOM.getAttribute("id")){
		activePageDOM.removeChild(line);//prevent self-attachment
		logStatus("No self-attachment!");
		success = false;
	    }
	    else {
		line.setAttribute("node2ID", closestDOM.getAttribute("id"));
		for (i = 0; i < activePageDOM.children.length - 1; i++){
		    var child = activePageDOM.childNodes[i];
		    if (child.getAttribute("customType") == "path"){
			if ((child.getAttribute("node1ID") == line.getAttribute("node1ID") &&
			     child.getAttribute("node2ID") == line.getAttribute("node2ID")) ||
			    (child.getAttribute("node1ID") == line.getAttribute("node2ID") &&
			     child.getAttribute("node2ID") == line.getAttribute("node1ID"))
			   ){
			    activePageDOM.removeChild(line);
			    logStatus("The path already exists!");
			    success = false;
			    break;
			}
		    }
		}
	    }
	    
	    //success!
	    if (success){
		console.log(line);
		var node1ID = 0;
		var node2ID = 0;
		if (parseInt(line.getAttribute("node1ID")) < parseInt(line.getAttribute("node2ID"))){
		    node1ID = parseInt(line.getAttribute("node1ID"));
		    node2ID = parseInt(line.getAttribute("node2ID"));
		}
		else {
		    node2ID = parseInt(line.getAttribute("node1ID"));
		    node1ID = parseInt(line.getAttribute("node2ID"));
		}
		var newEntryDict = {
		"id" : line.getAttribute("id"),
		    "status" : "n",
		    "data" : {
			"settings" : "",
			"weight" : parseInt(line.getAttribute("weight"))
		    },
		    "node1ID" : node1ID,
		    "node2ID" : node2ID
		};
		newEntryDict["data"]["weight"] = nodeDistance(newEntryDict["node1ID"], newEntryDict["node2ID"]);
		getActivePage()["edges"].push(newEntryDict);    
		line.setAttribute("weight", newEntryDict["data"]["weight"]);	    
		line.addEventListener("click", elClick);
		changePageStatus();
	    }
	}
	break;
    default:
	logStatus("Non-functional/default");
	break;
    }
    clickedEl = null;
}

var elClick = function(e){
    switch (mode){
    case DEFAULT:
    case DEF_SRC:
    case DEF_DEST:
	logStatus("Monitor");
	clickedEl = this;
	event.stopPropagation();
	refreshMonitor(this);	
	break;
    case LINK_CNXN:
	clickedEl = this;
	if (clickedEl.getAttribute("customType") == "cnxn") {
	    logStatus("Connection initiated");
	    setMode(CONF_CNXN);
	}
	else {
	    logStatus("Not a connection node!");
	}
	event.stopPropagation();
	break;
    case CONF_CNXN:
	if (clickedEl.getAttribute("customType") == "cnxn") {
	    logStatus("Connection end confirmed");
	    confirmCnxnEnd(this); //clickedEl still logged
	    mode = LINK_CNXN;
	}
	else {
	    logStatus("Not a connection node!");
	}
	event.stopPropagation();
	break;
    }
}


var delEl = function(){
    if (clickedEl != null){
	var clickedDict;

	if (clickedEl.getAttribute("customType") == "pt" || clickedEl.getAttribute("customType") == "cnxn")
	    clickedDict = findNode(clickedEl.getAttribute("id"));
	else if (clickedEl.getAttribute("customType") == "path")
	    clickedDict = findEdgeFromDOM(clickedEl); 

	var page = getActivePage();
	var pageDOM = getActivePageDOM();
	//UPDATE DOM
	switch (clickedEl.getAttribute("customType")) { //clear edges
	case "node":
	case "pt":
	case "cnxn":
	    //UDPATE JS AND DOM
	    var k;
	    for (k = 0; k < page["edges"].length; k++){
		var curEdge = page["edges"][k];
		if (curEdge["node1ID"] == clickedDict["id"] ||
		    curEdge["node2ID"] == clickedDict["id"]){
		    curEdge["status"] = "d";
		    var dom = findEdgeDOM(findNode(curEdge["node1ID"]), findNode(curEdge["node2ID"]));
		    
		    pageDOM.removeChild(findEdgeDOM(findNode(curEdge["node1ID"]), findNode(curEdge["node2ID"])));
		}		
	    }
	    	    
	    break;
	}

	clickedDict["status"] = "d";
	if (clickedEl.getAttribute("customType") == "cnxn")
	    clrCnxnFromNode(clickedDict["id"]);
	

	pageDOM.removeChild(clickedEl);

	
	changePageStatus();
	clickedEl = null;
	clrMonitor();
    }
}

var clrCnxnEdge = function(id1, id2){
    id1 = parseInt(id1);
    id2 = parseInt(id2);
    console.log("clearing edge dict of " + id1 + "  " + id2);
    for (edge of canvasData["cnxnEdges"]){
	console.log("cur edge");
	console.log(edge["node1ID"] + " " + edge["node2ID"]);
	if ((id1 == edge["node1ID"] && id2 == edge["node2ID"]) ||
	    (id2 == edge["node1ID"] && id1 == edge["node2ID"])) {
	    if (edge["status"] != "n")
		edge["status"] = "d";
	    else
		canvasData["cnxnEdges"].splice(canvasData["cnxnEdges"].indexOf(edge), 1);
	    //var cnxn1Dict = findByID(edge["node1ID"]);
	    //var cnxn2Dict = findByID(edge["node2ID"]);
	    //cnxn1Dict["node"]["link"] = "unlinked";
	    //cnxn1Dict["node"]["linkDist"] = 0;
	    //cnxn2Dict["node"]["link"] = "unlinked";
	    //cnxn2Dict["node"]["linkDist"] = 0;
	    //updateDOM(cnxn1Dict);
	    //updateDOM(cnxn2Dict);
	}
    }
}

var clrCnxnFromNode = function(id){
    id = parseInt(id);
    console.log("clearing " + id);
    for (edge of canvasData["cnxnEdges"]){
	if (id == edge["node1ID"] || id == edge["node2ID"]){
	    var otherNode;
	    if (id == edge["node1ID"]){
		edge["status"] == "d";
		console.log("associate is " + edge["node2ID"]);
		otherNode = findByID(edge["node2ID"]);
	    }
	    else if (id == edge["node2ID"]){
		edge["status"] == "d";
		console.log("associate is " + edge["node1ID"]);
		otherNode = findByID(edge["node1ID"]);
	    }
	    otherNode["node"]["link"] = "unlinked";
	    otherNode["node"]["linkDist"] = 0;
	    if (otherNode["node"]["status"] != "n"){
		otherNode["node"]["status"] = "u";
	    }
	    changePageStatusByNum(otherNode["pageNum"]);
	    clrCnxnEdge(id, otherNode["node"]["id"]);
	    clrCnxnNodeDOM(otherNode);	    
	}
    }
}

var clrCnxnNodeDOM = function(nodeDict){
    var pageDOM = getPageDOM(nodeDict["pageNum"]);
    for (i = 0; i < pageDOM.children.length; i++){
	if (pageDOM.childNodes[i].getAttribute("customType") == "cnxn"){
	    var curNode = pageDOM.childNodes[i];
	    if (curNode.getAttribute("customType") == "cnxn"){
		curNode.setAttribute("link", "unlinked");
		curNode.setAttribute("linkDist", 0);
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
	    newMode == ADD_CNXN){
	    var page = getActivePageDOM();
	    if (page != null || page != undefined)
		page.appendChild(makeShadow(0, 0, 20, newMode));
	}
	setMode(newMode);
    };
}

var clrActive = function(){
    var page = getActivePageDOM();
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

var confirmCnxnEnd = function(e){
    var cnxn1 = clickedEl;
    var cnxn2 = e;
    clrCnxnFromNode(cnxn1.getAttribute("id"));
    clrCnxnFromNode(cnxn2.getAttribute("id"));
    var cnxn1data = findByID(cnxn1.getAttribute("id")); 
    var cnxn1Src = cnxn1data["node"];
    var cnxn2data = findByID(cnxn2.getAttribute("id"));
    var cnxn2Src = cnxn2data["node"];
    //var cnxn2Src = findNode(cnxn2.getAttribute("id"));
    if (cnxn1data["pageNum"] == canvasData["activePageCtr"]) {
	logStatus("Cnxn's cannot be on same page");
    }
    else {
	cnxn1Src["link"] = cnxn2Src["id"];
	cnxn1Src["linkDist"] = 0;
	cnxn2Src["link"] = cnxn1Src["id"];
	cnxn2Src["linkDist"] = 0;
	var dictN1ID = 0;
	var dictN2ID = 0;
	if (cnxn1Src["id"] < cnxn2Src["id"]){
	    dictN1ID = cnxn1Src["id"];
	    dictN2ID = cnxn2Src["id"];
	}
	else {
	    dictN2ID = cnxn1Src["id"];
	    dictN1ID = cnxn2Src["id"];
	}
	updateDOM(cnxn1data);
	updateDOM(cnxn2data);
	//register edge from end point for convenience, just don't add it
	var newEdgeDict = {
	    "id" : getNewID(),
	    "status" : "n",
	    "data" : {
		"settings" : "",
		"weight" : 0
	    },
	    "node1ID" : dictN1ID,
	    "node2ID" : dictN2ID
	};
	
	canvasData["cnxnEdges"].push(newEdgeDict);
	
    }
}


//Monitors
//==================================================================


//Needs to be edited to remove dependencies
var clrEditor = function(){
    var page = getActivePageDOM()
    while (page.hasChildNodes()){
	page.removeChild(page.lastChild);
    }
};

var clrMonitor = function(){
    monitor.innerHTML = "";
}

var refreshMonitor = function(itemDOM){
    clrMonitor();
    var item;
    if (itemDOM.getAttribute("customType") == "pt"){
	item = findNode(itemDOM.getAttribute("id"));
	addMonitorEntry("point", item["data"]["name"], false).setAttribute("class", "lead text-primary");
	addMonitorEntry("ID", item["id"], true);
	addMonitorEntry("desc", item["data"]["desc"], false);
    }
    else if (itemDOM.getAttribute("customType") == "cnxn"){
	item = findNode(itemDOM.getAttribute("id"));
	console.log("getting monitor data");
	console.log(item);
	addMonitorEntry("connection", item["data"]["name"], false).setAttribute("class", "lead text-primary");
	addMonitorEntry("ID", item["id"], true);
	addMonitorEntry("desc", item["data"]["desc"], false);
	addMonitorEntry("link ID", item["link"], true);
	addMonitorEntry("link distance", item["linkDist"], false);
    }
    else {
	item = findEdgeFromDOM(itemDOM);
	addMonitorEntry("path", "", true).setAttribute("class", "lead text-primary");
    }
    
    
    switch (itemDOM.getAttribute("customType")){
    case "path":
	addMonitorEntry("Point 1", item["node1ID"], true);
	addMonitorEntry("Point 2", item["node2ID"], true);
	addMonitorEntry("weight", item["data"]["weight"], false);
	break;
    case "cnxn":
	break;
    }

}

var addMonitorEntry = function(s1, s2, isStatic){
    var s = document.createElement("h6");
    var editSpan = document.createElement("span");
    var headerSpan = document.createElement("span");
    headerSpan.innerHTML = s1[0].toUpperCase() + s1.slice(1) + " : ";
    editSpan.innerHTML = s2;
   
    s.appendChild(headerSpan);
    s.appendChild(editSpan);
    
    if (!isStatic){
	editSpan.contentEditable = "true";
	editSpan.setAttribute("spellcheck", "false");
	editSpan.setAttribute("attr", s1);
	editSpan.addEventListener("focus", function(){
	    var tempClass = editSpan.getAttribute("class");
	    editSpan.setAttribute("class", tempClass + " text-muted");
	});
	editSpan.addEventListener("focusout", function(){
	    editSpan.setAttribute("class", "");
	    logChange(this);
	});
    }
    monitor.appendChild(s);
    return s;
}



var logChange = function(el){
    var item;
    if (clickedEl.getAttribute("customType") == "pt" || clickedEl.getAttribute("customType") == "cnxn"){
	item = findNode(clickedEl.getAttribute("id"));
    }
    else {
	item = findEdgeFromDOM(clickedEl);
    }
    switch (el.getAttribute("attr")){
    case "point":
    case "path":
    case "connection":
	item["data"]["name"] = el.innerHTML;
	break;
    case "link":
	changeLinkedPageStatus();
	break;
    case "linkDist":
	changeLinkedPageStatus();
	break;
    default:
	item["data"][el.getAttribute("attr")] = el.innerHTML;
	break;
    }
    item["status"] = "u";
    changePageStatus();

}


var delMap = function(){
    
    alert("Are you sure?"); //are you sure?
    
}

//FILE UPLOAD
//REDO THESE SO THAT IT FITS OUR TEMPLATE
var form = document.getElementById('form_upload');
var fileSelect = document.getElementById('upload_input');
var uploadButton = document.getElementById('upload-button');

var uploadImg = function(event){

    
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



var initializeMap = function(){
    $.ajax({	   
	url: "/loadData/",
	type: "POST",
	data: {"mapID" : mapID},
	dataType: "json",
	success: function(data) {
	    loadMap(data);
	    $(document).trigger("loadView");
	},
	error: function() {
	    console.log("unable to pull Data");
	}
    });
}

var loadMap = function(mapData){
    mapMode = document.getElementById("mapMode").innerHTML;
    canvasData["mapID"] = mapID;
    canvasData["mapTitle"] = mapTitle;
    canvasData["deletePages"] = [];
    canvasData["cnxnEdges"] = [];
    if (mapData["pages"].length == 0) { //brand new map
	addPage();
	setMode(DEFAULT);	
    } 
    else {
	console.log("Map loaded.");
	canvasData = mapData;
	canvasData["deletePages"] = [];
	if (mapMode == "Editor"){
	    setEditables("mapTitle");
	    setEditables("pgTitle");
	}	
	for (i = 0; i < totalPages(); i++){
	    var curPage = getPage(i);
	    curPage["status"] = "r";
	    var pgDOM = makePageDOM(curPage);
	    canvasData["activePageCtr"] = i;
	    //add elements
	    //NODES
	    for (j = 0; j < curPage["nodes"].length; j++){
		var nodeDict = curPage["nodes"][j];
		var child;
		if (nodeDict["nodeType"] == 0){
		    child = makePt( nodeDict["data"]["x"], nodeDict["data"]["y"], 20 );
		}
		else if (nodeDict["nodeType"] == 1){
		    child = makeCnxn( nodeDict["data"]["x"], nodeDict["data"]["y"], 20 );
		}
		child.setAttribute("id", nodeDict["id"]);
		child.setAttribute("name", nodeDict["data"]["name"]);
		child.setAttribute("settings", nodeDict["data"]["settings"]);
		child.setAttribute("desc", nodeDict["data"]["desc"]);
		child.setAttribute("nodeType", nodeDict["nodeType"]);
		child.addEventListener("click", elClick);
		pgDOM.appendChild(child);
		nodeDict["status"] = "r";
	    }
	    //EDGES
	    for (j = 0; j < curPage["edges"].length; j++){
		var edgeDict = curPage["edges"][j];
		console.log(edgeDict);
		var n1= findNode(edgeDict["node1ID"]);
		var n2 = findNode(edgeDict["node2ID"]);
		var child = makePath(n1["data"]["x"], n1["data"]["y"], n2["data"]["x"], n2["data"]["y"]);
		child.setAttribute("weight", edgeDict["weight"]);
		child.setAttribute("settings", edgeDict["settings"]);
		child.setAttribute("active", false);
		child.addEventListener("click", elClick);
		pgDOM.appendChild(child);
		edgeDict["status"] = "r";
	    }
	    editorCanvas.appendChild(pgDOM);
	}

	for (j =0; j < canvasData["cnxnEdges"].length; j++){
	    var edgeDict = canvasData["cnxnEdges"][j];
	    edgeDict["status"] = "r";
	    var firstCnxnDict = findByID(edgeDict["node1ID"]);
	    var firstCnxn = firstCnxnDict["node"];
	    firstCnxn["link"] = edgeDict["node2ID"];
	    firstCnxn["linkDist"] = edgeDict["data"]["weight"];
	    var secondCnxnDict = findByID(edgeDict["node2ID"]);
	    var secondCnxn = secondCnxnDict["node"];
	    secondCnxn["link"] = edgeDict["node1ID"];
	    secondCnxn["linkDist"] = edgeDict["data"]["weight"];
	    console.log("cnxn registered");
	    updateDOM(firstCnxnDict);
	    updateDOM(secondCnxnDict);
	}

	
	for (i = 0; i < totalPages(); i++){
	    hidePage(i);
	}
	setPage(0);

    }
    
}

//SAVING AND LOADING
//for saving, I need map data, page data
var saveMap = function(){

    newData = JSON.stringify(prepSave());
    console.log(newData);
    
    $.ajax({
	url : "/saveData/",
	type: "POST",
	data: {"mapData": newData},
	dataType: "json",
	success: function(response) {
	    console.log("map saved");
	},
	error: function(data) {
	    console.log("error saving");
	}
    });

    return null;

    //only assign new IDs internally, use ctr for other purposes
}

//return all necessary data for saving
var prepSave = function(){

    //not sure if we need pages
    var newData = {"mapID": canvasData["mapID"],
		   "title": canvasData["title"],
		   "deletePages" : canvasData["deletePages"],
		   "pages": [] ,
		   "guidCtr" : canvasData["guidCtr"],
		   "cnxnEdges" : canvasData["cnxnEdges"]
		  };
    console.log(canvasData["pages"]);
    for (i = 0; i < totalPages(); i++){
	console.log("we trying");
	page = canvasData["pages"][i];
	console.log(page);
	if (page["status"] != "r"){
	    curPageRet = page;
	    newData["pages"].push(curPageRet);
	}
    }
    return newData;
}

var setEditables = function(domID){
    var el = document.getElementById(domID);
    el.contentEditable = "true";
    el.setAttribute("spellcheck", "false");
    el.addEventListener("focus", function(){
	var tempClass = el.getAttribute("class"); //token efforts
	el.setAttribute("class", tempClass + " text-muted");
    });
    el.addEventListener("focusout", function(){
	el.setAttribute("class", "");
	logChangeSpecial(this, domID);
    });

}

var logChangeSpecial = function(el, domID){
    if (domID == "mapTitle"){
	canvasData["title"] = el.innerHTML;
    }
    else if (domID == "pgTitle"){
	getActivePage()["pageName"] = el.innerHTML;
	changePageStatus();
    }
    
}

$(document).ready(
    function(){
	initializeMap();
    }
);

//TODO: set all statuses to "a" at beginning


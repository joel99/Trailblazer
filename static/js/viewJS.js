const DEF_SRC = 10;
const DEF_DEST = 11;

var algoNode1ID;
var algoNode2ID;

//DOM elements
var srcID = document.getElementById("srcID");
var srcName = document.getElementById("srcName");
var destID = document.getElementById("destID");
var destName = document.getElementById("destName");
var dirMonitor = document.getElementById("dirMonitor");
var dirHeader = document.getElementById("dirHeader");

var clearQuery = function(){
    alogNode1ID = null;
    algoNode2ID = null;
    srcID.innerHTML = "";
    srcName.innerHTML = "";
    destID.innerHTML = "";
    destName.innerHTML = "";
    setMode(DEFAULT);
    clearDir();
}

var initializeView = function(){
    var j;
    clearDir();
    for (j = 0; j < totalPages(); j++){
	var curPageDOM = getPageDOM(j);
	var k;
	for (k = 0; k < curPageDOM.children.length; k++){
	    var curNode = curPageDOM.childNodes[k];
	    if (curNode.getAttribute("customType") == "pt"){
		curNode.addEventListener("click", viewNodeClick);
	    }
	}
    }
    //add nodeClick enhanced
}

var viewNodeClick = function(e){
    if (mode == DEF_SRC){
	algoNode1ID = parseInt(this.getAttribute("id"));
	updateViewDOM(this, 0);
	logStatus("SRC defined");
    }
    else if (mode == DEF_DEST){
	algoNode2ID = parseInt(this.getAttribute("id"));
	updateViewDOM(this, 1);
	logStatus("DEST defined");
    }
    else {

    }
}

var updateViewDOM = function(el, target){
    if (target == 0){
	srcID.innerHTML = el.getAttribute("id");
	srcName.innerHTML = el.getAttribute("name");
    }
    else if (target == 1){
	destID.innerHTML = el.getAttribute("id");
	destName.innerHTML = el.getAttribute("name");
    }
}

//ALGO

const MAX_DIST = 1000000;
//for now do single page view
var calcPath = function(){
    clrMonitor();
    clearDir();
    if (algoNode1ID == null || algoNode2ID == null){
	logStatus("Path gen failed");
    }
    else if (algoNode1ID == algoNode2ID){
	logStatus("Please select distinct endpoints");
    }
    else {
	//first gather relevant pages/resources (I think)
	//for now assume one page (in the end we'll need to gather
	//djikstra's
	//for algo, we only consider ID's
	var verts = {};
	var allEdges = [];
	var srcNode = findNode(algoNode1ID);
	var destNode = findNode(algoNode2ID);
	var k;
	var visitedIDs = [];
	var unvisitedIDs = [];
	for (k = 0; k < totalPages(); k++){ //gather all edges
	    allEdges = allEdges.concat(canvasData["pages"][k]["edges"]);
	    //also get cnxn's here eventually
	}

	for (k = 0; k < totalPages(); k++){ //initialize distances
	    var curNodeArr = canvasData["pages"][k]["nodes"];
	    var l;
	    for (l = 0; l < curNodeArr.length; l++){
		verts[curNodeArr[l]["id"].toString()] = {
		    "dist": MAX_DIST,
		    "prevID" : null,
		    "neighbors" : getNeighbors(curNodeArr[l]["id"], allEdges)
		};
		unvisitedIDs.push(curNodeArr[l]["id"]);
	    }
	}
	verts[algoNode1ID]["dist"] = 0;
	//var indexOfInit = unvisitedIDs.indexOf(algoNode1ID);
	//unvisitedIDs.splice(indexOfInit, 1);
	var curNodeID = algoNode1ID;
	while(curNodeID != algoNode2ID){ //here we go
	    var curNeighbors = verts[curNodeID.toString()]["neighbors"];
	    for (var curNeighborID in curNeighbors){
		var tentDist = verts[curNodeID]["dist"] + curNeighbors[curNeighborID];
		if (tentDist < verts[curNeighborID]["dist"]){
		    console.log(verts[curNeighborID]["dist"] + " trumped for " + curNeighborID);
		    verts[curNeighborID]["dist"] = tentDist;
		    verts[curNeighborID]["prevID"] = curNodeID;
		}
	    }
	    //update
	    visitedIDs.push(curNodeID);
	    unvisitedIDs.splice(unvisitedIDs.indexOf(curNodeID), 1);
	    //find least path
	    curNodeID = getLeastDistID(unvisitedIDs, verts);
	    
	    if (curNodeID == -1) {
		break;
	    }
	}
	//found it
	//print diag
	console.log(verts[algoNode2ID]["dist"]);
	if (curNodeID == -1){
	    clearDir();
	    updateDir("Impossible to reach");
	}

	var traverseBackID = algoNode2ID;
	clearDir();
	logStatus("Total distance : " + verts[algoNode2ID]["dist"]);
	var endNode = findNode(algoNode2ID);
	updateDir("Arrive at " + endNode["data"]["name"]);
	while (traverseBackID != algoNode1ID){
	    var prevNodeID = verts[traverseBackID]["prevID"];
	    updateDir("Travel " + (verts[traverseBackID]["dist"] - verts[prevNodeID]["dist"])
		      + " units to " + findNode(parseInt(traverseBackID))["data"]["name"]);
	    traverseBackID = prevNodeID;
	}
	updateDir("Depart from " + findNode(algoNode1ID)["data"]["name"]);
    }
}


var getLeastDistID = function(idArr, d){
    var m;
    if (idArr.length == 0) return -1;
    var champIDIndex = 0;
    for (m = 1; m < idArr.length; m++){
	if (d[idArr[m]]["dist"] < d[idArr[champIDIndex]]["dist"])
	    champID = m;
    }
    if (d[idArr[champIDIndex]]["dist"] == MAX_DIST){
	return -1;
    }

    return idArr[champIDIndex];
}

//pre : nodeSrc
//    : edge list with node1 and node2
//post: neighbor dict with {id : dist}
var getNeighbors = function(id, edges){
    var ret = {};
    var k;
    for (k = 0; k < edges.length; k++){
	if (edges[k]["node1ID"] == id)
	    ret[edges[k]["node2ID"]] = edges[k]["data"]["weight"];
	else if (edges[k]["node2ID"] == id)
	    ret[edges[k]["node1ID"]] = edges[k]["data"]["weight"];
    }

    return ret;
}

// DIRECTION GENERATION


var clearDir = function(){
    dirHeader.setAttribute("style", "visibility:hidden");
    dirMonitor.innerHTML = "";
}

var updateDir = function(s){
    dirHeader.setAttribute("style", "visibility:visible");
    var p = document.createElement("p");
    p.innerHTML = s;
    dirMonitor.insertBefore(p, dirMonitor.firstChild);    
}

$(document).bind("loadView", initializeView);

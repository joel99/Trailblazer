var mapData;



var lData = function(){//initalization script
    $.ajax({	   
	    url: "/loadData/",
	    type: "POST",
	    //data: {"mapId" : id},
	    dataType: "json",
	    success: function(data) {
			console.log("w1");
			console.log(data);
			mapData = data;
			console.log(mapData);
		},
		error: function() {
			console.log("w2");
	    }
	});
}

lData();

console.log(mapData);


//returns dict of lists of dictionaries : {nodes, pts, paths, cnxns}
/*
  {
  "node": [{id}, {id}, ...]//nodes list
  "pt": [{id}, {id}, ...]//pt list
  "path": [{id, p1, p2}, {id, p1, p2} ...]//path list
  "cnxn":[{id, link}, {id, link}]//cnxn list
  }
*/
var scrapeMapData = function(){
    var ret = {};
    ret["node"] = [];
    ret["pt"] = [];
    ret["path"] = [];
    ret["cnxn"] = [];
    
    if (mapData != null){
	var canvasJSON = mapData["canvasData"];
	for (pageData in canvasJSON["canvas"]){
	    var el;
	    for (item in pageData["data"]){
		el = {"id": item["id"]};
		switch(item["type"]){
		case "path":
		    el["p1"] = item["p1"];
		    el["p2"] = item["p2"];
		    break;
		case "cnxn":
		    el["link"] = item["link"]; 
		    break;
		}
		ret[item["type"]].push(el);
	    }
	}
    }
    return ret;
}

//updates scraped map data
/*
  [
  [{id, [paths]}, {id, [paths]}, ...]//nodes list - alternative: augment with adjacent node
  [{id}, {id}, ...]//pt list same as nodes list
  [{id, p1, p2}, {id, p1, p2} ...]//path list
  [{id, link}, {id, link}]//cnxn list
  ]
*/
var augmentPoints = function(data){
    for (path in data["path"]){
    	console.log(path);
	//find thing with this id
	var p1Found = false;
	var p2Found = false;
	for (node in data["node"]){
	    if (!p1Found && node["id"] == path["p1"]){
		p1Found = true;
		node["paths"].push(path["id"]);
	    }
	    if (!p2Found && node["id"] == path["p2"]){
		p2Found = true;
		node["paths"].push(path["id"]);
	    }
	    if (p1Found && p2Found){
		break;
	    }
	}
	for (pt in data["pt"]){
	    if (!p1Found && pt["id"] == path["p1"]){
		p1Found = true;
		pt["paths"].push(path["id"]);
	    }
	    if (!p2Found && pt["id"] == path["p2"]){
		p2Found = true;
		pt["paths"].push(path["id"]);
	    }
	    if (p1Found && p2Found){
		break;
	    }
	}
	for (cnxn in data["cnxn"]){
	    if (!p1Found && cnxn["id"] == path["p1"]){
		p1Found = true;
		cnxn["paths"].push(path["id"]);
	    }
	    if (!p2Found && cnxn["id"] == path["p2"]){
		p2Found = true;
		cnxn["paths"].push(path["id"]);
	    }
	    if (p1Found && p2Found){
		break;
	    }
	}
	
    }
    return data;
}


var chooseNode = function () {
    //cnxn stuff?
    //if no other node, change color and select
    //if already clicked, and the node is clicked again, remove the node and the path
    
    //algo?
    //if two nodes are clicked
    
    
};

console.log(augmentPoints(scrapeMapData()));
var numOfNodes = scrapeMapData()["node"].length + scrapeMapData()["pt"].length + scrapeMapData()["cnxn"].length; //include function for nums of nodes in map

var optPath = function ( paths, numNodes, start ) {
	
	console.log(numNodes);

    //tree/array for shortest paths
    var pathTree = new Array(numNodes);

    //beginning node
    pathTree[start] = true;

    
    var pathLengths = new Array(numNodes);
    var prevPaths = new Array(numNodes);

    for (var i = 0; i < numNodes; i++) {
		pathLengths[i] = paths[start][i];
		//check if a path branching from the start node exists
		if (paths[start][i] != Infinity) { 
		    //store the node as part of the path
		    prevPaths[i] = start; 
		}
    }

    // distance from start node is 0 (duh)
    pathLengths[start] = 0;

    //find shortest path
    for (var i = 0; i < numVertices - 1; i++) {

		// minimum values to create paths
		var min = Infinity;
		var minIndex = -1;
		
		
		for (var j = 0; j < numOfNodes; j++) {
		    // if a shortest path exists
		    if (!pathTree[j] && pathLengths[j] <= min){
			min = pathLengths[j];
			minIndex = j;
		    }
	}
	
	// one shortest path exists
	pathTree[minIndex] = true;
	
	for (var j = 0; j < numNodes; j++) {
	    if (!pathTrees[j]) {
			// check other paths that may be closer
			var altDist = pathLengths[minIndex] + paths[minIndex][j];
			if (altDist < pathLengths[j]) {
			    pathLengths[j] = altDist;
			    prevPaths[j] = minIndex;
			}
	    }
	}
	
    }


    
    
    
    return { "start": start,
	     "pathLengths": pathLengths,
	     "prevPaths": prevPaths };
    
};

var constructPath = function (shortestPath, endNode) {
    console.log(shortestPath);
    var path = [];
    while (endNode != shortestPath.start) {
		path.unshift(endNode);
		endNode = shortestPath.prevPaths[endNode];
	}
    console.log(path);
    return path;
};

var makeEdges = function () {
    var edges = [];
    var mapData = augmentPoints(scrapeMapData());
    for (var i in mapData["node"]) {
        edges.append([]);
        //create lists with correct number of total paths in for each node                                                                                                         
        for (var j in mapData["path"]) {
            edges[i].append(Infinity);
        }
    }

    // now populate each list with correct distance                                                                                                                                
    for (var i in edges) {
        for (var j in mapData[2]) {
            //not sure how to access the values of each thing in "path"                                                                                                            
            if (i == j[p1] || i == j[p2]) { // <-- not sure if that's how we're going to compare if node is part of that path                                                            
                edges[i][j] = j[dist]; // <-- idk... it's supposed to be length of that path                                                                                   
            }
            //put case for connections here                                                                                                                                        
        }
    }


    console.log(edges);
    return edges;

};
var map = makeEdges();

//var path1to6 = constructPath(optPath(map, numNodes, 1), 6);

var makePath = function (node1, node2) {
	var mapData = augmentPoints(scrapeMapData());	
	if (node1 != null && node2 != null) {
		console.log(map);
		var listOfNodes = constructPath(optPath(map, numNodes, node1), node2);
		var listOfStuff = constructPath(optPath(map, numNodes, node1), node2);
		var length = listOfNodes.length;
		for (var i = 0; i < length - 1; i++) {
			for (var j = 0; j < mapData[2]; j++) {
				if (j[p1] == listOfNodes[i] && j[p2] == listOfNodes[i+1]) {
					listOfStuff.append(j[id]);
					break;
				}
			}
		}
		console.log(listOfNodes);
		console.log("next is the better output");
		console.log(listOfStuff);
		
		var directions = logDirection(listOfNodes);
		
		document.getElementById("directions").innerHTML = directions;
		
		
		//highlighting portion
		
		
		return listOfStuff;
	}else {
		console.log(node1);
		console.log(node2);
		return "Click on two nodes please"; //are nodes cleared?
	}
}

var logDirection = function (nodeList) {
	var string = "";
	for (var i = 0; i < nodeList.length - 1; i++) {
		string += "Move from point" + nodeList[i] + "to" + "point" + nodeList[i+1] + ". " 
	}
	return string;
}




//...
var getOtherEnd = function(pathID, ptID){//
    
}

//Selection mechanism
var editorCanvas = document.getElementById("editorCanvas");

var mousex, mousey;

editorCanvas.addEventListener("mousemove", function(e) {
    mousex = e.offsetX;
    mousey = e.offsetY;
});

var clickedEl = null; //tracking

var node1;
var node2;
var state;

var DEF_SRC = 1;
var DEF_DEST = 2;

var elClick = function(e){

    clrMonitor();
    event.stopPropagation();
    updateMonitor(this.getAttribute("customType"), this.getAttribute("name"));
    addMonitorField("Name");
    updateMonitor("Id", this.getAttribute("id"));

    switch (this.getAttribute("customType")){
    case "pt":
    case "node":
	clickedEl = this;
	break;
    case "path":
	updateMonitor("Point One", this.getAttribute("p1"));
	updateMonitor("Point Two", this.getAttribute("p2"));
	clickedEl = this;
	break;
    case "cnxn":
	updateMonitor("Link", this.getAttribute("link"));
	addMonitorField("Link");
	clickedEl = this;
	break;
    }	
    console.log(this.getAttribute("customType") + " clicked.");

    if (this.getAttribute("customType") == "node" ||
	this.getAttribute("customType") == "cnxn"){
	switch (state){
	case DEFAULT:
	    //?
	    break;
	case DEF_SRC:
	    srcNode = this.getAttribute("id");
	    break;
	case DEF_DEST:
	    destNode = this.getAttribute("id"); 
	    break;
	}
    }
}


var initialize = function(){
    srcNode = null;
    destNode = null;
    state = DEFAULT;
}

initialize();

var setModeFunc = function(newMode){
    return function(){
	state = newMode;
    };
}

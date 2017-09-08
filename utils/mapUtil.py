from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from dbSetup import *
import users

Session = sessionmaker()
engine = create_engine('postgresql+psycopg2://postgres:picfic@localhost/trailblazer')

Session.configure(bind=engine)

# makeNewMap() - creates an empty map
# pre  : String mapName - name of map
#      : int uID     - userID of creator
# post : int mapID - ID of created map
#        Map created in database and associated ownership details updated done       
def makeNewMap(mapName, uID):
    session = Session()
    newMap = Map(mapName, uID)
    session.add(newMap)
    session.commit()
    newMapID = newMap.mapID
    session.close()
    return newMapID

# ownsMap() - boolean test for ownership
# pre  : int mID - mapID
#      : int uID - userID
# post : boolean of ownership
def ownsMap(uID, mID):
    session = Session()
    print mID
    print uID
    curMap = session.query(Map).filter(Map.mapID == mID).one()
    curUser = session.query(User).filter(User.userID == uID).one()
    ret = curMap.creator == curUser
    session.close()
    return ret

# getMapData(mID)
# pre   : int mID - mapID
# post  : map dictionary
#       : {metadata key/values, nodes: {}, edges: {}}
def getMapData(mID):
    session = Session()
    curMap = session.query(Map).filter(Map.mapID == mID).one()
    ret = curMap.asPreview()
    ret["pages"] = []
    ret["guidCtr"] = curMap.guidCtr
    pageList = curMap.pages
    for page in pageList:
        ret["pages"].append(page.asDict())
        print page.asDict()
    session.close()
    return ret

#nested heirarchical structure -
# "u" before ID means UPDATE
# "n" before ID means NEW
# store - updates mapData
def store(mapData):
    session = Session()
    print mapData
    print mapData.keys()
    mID = int(mapData["mapID"])
    curMap = session.query(Map).filter(Map.mapID == mID).one()
    curMap.updateTimestamp()
    curMap.guidCtr = int(mapData["guidCtr"])
    curMap.title = mapData["title"]
    pagesToProcess = mapData["pages"]
    pagesToDelete = mapData["deletePages"]
    for pageID in pagesToDelete:
        curPage = session.query(Page).filter(Page.pageID == pageID).one()
        session.delete(curPage)
        session.commit()
        
    for page in pagesToProcess:
        if page["status"] == "u":
            pageID = int(page["id"])
            curPage = session.query(Page).filter(Page.pageID == pageID).one()
            curPage.update(page)
            transferDict = {}
            for node in page["nodes"]:
                if node["status"] == "u":
                    nodeID = int(node["id"])
                    curNode = session.query(Node).filter(Node.nodeID == nodeID).one()
                    curNode.update(node["data"])
                    session.add(curNode)
                elif node["status"] == "n":
                    newNode = Node(node["data"], pageID, mID)
                    session.add(newNode)
                    session.flush()
                    transferDict[str(node["id"])] = newNode.nodeID
                elif node["status"] == "d":
                    curNode = session.query(Node).filter(Node.nodeID == node["id"]).one()
                    session.delete(curNode)                    
                    session.flush()
                else:
                    print "Store node error"
                
            for edge in page["edges"]: #need to be able to correctly correspond nodeIDs from client to db
                if edge["status"] == "u":
                    edgeID = int(edge["id"])
                    curEdge = session.query(Edge).filter(Edge.edgeID == edgeID).one()
                    curEdge.update(edge["data"])
                    session.add(curEdge)
                elif edge["status"] == "n":
                    n1ID = 0
                    n2ID = 0
                    if str(edge["node1ID"]) in transferDict.keys(): 
                        n1ID = transferDict[str(edge["node1ID"])]
                    else:
                        n1ID = edge["node1ID"]
                    if str(edge["node2ID"]) in transferDict.keys():
                        n2ID = transferDict[str(edge["node2ID"])]
                    else:
                        n2ID = edge["node2ID"]
                    n1 = session.query(Node).filter(Node.nodeID == n1ID).one()
                    n2 = session.query(Node).filter(Node.nodeID == n2ID).one()
                    newEdge = Edge(n1, n2, edge["data"], pageID, mID)
                    session.add(newEdge)
                    session.flush()
                elif edge["status"] == "d":
                    continue
                    """ 
                    if (edge["node1ID"] < edge["node2ID"]):
                        curEdge = session.query(Edge).filter(Edge.lowerID == edge["node1ID"]).filter(Edge.higherID == edge["node2ID"]).one()
                    else:
                        curEdge = session.query(Edge).filter(Edge.higherID == edge["node2ID"]).filter(Edge.lowerID == edge["node1ID"]).one()

                    session.delete(curEdge)                    
                    session.flush()
                    """
                else:
                    print "Store edge error"
            session.add(curPage)
            session.flush()
        elif page["status"] == "n": #if the page is new, everything inside is new
            newPage = Page(mID, page)
            session.add(newPage)
            session.flush()            
            transferDict = {}
            for node in page["nodes"]:
                newNode = Node(node["data"], newPage.pageID, mID)
                session.add(newNode)
                session.flush()
                transferDict[str(node["id"])] = newNode.nodeID
            for edge in page["edges"]:
                n1ID = 0
                n2ID = 0
                if str(edge["node1ID"]) in transferDict.keys(): 
                    n1ID = transferDict[str(edge["node1ID"])]
                else:
                    n1ID = edge["node1ID"]
                if str(edge["node2ID"]) in transferDict.keys():
                    n2ID = transferDict[str(edge["node2ID"])]
                else:
                    n2ID = edge["node2ID"]
                n1 = session.query(Node).filter(Node.nodeID == n1ID).one()
                n2 = session.query(Node).filter(Node.nodeID == n2ID).one()
                newEdge = Edge(n1, n2, edge["data"], newPage.pageID, mID)
                session.add(newEdge)
                session.flush()
            session.add(newPage)
            session.flush()                        
        elif page["status"] == "d":
            curPage = session.query(Page).filter(Page.pageID == pageID).one()
            session.delete(curPage)
            session.flush()
        else:
            print "Page storing error"
            print page["id"]
            print "end debug"        
    #End page processing
    session.add(curMap)
    session.commit()
    session.close()
    return True

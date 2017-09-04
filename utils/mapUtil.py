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
    pageList = curMap.pages
    for page in pageList:
        ret.append(page.asDict())
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

    pagesToProcess = mapData["pages"]
    for page in pagesToProcess:
        if page["id"][0] == "u":
            pageID = int(page["id"][1:])
            curPage = session.query(Page).filter(Page.pageID == pageID).one()
            curPage.update(page["data"])
            transferDict = {}
            for node in page["nodes"]:
                if node["id"][0] == "u":
                    nodeID = int(node["id"][1:])
                    curNode = session.query(Node).filter(Node.nodeID == nodeID).one()
                    curNode.update(node["data"])
                    session.add(curNode)
                elif node["id"][0] == "n":
                    newNode = Node(node["data"], curPage)
                    session.add(newNode)
                    session.flush()
                    transferDict[node["id"]] = newNode.nodeID
                else:
                    print "Store node error"
                
            for edge in page["edges"]: #need to be able to correctly correspond nodeIDs from client to db
                if edge["id"][0] == "u":
                    edgeID = int(edge["id"][1:])
                    curEdge = session.query(Edge).filter(Edge.edgeID == edgeID).one()
                    curEdge.update(edge["data"])
                    session.add(curEdge)
                elif edge["id"][0] == "n":
                    n1ID = transferDict[edge["node1ID"]]
                    n2ID = transferDict[edge["node2ID"]]
                    n1 = session.query(Node).filter(Node.nodeID == n1ID).one()
                    n2 = session.query(Node).filter(Node.nodeID == n2ID).one()
                    newEdge = Edge(n1, n2, edge["data"], curPage)
                    session.add(newEdge)
                    session.flush()
                else:
                    print "Store edge error"
                    
        elif page["id"][0] == "n": #if the page is new, everything inside is new
            newPage = Page(mID, page["pageNum"])
            session.add(newPage)
            session.flush()            
            transferDict = {}
            for node in page["nodes"]:
                newNode = Node(node["data"], newPage)
                session.add(newNode)
                session.flush()
                transferDict[node["id"]] = newNode.nodeID
            for edge in page["edges"]:            
                n1ID = transferDict[edge["node1ID"]]
                n2ID = transferDict[edge["node2ID"]]
                n1 = session.query(Node).filter(Node.nodeID == n1ID).one()
                n2 = session.query(Node).filter(Node.nodeID == n2ID).one()
                newEdge = Edge(n1, n2, edge["data"], newPage)
                session.add(newEdge)
                session.flush()
        else:
            print "Page storing error"
            print page["id"]
            print "end debug"        
    #End page processing        
    session.commit()
    session.close()
    return True

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
    ret["nodes"] = curMap.nodes
    ret["edges"] = curMap.edges
    session.close()
    return ret

# userFind(uID) - returns maps created by given userID
def userFind(uID):
    session = Session()
    curMaps = session.query(Map).filter(Map.creatorID == uID).all()
    ret = [curMap.asPreview() for curMap in curMaps]
    session.close()
    return ret

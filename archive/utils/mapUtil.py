#import modules needed

import datetime
import time
import userDb

#initialize mongo database
import pymongo 
from pymongo import MongoClient

server = MongoClient( "127.0.0.1" )
#server = MongoClient( "149.89.150.100" )

db = server.dycw

cM = db.maps #collection of maps

#Map database functions

"""
exists( mapID )
Given:
  mapID - unique id given to each map
Returns:
  boolean of whether a mapID is associated with a created map
"""
def exists( mapID ):
    finder = cM.find_one(
        { "mapID" : int(mapID) }
        )
    return finder is not None

"""
ownsMap( uID, mapID )
Given:
  uID - userID of a user
  mapID - unique id given to each map
Returns:
  boolean of if a given user is the owner of a given map
"""
def ownsMap( uID, mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) }
            )
        return finder["uID"] == uID 
    else:
        print str(uID) + " does not own " + str(mapID)
        return False

"""
isPublished( mapID )
Given:
  mapID - unique id given to each map
Returns:
  boolean of if a given map has been published already
"""
def isPublished( mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) }
            )
        return finder["published"] == 1
    else:
        return False

def getMapName( mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) }
            )
        return finder["mapName"]
    return None 

"""
getMapData( mapID )
Given:
  mapID - unique id given to each map
Returns:
  <data> form of the data held in a given map
"""    
def getMapData( mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) },
            { "_id" : 0 }
            )
        return finder
    return None

def getTimeCreated( mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) }
            )
        return finder["timeCreated"]
    return None

def getTimeUpdated( mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) }
            )
        return finder["timeUpdated"]
    return None 

def getImages( mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) }
            )
        return finder["outline"]
    return None

"""
makeNewMap( mapName, uID )
Given:
  mapName - True
"""
def makeNewMap( mapName, userID ) :
    try:
        doc = {}
        doc["mapID"] = counter_cM()
        doc["mapName"] = mapName
        doc["uID"] = int(userID)
        doc["published"] = 0
        doc["timeCreated"] = datetime.date.today().ctime()
        doc["tCreated"] = time.time()
        doc["timeUpdated"] = datetime.date.today().ctime()
        doc["tUpdated"] = time.time()
        doc["outline"] = []
        doc["data"] = None

        cM.insert_one( doc )
        print "in fact, " + str(userID) + " owns " + str(doc["mapID"])
        return doc["mapID"]
    except:
        return 0

def mapPull( mapID, userID ):
    finder = cM.find_one(
        { "mapID" : int(mapID) }
        )
    meta = {}    
    if visible( userID, mapID ):
        meta["mapID"] = finder["mapID"] #check if fxn actually works
        meta["mapName"] = finder["mapName"]
        meta["uID"] = finder["uID"]
        meta["published"] = finder["published"]
        meta["timeCreated"] = finder["timeCreated"]
        meta["timeUpdated"] = finder["timeUpdated"]
        meta["data"] = finder["data"]
        print "this is meta[data]"
        print meta["data"]
    return meta

def userFind( uID ):
    ret = []
    finder = cM.find(
        { "uID" : int(uID) }
        ).sort( "tUpdated", pymongo.DESCENDING )
    for item in finder:
        if visible( uID, item["mapID"]):
            meta = {}
            meta["mapID"] = item["mapID"]
            meta["mapName"] = item["mapName"]
            meta["uID"] = item["uID"] #check if fxn actually works
            meta["user"] = userDb.getUsername(item["uID"])
            meta["published"] = item["published"]
            meta["timeCreated"] = item["timeCreated"]
            meta["timeUpdated"] = item["timeUpdated"]
            meta["data"] = item["data"]
            ret.append(meta)
    print ret
    return ret

def getPage( PageNum, searchQuery, userID ):
    ret = []
    if searchQuery == "":
        finder = cM.find().sort( "tUpdated", pymongo.DESCENDING )
        start = (int(PageNum) - 1) * 12
        end = start + 12
        ctr = 0
        for item in finder:
            if ctr >= start:
                if ctr < end:
                    if visible( userID, item["mapID"]):
                        meta = {}
                        meta["mapID"] = item["mapID"]
                        meta["mapName"] = item["mapName"]
                        meta["uID"] = item["uID"] #check if fxn actually works
                        meta["user"] = userDb.getUsername(item["uID"])
                        meta["published"] = item["published"]
                        meta["timeCreated"] = item["timeCreated"]
                        meta["timeUpdated"] = item["timeUpdated"]
                        meta["data"] = item["data"]
                        ret.append(meta)
                        ctr += 1
                else:
                    break
            else:
                ctr += 1
        return ret
    else:
        finder = cM.find(
            { "mapName" : searchQuery }
            ).sort( "tUpdated", pymongo.DESCENDING )
        for item in finder:
            start = (PageNum - 1) * 12
            end = start + 12
            ctr = 0
            if ctr >= start:
                if ctr < end:
                    if visible( userID, item["mapID"]):
                        meta = {}
                        meta["mapID"] = item["mapID"]
                        meta["mapName"] = item["mapName"]
                        meta["uID"] = item["uID"] #check if fxn actually works
                        meta["user"] = userDb.getUsername(item["uID"])
                        meta["published"] = item["published"]
                        meta["timeCreated"] = item["timeCreated"]
                        meta["timeUpdated"] = item["timeUpdated"]
                        meta["data"] = item["data"]
                        ret.append(meta)
                        ctr += 1
                else:
                    break
            else:
                ctr += 1
            return ret
        

def addImage( url, mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) }
        )  
        print finder["outline"]
        if finder["outline"] == []:
            cM.update_one(
                {"mapID" : int(mapID)},
                {"$set" :
                    {   
                        "outline" : [url],
                        "timeUpdated" :  datetime.date.today().ctime(),
                        "tUpdated" : time.time()
                        }
                }
                )
            return True
        else:
            cM.update_one(
                {"mapID" : int(mapID)},
                {"$set" :
                    {   
                        "outline" : finder["outline"] + [url],
                        "timeUpdated" :  datetime.date.today().ctime(),
                        "tUpdated" : time.time()
                        }
                }
                )
            return True
    return False

    
def store( mapID, mapData ):
    print "mapData"
    print mapData
    if exists( mapID ):
        cM.update_one(
            {"mapID" : int(mapID)},
            {"$set" :
                {
                    "data" : mapData,
                    "timeUpdated" :  datetime.date.today().ctime(),
                    "tUpdated" : time.time()
                    
                    }
            }
            )
        return True
    return False
    
def publish( mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) }
        )
        cM.update_one(
            {"mapID" : int(mapID)},
            {"$set" :
                {
                    "published" : 1,
                    "timeUpdated" :  datetime.date.today().ctime(),
                    "tUpdated" : time.time()
                    }
            }
            )
        return True
    return False
    
def deleteMap( mapID ):
    if exists( mapID ):
        cM.delete_one(
            { "mapID" : int(mapID) }
            )
        return True
    return False
    
def visible( userID, mapID ):
    if exists( mapID ):
        finder = cM.find_one(
            { "mapID" : int(mapID) }
        )
        #print "THIS IS FINDER"
        #print finder["uID"]
        #print userID
        owners = False
        if userID != None:
            owners = finder["uID"] == int(userID)
        return finder["published"] == 1 or owners
            
#helper functions

def counter_cM():
    return cM.count()

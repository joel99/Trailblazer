from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from dbSetup import *
import users, mapUtil

Session = sessionmaker()
engine = create_engine('postgresql+psycopg2://postgres:picfic@localhost/trailblazer')

Session.configure(bind=engine)

def getPage( userID, PageNum=1, searchQuery=""):
    session = Session()
    curMaps = session.query(Map).all()
    ret = [curMap.asPreview() for curMap in curMaps]
    session.close()
    return ret

#Map database functions for the gallery

#Data returned should be a list of json objects with each entry being map link data
    #ie. [name:a, author:b, date_updated:c, thumbnail: d (OPTIONAL)]

# userFind(uID) - returns maps created by given userID
def userFind(uID):
    session = Session()
    curMaps = session.query(Map).filter(Map.creatorID == uID).all()
    ret = [curMap.asPreview() for curMap in curMaps]
    session.close()
    return ret


#by date updated OR popularity (date updated for now)
#10 entries per page
#def getPage(pageNum):
    # return None


#def search(query):
#    return None

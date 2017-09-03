import mapUtil

#To do: search results should be put into pages as well

#Gallery map data retrieval functions

def getPage( userID, PageNum=1, searchQuery=""):
    return mapUtil.getPage( PageNum, searchQuery, userID )

#Map database functions for the gallery

#Data returned should be a list of json objects with each entry being map link data
    #ie. [name:a, author:b, date_updated:c, thumbnail: d (OPTIONAL)]

def userPull( userID ):
    return mapUtil.userFind( userID )
    
#by date updated OR popularity (date updated for now)
#10 entries per page
#def getPage(pageNum):
    # return None


#def search(query):
#    return None

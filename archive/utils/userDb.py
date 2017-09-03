#initialize mongo database

from pymongo import MongoClient

server = MongoClient( "127.0.0.1" )
#server = MongoClient( "149.89.150.100" )

db = server.dycw

cU = db.users #collection of users


#User data functions

"""
isValidAccountInfo( uN, hP )
Given:
    uN - username
    hP - hashed pass 
Returns:
    boolean of validity of account info (for login)
"""
def isValidAccountInfo( uN, hP ):
    if not doesUserExist( uN ):
        return False
    finder = cU.find_one(
        { "username" : uN }
        )
    return finder["password"] == hP

"""
getUserID( uN )
Given:
    uN - username 
Returns:
    int of userID for given username
"""
def getUserID( uN ):
    finder = cU.find_one(
        { "username" : uN }
        )
    return finder["userID"]

"""
getUsername( uID )
Given:
    uID - userID 
Returns:
    str of username for given userID
"""
def getUsername( uID ):
    finder = cU.find_one(
        { "userID" : uID }
        )
    return finder["username"]

"""
registerAccountInfo( uN )
Given:
    uN - username
    hP - hashed pass
Returns:
    boolean of whether account was successfully created
"""
def registerAccountInfo( uN, hP ):
    try:
        doc = {}
        doc["username"] = uN
        doc["userID"] = counter_cU()
        doc["password"] = hP
        doc["starredIDs"] = []
        doc["ownedIDs"] = []

        cU.insert_one( doc )
        return True
    except:
        return False

"""
doesUserExist( uN )
Given:
    uN - username 
Returns:
    boolean of whether a username is already taken
"""
def doesUserExist( uN ):
    finder = cU.find_one(
        { "username" : uN }
        )
    return finder is not None
        
"""
getPass( uID )
Given:
    uID - userID 
Returns:
    str of password for a given userID
"""
def getPass( uID ):
    finder = cU.find_one(
        { "userID" : uID }
        )
    return finder["password"]

"""
changePass( uID, newPass )
Given:
    uID - userID
    newPass - new pass
Returns:
    boolean of whether a password was successfully changed
"""
def changePass( uID, newPass ):
    try:
        cU.update(
            { "userID" : uID },
            { "$set":
                { "password": newPass }
            }
        )
        return True
    except:
        return False
#helper functions

def counter_cU():
    return cU.count()

#testing functions
'''
print doesUserExist("sham") #false
print counter_cU() #0
print registerAccountInfo("sham", "shammy") #true
print doesUserExist("sham") #true
print getUserID("sham") #0
print counter_cU() #1
print getUsername(0) #sham
print getPass(0) #shammy
print isValidAccountInfo("sham", "shammy") #true
print changePass(0, "shamz") #true
print isValidAccountInfo("sham", "shammy") #false
print getPass(0) #shamz
print isValidAccountInfo("sham", "shamz") #true

print registerAccountInfo("richie", "wangs") # true
print doesUserExist("richie") #true
print isValidAccountInfo("richie", "wangs") #true
print counter_cU() #2
print getUserID("richie") #1
'''

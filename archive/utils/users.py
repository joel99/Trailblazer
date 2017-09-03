import hashlib
import userDb

#any potential security code also goes in here

def isValidAccountInfo( uN, pwd ):
    return userDb.isValidAccountInfo( uN, hasher(pwd) )

def canRegister( uN ):
    return not userDb.doesUserExist( uN )

def registerAccountInfo( uN, pwd ):
    return userDb.registerAccountInfo( uN, hasher(pwd) )

def getUserID( uN ):
    return userDb.getUserID( uN )

def getUsername( uID ):
    return userDb.getUserName( uID )

def changePass( uID, old, new1, new2 ):
    if isValidAccountInfo( getUsername( uID ), old  ) and new1 == new2:
        changePass( uID, hasher( new1 ))
    return True

def hasher(unhashed):
    return hashlib.md5(unhashed).hexdigest()

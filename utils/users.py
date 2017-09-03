from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from dbSetup import *

Session = sessionmaker()
engine = create_engine('postgresql+psycopg2://postgres:picfic@localhost/trailblazer')

Session.configure(bind=engine)

# addUser (..) - creates and adds user 
# pre  : String uN     - username
#      : String pwd    - hashed pwd
# post : int uID - user ID of created user
#        User and UserProfile are created in database 
def addUser( uN, pwd ):
    session = Session()
    newUser = User(uN, pwd)
    session.add(newUser)
    session.flush()
    uID = newUser.userID
    newUserProfile = UserProfile(uID)
    session.add(newUserProfile)
    session.commit()
    session.close()
    return uID

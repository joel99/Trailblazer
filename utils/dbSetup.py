from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()
from sqlalchemy import Column, Integer, String, Date, Float, DateTime, ForeignKey, Table, CheckConstraint, UniqueConstraint

from sqlalchemy.orm import sessionmaker, relationship
#from sqlalchemy.sql.functions import GenericFunction
import datetime
from sqlalchemy import create_engine

Session = sessionmaker()
engine = create_engine('postgresql+psycopg2://postgres:picfic@localhost/trailblazer')

# Note: using relational bc graph structures should be small
# Also just a proof of concept

"""
TABLES:
-User
-UserProfile
-Map
-Page
-Node
-Edge

ASSOCIATIONS

-UserMap : Users using map and map's users (Once published)
-UserEditor : Users editing map and map's editors (also includes owners)

Other relations:
-Node/Edge : two to many
"""

"""
usergroup key:
1 - unactivated
2 - activated
3 - admin/editor

Bcrypt used for hash
"""
class User(Base):
    __tablename__ = "Users"

    userID = Column(Integer, primary_key = True)
    username = Column(String(32), unique = True)
    #tag = Column(String, unique = True) #is that a thing?
    email = Column(String, unique = True)
    passData = Column(String)
    usergroup = Column(Integer, CheckConstraint("usergroup >= 0"))
    authTokens = Column(String)

    #Relationships
    userProfile = relationship("UserProfile", back_populates="user", cascade="all, delete, delete-orphan") #one to one
    maps = relationship("Map", back_populates="creator")
    
    def __repr__(self):
        return "<User(name='%s', id='%d')>" % (
            self.username, self.userID)

    def __init__(self, username, password):
        self.usergroup = 1
        self.username = username
        self.passData = password
    """    
    def __init__(self, username, password, authtokens, email):
        self.usergroup = 1
        self.username = username
        self.passData = password
        self.authtokens = authtokens
        self.email = email
    """
    def activate(self):
        self.usergroup = 2

    def promote(self):
        self.usergroup = 3

    def adminDict(self):
        return {"userID" : self.userID,
                "username" : self.username,
                "email" : self.email,
                "usergroup" : self.usergroup            
        }
        
class UserProfile(Base):
    __tablename__ = "UserProfiles"

    userID = Column(Integer, ForeignKey("Users.userID"), primary_key = True)
    firstName = Column(String(20))
    lastName = Column(String(20))
    picUrl = Column(String(250))
    joinDate = Column(Date, default=datetime.datetime.now())
    
    #Relationships
    user = relationship("User", back_populates="userProfile", uselist = False) #one to one
    
    def __repr__(self):
        return "<UserProfile(id='%d')>" % (
            self.userID)

    def __init__(self, uID):
        self.userID = uID
        self.picUrl = "defaultProfilePic.jpg"
        
"""        
    def __init__(self, uID, fN, lN):
        self.userID = uID
        self.firstName = fN
        self.lastName = lN
        self.picUrl = "defaultProfilePic.jpg"
"""

class Map(Base):
    __tablename__ = "Maps"

    mapID = Column(Integer, primary_key = True)
    creatorID = Column(Integer, ForeignKey("Users.userID")) 
    #0 for unpublished, 1 for published
    published = Column(Integer)
    title = Column(String(50))
    updateDate = Column(Date, default=datetime.datetime.now())
    guidCtr = Column(Integer)
    
    #Relationships
    nodes = relationship("Node", back_populates="nodeMap") #one to many
    edges = relationship("Edge", back_populates="edgeMap") #one to many
    creator = relationship("User", back_populates="maps") #many to one
    pages = relationship("Page", cascade="all, delete, delete-orphan", back_populates="pageMap", order_by="Page.pageNum") #one to many
    
    #followers, eventually
    def __init__(self, name, creatorID):
        self.title = name
        self.creatorID = creatorID
        self.published = 1 #to change, currently published as default
    
    def updateTimestamp(self):
        updateDate = datetime.datetime.now()

    def asPreview(self):
        return {
            "title" : self.title,
            "updateDate" : self.updateDate,
            "creatorName" : self.creator.username,
            "mapID" : self.mapID
        }

#mainly for storing images
class Page(Base):
    __tablename__ = "Pages"

    pageID = Column(Integer, primary_key = True)
    mapID = Column(Integer, ForeignKey("Maps.mapID"))
    pageNum = Column(Integer)
    backgroundImage = Column(String)
    pageName = Column(String)
    #Relationships
    pageMap = relationship("Map", back_populates="pages") #many to one
    nodes = relationship("Node", cascade="all, delete, delete-orphan", back_populates="nodePage") #one to many
    edges = relationship("Edge", cascade="all, delete, delete-orphan", back_populates="edgePage") #one to many
    
    def __init__(self, mapID, d): #filtering for new pages are already done
        self.mapID = mapID
        self.backgroundImage = "defaultBackgroundImage.png"
        self.update(d)
        
    def update(self, d):
        self.pageNum = int(d["pageNum"])
        self.backgroundImage = d["backgroundImage"]
        self.pageName = d["pageName"]
        
    def asDict(self):
        ret = {}
        ret["id"] = self.pageID
        ret["pageNum"] = self.pageNum
        ret["backgroundImage"] = self.backgroundImage
        ret["pageName"] = self.pageName
        ret["nodes"] = []
        for node in self.nodes:
            ret["nodes"].append(node.asDict())
        ret["edges"] = []
        for edge in self.edges:
            ret["edges"].append(edge.asDict())
        return ret
    
class Node(Base):
    __tablename__ = "Nodes"

    nodeID = Column(Integer, primary_key = True)
    mapID = Column(Integer, ForeignKey("Maps.mapID"))

    nodeType = Column(Integer)
    x = Column(Float)
    y = Column(Float)
    settings = Column(String)
    desc = Column(String)
    name = Column(String)
    pageID = Column(Integer, ForeignKey("Pages.pageID"))
    
    #Pretend to be an undirected
    #Relationships
    nodeMap = relationship("Map", back_populates="nodes") #many to one
    nodePage = relationship("Page", back_populates="nodes") #many to one
    lowerEdges = relationship("Edge", back_populates="lowerNode", cascade="all, delete, delete-orphan", primaryjoin="Node.nodeID==Edge.lowerID")
    higherEdges = relationship("Edge", back_populates="higherNode", cascade="all, delete, delete-orphan", primaryjoin="Node.nodeID==Edge.higherID")
    
    def add_adjacencies(self, *nodes): #pointer to node list
        for node in nodes:
            Edge(self, node) #creates an edge - we don't worry about duplicates because db takes care of it
        return self

    def add_adjacent(self, node):
        if node not in self.adjacencies():
            self.add_adjacencies(node)

    def adjacencies(self):
        allNodes = [x.lowerNode for x in self.higherEdges]
        allNodes.extend([x.higherNode for x in self.lowerEdges])
        return allNodes

    def __init__(self, d, pageID, mapID, nodeType):
        self.update(d)
        self.pageID = pageID
        self.mapID = mapID
        self.nodeType = nodeType

    def update(self, d):
        self.x = int(d["x"])
        self.y = int(d["y"])
        self.settings = d["settings"]
        self.desc = d["desc"]
        self.name = d["name"]

    def asDict(self):
        ret = {
            "id" : self.nodeID,
            "nodeType" : self.nodeType,
            "data": {
                "x" : self.x,
                "y" : self.y,
                "settings" : self.settings,
                "desc" : self.desc,
                "name" : self.name
            }            
        }
        return ret
        
class Edge(Base):
    __tablename__ = "Edges"
    
    #edgeID = Column(Integer, primary_key = True) #For now, no multiple edges allowed
    mapID = Column(Integer, ForeignKey("Maps.mapID"))

    settings = Column(String)
    weight = Column(Integer)
    pageID = Column(Integer, ForeignKey("Pages.pageID"))
    
    lowerID = Column(Integer,
                      ForeignKey('Nodes.nodeID'),
                      primary_key=True)
    
    higherID = Column(Integer,
                       ForeignKey('Nodes.nodeID'),
                       primary_key=True)
    
    #Relationships
    edgeMap = relationship("Map", back_populates="edges") #many to one
    edgePage = relationship("Page", back_populates="edges") #many to one
    
    lowerNode = relationship(Node,
                             primaryjoin=lowerID==Node.nodeID,
                             back_populates='lowerEdges')

    higherNode = relationship(Node,
                              primaryjoin=higherID==Node.nodeID,
                              back_populates='higherEdges')
    
    def __init__(self, n1, n2, d, pageID, mapID): #prevent duplicates 
        if n1.nodeID < n2.nodeID:
            self.lowerNode = n1
            self.higherNode = n2
        else:
            self.lowerNode = n2
            self.higherNode = n1
        self.update(d)
        self.pageID = pageID
        self.mapID = mapID

    def update(self, d):
        self.settings = d["settings"]
        self.weight = int(d["weight"])

    def markCnxn(self):
        self.settings = "cnxn"

    def isCnxn(self):
        return self.settings == "cnxn"
        
    def asDict(self):
        ret = {
            "data" : {
                "settings" : self.settings,
                "weight" : self.weight
            },
            "node1ID" : self.lowerID,
            "node2ID" : self.higherID
        }
        return ret
        
# END CLASS DEFINITIONS ======================================


def makeTables():
    Base.metadata.create_all(engine) # Creates tables

makeTables()

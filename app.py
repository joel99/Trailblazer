from flask import Flask, render_template, request, session, url_for, redirect, send_from_directory, abort, flash
from utils import users, mapUtil, gallery
import json, os
from os.path import join, dirname, realpath
from werkzeug.utils import secure_filename
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.secret_key = "secrets"
bcrypt = Bcrypt(app)


# Launchpad + Static pages ======================

@app.route("/")
def root():
    return render_template( "launchpad.html", isLoggedIn = isLoggedIn() )


@app.route("/help/")
def help():
    return render_template( "help.html", isLoggedIn = isLoggedIn() )


# Gallery pages =================================
# Map previews retrieved via ajax

@app.route("/gallery/")
def galleryRoute():
    return redirect( "/gallery/browse/page/1" )


@app.route("/gallery/browse/page/<pageNum>")
def galleryPage(pageNum):
    galData = gallery.getPage(getUserID(), pageNum) #<-- get back later
    return render_template( "gallery.html", isLoggedIn = isLoggedIn(), data = galData )


@app.route("/gallery/search/") 
def gallerySearch():
    if 'searchQ' in request.args:
        searchQuery = request.args['searchQ']
        galData = gallery.getPage( getUserID(), 1, searchQuery)
        return render_template( "gallery.html", isLoggedIn = isLoggedIn(), data = galData )



@app.route("/gallery/mymaps/")
def mymaps():
    if isLoggedIn():
        galData = gallery.userFind( getUserID() )
        print galData
        return render_template( "gallery.html", isLoggedIn = isLoggedIn(), data = galData )
    else: #put in an error page
        return redirect(url_for("root"))
        #return render_template()

# View map =====================================
@app.route("/map/<mapID>")
def mapView(mapID):
    data = mapUtil.getMapData(mapID)
    ownsMapBool = False
    if isLoggedIn():
        ownsMapBool = mapUtil.ownsMap(getUserID(), mapID)
    return render_template( "mapView.html", isLoggedIn = isLoggedIn() , mapData = data, ownsMap = ownsMapBool)

        
        
# Editing maps ==================================

@app.route("/map/<mapID>/edit")
def mapEdit(mapID):
    if not mapUtil.ownsMap(getUserID(), mapID):
        return redirect( url_for('root') )
    else:
        data = mapUtil.getMapData(mapID)
        return render_template( "mapEdit.html", isLoggedIn = isLoggedIn() , mapData = data)


@app.route("/create/", methods=["POST"])
def mapRedirect():
    mapName = request.form["mapName"]
    mapID = mapUtil.makeNewMap(mapName, getUserID()) #returns id
    return redirect("/map/" + str(mapID) + "/edit")#url_for(mapEdit(mapId))


@app.route("/delMap/")
def delMap():
    mapUtil.deleteMap(session["mID"]) #Bugged
    session.pop("mID")
    return redirect(url_for('editmaps'))


@app.route("/saveData/", methods=["POST"])
def mapSave():   
    mapData = request.form["mapData"]
    mapUtil.store( json.loads(mapData) )
    return json.dumps({"success": "true"})

 
@app.route("/loadData/", methods=["POST"])
def mapLoad():
    mapID = int(request.form["mapID"])
    mapData = mapUtil.getMapData(mapID)
    mapData["updateDate"] = str(mapData["updateDate"])
    return json.dumps(mapData)


# Registration/Login ================================
# Login Routes ======================================
@app.route("/login/", methods=["POST"])
def login():
    # request
    d = request.form

    uN = d["username"]
    pwd = d["password"]
    #auth
    msg = ""
    if bcrypt.check_password_hash(users.getHashed(uN), pwd) :
        session['uID'] = users.getUserID(uN)
        return redirect( url_for('root'))
    else:
        return flask.Response("fail")

@app.route("/logout/")
def logout():
    session.pop('uID')
    return redirect( url_for('root') )

@app.route("/register/", methods=["POST"])
def register():
    # request
    d = request.form
    print d
    uN = d["username"]
    pwd = d["pass"]
    hashedPwd = bcrypt.generate_password_hash(pwd)    
    session['uID'] = users.addUser(uN, hashedPwd)
    return redirect( url_for('root') )

# Image upload =======================================
UPLOAD_FOLDER = join(dirname(realpath(__file__)), "static/resources/bgImages")
ALLOWED_EXTENSIONS = set(['jpg', 'jpeg', 'png'])

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route("/map/upload/", methods=["POST"])
def upload():
    print request.form
    if "upload" not in request.files:
       print request.files
       print "nope"
       return redirect(request.url)
    f = request.files.get("upload")
    pID = request.form["pageID"]
    print request.files
    if f.filename == '':
        print "also nope"
        return redirect(url_for( "mapEdit", mapID = session["mID"]))
    print "got here"
    if f and allowed_file(f.filename):
        filename = secure_filename(f.filename)
	f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
	mapUtil.addImage(f.filename , pID)
	#store into js, and bring that to backend - via ajax?
	print "nice"
	#return os.path.abspath( f.filename )
	return redirect('/map/' + str(request.form["mapID"]) + "/edit")
    print "uhhhhhhhhhhh"
    print f.filename
    print allowed_file(f.filename)
    return redirect(request.url)


# Helpers ============================================
def isLoggedIn():
    return "uID" in session

def getUserID():
    if isLoggedIn():
        return session["uID"]
    else:
        return None

def allowed_file(filename):
    print filename
    return "." in filename and filename.rsplit( ".", 1 )[1].lower() in ALLOWED_EXTENSIONS

    
if __name__ == "__main__":
    app.debug = True
    app.run()


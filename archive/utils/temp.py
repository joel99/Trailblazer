from flask import Flask, render_template, request, url_for, redirect, flash
import urllib2, os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = "/static/"
ALLOWED_EXTENSIONS = set( ["png", "jpg", "jpeg"] )

temp = Flask(__name__)
temp.config = ["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@temp.route( "/upload/", methods=["POST"] )
def upload():
    if "upload" not in request.files:
        flash ( "wyd" )
        return render_template("temp.html") #fix this
    try:
        filename = uploadFile()
        return render_template("temp.html") #fix this
    except:
        flash ( "wyd" )
        return render_template("temp.html") #fix this
        
def uploadFile():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit a empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('uploaded_file',
                                    filename=filename))
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''

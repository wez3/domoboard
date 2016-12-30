#!/usr/bin/python
# Provides all security functionality

from flask import request, session, abort
import json, simplejson, hashlib, os, bleach

def sanitizeJSON(inputJSON):
    unsanitizedJSON = simplejson.loads(json.dumps(inputJSON))
    cleanedJSON = simplejson.encoder.JSONEncoderForHTML().encode(unsanitizedJSON)
    return cleanedJSON

def sanitizeString(inputString):
    cleanedString = bleach.clean(inputString)
    return cleanedString

def csrfProtect():
    if request.method == "POST":
        token = session.get('_csrf_token')
        if not token or token != request.form['_csrf_token']:
            abort(403)

def generateCsrfToken():
    if '_csrf_token' not in session:
        session['_csrf_token'] = randomTokenGenerator()
    return session['_csrf_token']

def randomTokenGenerator():
    return hashlib.sha1(os.urandom(128)).hexdigest()

def sanitizePathBasename(path):
    return os.path.basename(path)

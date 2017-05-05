#!/usr/bin/env python

from flask import Flask, g, redirect, url_for, render_template, abort, request, session
from flaskext.auth import Auth, AuthUser, login_required, logout
from collections import OrderedDict
import argparse, socket, re
import hashlib, configobj, json, sys, os
import modules.api as api
import modules.domoticz as domoticz
import modules.security as security
import modules.webconfig as webconfig

app = Flask(__name__)

@app.before_request
def init():
    if session:
        security.csrfProtect()
    config = api.getConfig()
    g.users = {}
    for k, v in config["general_settings"]["users"].iteritems():
        addUser = AuthUser(username=k)
        addUser.set_and_encrypt_password(v)
        g.users[k] = addUser
    if config["general_settings"]["domoboard"]["autologon"] == "True":
        addUser = AuthUser(username='auto')
        addUser.set_and_encrypt_password('auto')
        g.users['auto'] = addUser

@login_required()
def generatePage():
    requestedRoute = str(request.url_rule)[1:]
    if configValueExists(requestedRoute):
        blockValues = OrderedDict()
        blockArray = []
        configValues = OrderedDict()
        configValues["navbar"] = config["navbar"]["menu"]
        configValues["server_location"] = config["general_settings"]["server"].get("url")
        configValues["flask_server_location"] = config["general_settings"]["server"].get("flask_url")
        configValues["domoboard"] = config["general_settings"]["domoboard"]
        configValues["display_components"] = strToList(config[requestedRoute]["display_components"].get("components"))
        configValues["config"] = config
        for component in configValues["display_components"]:
                match = re.search("^(.+)\[(.+)\]$", component)
                if not match:
                    blockValues[component] = retrieveValue(requestedRoute, component)
                else:
                    blockValues[match.group(1)] = retrieveValue(requestedRoute, component)
                blockArray.append(blockValues)
                blockValues = {}
        return render_template('index.html',
                                configValues = configValues,
                                blockArray = blockArray,
                                _csrf_token = session['_csrf_token'],
                                version = webconfig.getVersion(),
                                branch = webconfig.getCurrentBranch(),
                                debug = app.debug)
    else:
        abort(404)

@app.route('/')
def index():
    return redirect('dashboard')

@login_required()
def retrieveValue(page, component):
    dict = OrderedDict()
    try:
        match = re.search("^(.+)\[(.+)\]$", component)
        if not match:
            for k, v in config[page][component].iteritems():
                l = [None]
                l.extend(strToList(v))
                dict[k] = l
        else:
            for sk, sv in config[page][match.group(1)][match.group(2)].iteritems():
                l = [match.group(2)]
                l.extend(strToList(sv))
                dict[sk] = l
    except:
        dict = {}
    return dict

def logout_view():
    user_data = logout()
    session.clear()
    if user_data is None:
        return render_template('logout.html', loggedout = "nobody")
    return render_template('logout.html', loggedout = '{0}'.format(user_data['username']))

@app.route('/login/', methods=['POST', 'GET'])
def login_form():
    if config["general_settings"]["domoboard"]["autologon"] == "True":
        if g.users['auto'].authenticate('auto'):
            security.generateCsrfToken()
            return redirect(url_for('dashboard'))
    else:
        if request.method == 'POST':
            username = request.form['username']
            if username in g.users:
                if g.users[username].authenticate(request.form['password']):
                    security.generateCsrfToken()
                    return redirect(url_for('dashboard'))
            return render_template('login.html', failed = "Login failed")
        return render_template('login.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

def strToList(str):
    if not isinstance(str, list):
        return [str]
    else:
        return str

def configValueExists(value):
    try:
        config[value]
        exists = True
    except:
        exists = False
    return exists

def validateConfigFormat(config):
    requiredSettings = {"general_settings/server": ["url", "flask_url", "user", "password", "secret_key"],
                        "general_settings/domoboard": ["time", "date", "autologon"],
                        "navbar/menu": [None] }
    for sect, fields in requiredSettings.iteritems():
        section = sect.split('/')
        for field in fields:
            try:
                value = config[section[0]][section[1]][field]
            except:
                if field is None:
                        if section[1] not in config[section[0]]:
                            sys.exit("Config section not set: [{}] with subsection [[{}]]".format(section[0], section[1]))
                else:
                    sys.exit("Config field {} not set: section [{}] with subsection [[{}]]".format(field, section[0], section[1]))

def appendDefaultPages(config):
    config['settings'] = {'display_components': {'components': 'settings'}}
    config['log'] =  {'display_components': {'components': 'serverlog'}}
    return config

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-c", "--config", dest="configfile",
                  help="Specify a config file", metavar="<CONFIG>")
    parser.add_argument("-d", "--debug", dest="debug", action="store_true",
                  help="Run in debug mode")
    args = parser.parse_args()
    if args.configfile:
       configfile = args.configfile
    else:
       sys.exit("Please specify a config file with the -c parameter.")
    if os.path.isfile(configfile):
        unsanitizedConfig = configobj.ConfigObj(configfile)
    else:
        sys.exit("Config file {} does not exist.".format(configfile))

    config = json.loads(security.sanitizeString(json.dumps(unsanitizedConfig)), object_pairs_hook=OrderedDict)
    watchfiles = [configfile]
    config = appendDefaultPages(config)
    api.setConfig(config, unsanitizedConfig)
    api.init()
    validateConfigFormat(config)
    domoticz.checkDomoticzStatus(config)
    server_location = config["general_settings"]["server"]["url"]
    flask_server_location = config["general_settings"]["server"]["flask_url"]
    auth = Auth(app, login_url_name='login_form')
    auth.user_timeout = 0

    app.secret_key = config["general_settings"]["server"]["secret_key"]
    app.add_url_rule('/', 'index', index)
    for k, v in config["navbar"]["menu"].iteritems():
        v = strToList(v)
        app.add_url_rule('/' + v[0].lower(), v[0].lower(), generatePage, methods=['GET'])
    app.add_url_rule('/settings', 'settings', generatePage, methods=['GET'])
    app.add_url_rule('/log', 'log', generatePage, methods=['GET'])
    app.add_url_rule('/logout/', 'logout', logout_view, methods=['GET'])
    app.add_url_rule('/api', 'api', api.gateway, methods=['POST'])
    try:
        app.run(host=flask_server_location.split(":")[0],port=int(flask_server_location.split(":")[1]), threaded=True, extra_files=watchfiles, debug=args.debug)
    except socket.error, exc:
        sys.exit("Error when starting the Flask server: {}".format(exc))

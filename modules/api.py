#!/usr/bin/python
# Provides all the API functionality callable through "/api"

from flask import request
from flaskext.auth import login_required
import git
import security
import requests, json, re
import os, sys, imp, shutil

apiDict = {}
indexes = {}

def init():
    global modules
    modules = loadPlugins()
    return 0

def addToApi(custom, module, function):
    apiDict[custom] = [module, function]

def setConfig(cfg, orig_cfg):
    global config
    global originalCfg
    config = cfg
    originalCfg = orig_cfg

def getConfig():
    global config
    return config

def loadPlugins():
    plugin = {}
    plugin_dir = os.getcwd() + '/plugins/'
    for i in os.listdir(plugin_dir):
        if not i == '__init__.py' and i.endswith('.py'):
            name =  i.replace('.py', '')
            try:
               plugin[name] = imp.load_source(name, plugin_dir + i)
               plugin[name].init()
            except ImportError as msg:
               sys.exit("Error occured during loading imports for the plugin {}: {}".format(name, msg))
    return plugin

@login_required()
def gateway():
    requestedUrl = request.url.split("/api")
    custom = request.args.get('custom', '')
    if custom == "bar_chart":
        idxs = request.args.get('idxs', '')
        idxArray = idxs.split(",")
        resultArray = []
        resultDict = {}
        for i in idxArray:
            qResults = queryDomoticz("?type=devices&rid=" + i)
            jsonObj = json.loads(qResults)
            resultDict["y"] = jsonObj["result"][0]["Name"]
            resultDict["a"] = jsonObj["result"][0]["Data"]
            resultArray.append(resultDict.copy())
        result = json.dumps(resultArray)
    elif custom == "donut_chart":
        idxs = request.args.get('idxs', '')
        idxArray = idxs.split(",")
        resultArray = []
        resultDict = {}
        for i in idxArray:
            qResults = queryDomoticz("?type=devices&rid=" + i)
            jsonObj = json.loads(qResults)
            resultDict["label"] = jsonObj["result"][0]["Name"]
            resultDict["value"] = re.findall("\d+\.?\d+", jsonObj["result"][0]["Data"])
            resultArray.append(resultDict.copy())
        result = json.dumps(resultArray)
    elif custom == "modify_config":
        idx = request.args.get('idx', '')
        page = request.args.get('page', '')
        component = request.args.get('component', '')
        description = request.args.get('description', '')
        extra = request.args.get('extra', '')
        writeToConfig(idx, page, component, description, extra)
    elif custom == 'indexPlugins':
        result = json.dumps(indexPlugins(request.args))
    elif custom == "performUpgrade":
        result = json.dumps(performUpgrade())
    elif custom in apiDict:
        module = apiDict.get(custom)[0]
        function = apiDict.get(custom)[1]
        call = getattr(modules[module], function)
        result = call(request.args)
    else:
        result = queryDomoticz(requestedUrl[1])
    try:
    	if not is_json(result):
           result = json.dumps(result)
        return security.sanitizeJSON(json.loads(result))
    except:
        return "No results returned"

def is_json(myjson):
    try:
        json_object = json.loads(str(myjson))
    except ValueError, e:
        return False
    return True

def queryDomoticz(url):
    try:
        r = requests.get('http://' + config["general_settings"]["server"]["url"] + '/json.htm' + url,
        auth=(config["general_settings"]["server"].get("user"), config["general_settings"]["server"].get("password")), timeout=5.00)
    except:
        return {}
    return r.text

def writeToConfig(idx, page, component, description, extra):
    section = dict(originalCfg[page][component])
    section[description] = idx
    originalCfg[page][component] = section
    originalCfg.write()

def checkDomoticzStatus(config):
    domoticzDevices = []
    domoticzScenes = []
    try:
        result = json.loads(queryDomoticz("?type=devices&filter=all"))
        resultScene = json.loads(queryDomoticz("?type=scenes&filter=all"))
    except:
        sys.exit("Domoticz is not reachable.")
    for device in result["result"]:
        domoticzDevices.append(device["idx"])
    if 'result' in resultScene:
        for device in resultScene["result"]:
            domoticzScenes.append(device["idx"])
    configuredDevicesInDomoticz(config, domoticzDevices, domoticzScenes)

def configuredDevicesInDomoticz(config, domoticzDevices, domoticzScenes):
    for k, v in config.iteritems():
        if isinstance(v, dict):
            configuredDevicesInDomoticz(v, domoticzDevices, domoticzScenes)
        else:
            if isinstance(v, int):
                if v not in domoticzDevices and v not in domoticzScenes:
                    sys.exit("Device and/or scene with IDX {} is not available in Domoticz".format(v))
            elif isinstance(v, list):
                if (v[0].isdigit()) and (v[0] not in domoticzDevices and v[0] not in domoticzScenes):
                    sys.exit("Device and/or scene with IDX {} is not available in Domoticz".format(v[0]))

def getPluginDict():
    global indexes
    return indexes

def setPluginDict(d):
    global indexes
    indexes = d

def getPluginVersion(loc):
    f = open(loc, 'r').read().split('\n')
    v = None
    for l in f:
        t = l.split('=')
        if t[0] == '@version':
            _tmp_v = t[1].split('.')
            c = 1
            _version = _tmp_v[0] + '.'
            while(c < len(_tmp_v)):
                _version += _tmp_v[c]
                c += 1
    return float(_version)

def getVersion():
    f = open('VERSION.md', 'r')
    version = f.read().rstrip()
    f.close()
    return version

def performUpgrade():
    git.cmd.Git('.').pull("https://github.com/wez3/domoboard.git")
    return "Upgrade completed."

def getCurrentBranch():
    repo = git.Repo('.')
    branch = repo.active_branch
    return branch.name

def indexPlugins(params={}):
    tmpFolder = 'static/tmp'
    indexFolderPath = 'static/tmp/pluginsIndex/'
    docsFolderPath = 'static/docs/'
    installedPlugins = []
    staticFolder = ['css/', 'images/', 'fonts/', 'js/']
    indexes = getPluginDict()
    pluginParts = ['templates/', 'plugins/']

    if 'action' in params:
        if not params['action'] == 'getPlugins':
            try:
                if not int(params['folid']) in indexes:
                    return "No valid plugin id specified."
            except:
                    return "Please specify integers only."

    if 'action' in params:
        if params['action'] == 'getPlugins':
            folders = filter(lambda x: os.path.isdir(os.path.join(indexFolderPath, x)),
                     os.listdir(indexFolderPath))
            for i in folders:
                i = security.sanitizePathBasename(i)
                if i != '.git':
                    fol = {}
                    fol['id'] = len(indexes)
                    fol['folder'] = i
                    fol['status'] = 'install'
                    for filename in os.listdir('templates/'):
                        installedPlugins.append(filename)

                    for filename in os.listdir(indexFolderPath + i + '/templates'):
                        if filename in installedPlugins:
                            installed_version = getPluginVersion(docsFolderPath + i + '_readme.md')
                            indexed_version = getPluginVersion(indexFolderPath + i + '/' + docsFolderPath + 'readme.md')
                            if indexed_version > installed_version:
                                fol['update'] = 'yes'
                            else:
                                fol['update'] = 'no'
                            fol['status'] = 'remove'
                    readme = open(indexFolderPath + i + '/' + docsFolderPath + 'readme.md', 'r').read().split('\n')
                    sumList = {}
                    for s in readme:
                        t = s.split('=')
                        if len(t) > 1:
                            fol[t[0].replace('@', '')] = t[1]
                    if not i in (f['folder'] for f in indexes.itervalues()):
                        indexes[len(indexes)] = fol
                    else:
                        for tmp in indexes.itervalues():
                            if i == tmp['folder']:
                                for k in fol:
                                    if k != 'id':
                                        indexes[tmp['id']][k] = fol[k]
            setPluginDict(indexes)
            return indexes
        elif params['action'] == 'installPlugin':
            if 'folid' in params:
                if indexes[int(params['folid'])]['status'] == 'install':
                    src_path = indexFolderPath + indexes[int(params['folid'])]['folder'] + '/'
                    for part in pluginParts:
                        for filename in os.listdir(src_path + part):
                            shutil.copy(src_path + part + filename, part + filename)
                    for f in staticFolder:
                        if os.path.exists(src_path + 'static/' + f):
                            for filename in os.listdir(src_path + '/static/' + f):
                                shutil.copy(src_path + 'static/' + f + filename, 'static/' + f + filename)
                    for filename in os.listdir(src_path + '/' + docsFolderPath):
                        shutil.copy(src_path + '/' + docsFolderPath + filename, docsFolderPath + indexes[int(params['folid'])]['folder'] + '_' + filename)
                    indexes[int(params['folid'])]['status'] = 'remove'
                    global modules
                    modules = loadPlugins()
                    return indexes[int(params['folid'])]['folder'] + ' installed.'
                else:
                    return "This plugin is already installed."
        elif params['action'] == 'removePlugin':
            if 'folid' in params:
                if indexes[int(params['folid'])]['status'] == 'remove':
                    src_path = indexFolderPath + indexes[int(params['folid'])]['folder'] + '/'
                    for part in pluginParts:
                        for filename in os.listdir(src_path + part):
                            os.remove(part + filename)
                    for f in staticFolder:
                        if os.path.exists(src_path + 'static/' + f):
                            for filename in os.listdir(src_path + 'static/' + f):
                                os.remove('static/' + f + filename)
                    for filename in os.listdir(src_path + '/' + docsFolderPath):
                        shutil.copy(src_path + '/' + docsFolderPath + filename, docsFolderPath + indexes[int(params['folid'])]['folder'] + '_' + filename)
                    indexes[int(params['folid'])]['status'] = 'install'
                    return indexes[int(params['folid'])]['folder'] + ' removed.'
                else:
                    return "This plugin was already removed."
        setPluginDict(indexes)
    else:
        if not os.path.exists(tmpFolder):
            os.makedirs(tmpFolder)
        if not os.path.exists(indexFolderPath):
            os.makedirs(indexFolderPath)

        if not os.path.isfile(indexFolderPath + 'README.md'):
                shutil.rmtree(indexFolderPath)
                try:
                    git.Repo.clone_from("https://github.com/wez3/domoboard-plugins.git", indexFolderPath)
                except:
                    print 'indexed'
        else:
            git.cmd.Git(indexFolderPath).pull("https://github.com/wez3/domoboard-plugins.git")
        folders = filter(lambda x: os.path.isdir(os.path.join(indexFolderPath, x)),
                         os.listdir(indexFolderPath))
        return indexPlugins({'action': 'getPlugins'})

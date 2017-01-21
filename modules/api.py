#!/usr/bin/python
# Provides all the API functionality callable through "/api"

from flask import request
from flaskext.auth import login_required
import json, os, sys
import security, charts, plugins, webconfig, domoticz

apiDict = {}
modules = {}

def init():
    global modules
    modules = plugins.loadPlugins()
    return

def addToApi(custom, module, function):
    apiDict[custom] = [module, function]

@login_required()
def gateway():
    requestedUrl = request.url.split("/api")
    custom = request.args.get('custom', '')
    if custom == "bar_chart":
        result = charts.barChart()
    elif custom == "donut_chart":
        result = charts.donutChart()
    elif custom == "modify_config":
        idx = request.args.get('idx', '')
        page = request.args.get('page', '')
        component = request.args.get('component', '')
        description = request.args.get('description', '')
        extra = request.args.get('extra', '')
        webconfig.writeToConfig(idx, page, component, description, extra)
    elif custom == 'indexPlugins':
        result = json.dumps(plugins.indexPlugins(request.args))
    elif custom == "performUpgrade":
        result = json.dumps(webconfig.performUpgrade())
    elif custom in apiDict:
        module = apiDict.get(custom)[0]
        function = apiDict.get(custom)[1]
        call = getattr(modules[module], function)
        result = call(request.args)
    else:
        result = domoticz.queryDomoticz(requestedUrl[1])
    try:
    	if not isJson(result):
           result = json.dumps(result)
        return security.sanitizeJSON(json.loads(result))
    except:
        return "No results returned"

def setConfig(cfg, orig_cfg):
    global config
    global originalCfg
    config = cfg
    originalCfg = orig_cfg

def setModules(modulesList):
    global modules
    modules = modulesList

def getConfig():
    return config

def getOriginalConfig():
    return originalCfg

def isJson(myjson):
    try:
        json_object = json.loads(str(myjson))
    except ValueError, e:
        return False
    return True

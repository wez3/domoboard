#!/usr/bin/python
# This file contains all Domoticz related Python functions

import requests, json, sys
import api

def queryDomoticz(url):
    config = api.getConfig()
    try:
        r = requests.get('http://' + config["general_settings"]["server"]["url"] + '/json.htm' + url,
        auth=(config["general_settings"]["server"].get("user"), config["general_settings"]["server"].get("password")), timeout=5.00)
    except:
        return {}
    return r.text

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

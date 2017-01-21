#!/usr/bin/python
# Provides all charts functionality

import json, re, domoticz
from flask import request

def barChart():
    idxs = request.args.get('idxs', '')
    idxArray = idxs.split(",")
    resultArray = []
    resultDict = {}
    for i in idxArray:
        qResults = domoticz.queryDomoticz("?type=devices&rid=" + i)
        jsonObj = json.loads(qResults)
        resultDict["y"] = jsonObj["result"][0]["Name"]
        resultDict["a"] = jsonObj["result"][0]["Data"]
        resultArray.append(resultDict.copy())
    result = json.dumps(resultArray)
    return result

def donutChart():
    idxs = request.args.get('idxs', '')
    idxArray = idxs.split(",")
    resultArray = []
    resultDict = {}
    for i in idxArray:
        qResults = domoticz.queryDomoticz("?type=devices&rid=" + i)
        jsonObj = json.loads(qResults)
        resultDict["label"] = jsonObj["result"][0]["Name"]
        resultDict["value"] = re.findall("\d+\.?\d+", jsonObj["result"][0]["Data"])
        resultArray.append(resultDict.copy())
    result = json.dumps(resultArray)
    return result

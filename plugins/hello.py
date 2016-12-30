#!/usr/bin/python

import modules.api as api

def init():
    api.addToApi("hello","hello", "getData")

def getData(params={}):
    return 'Hello World'

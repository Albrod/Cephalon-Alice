from urllib.request import urlopen
from bs4 import BeautifulSoup
import json
import re

categories = ["archwings", "archwingWeapons", "warframes", "weapons"]

for cat in categories:
    print ("Reviewing " + cat)
    path = '../src/data/'+ cat + '.json'
    with open(path) as data_file:
        data = json.load(data_file)

    for key in data:
        entry = data[key]
        if (len(entry["id"]) != 4):
            print ("    " + key + " has invalid ID")
        if ("source" not in entry):
            print ("    " + key + " has no source")

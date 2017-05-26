from urllib.request import urlopen
from bs4 import BeautifulSoup
import json
import re

categories = ["archwings", "archwingWeapons", "companions", "warframes", "weapons"]

for cat in categories:
    print ("Reviewing " + cat)
    path = '../src/data/'+ cat + '.json'
    with open(path) as data_file:
        data = json.load(data_file)

    for key in data:
        entry = data[key]
        print ("    Scraping " + key)
        # Gather information
        url = "http://warframe.wikia.com/wiki/" + key.replace(" ", "_")
        page = urlopen(url)
        soup = BeautifulSoup(page, "html.parser")

        # Gather source data
        res_table = soup.find("table", "foundrytable")
        if (res_table):
            # Lab item?
            lab = soup.find("a", string=re.compile(".*Lab$"))
            if (lab):
                print ("        Found a lab!")
                entry['source'] = lab.string
            #else:
                # Prime item?
                # To be implemented


    with open(path, 'w') as fp:
        json.dump(data, fp)

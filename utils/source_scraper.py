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
            dropData = {}
            lab = soup.find("a", string=re.compile(".*Lab$"))
            if (lab):
                print ("     Found a lab!")
                dropData["type"] = "Lab"
                dropData["Components"] = lab.string
                entry['source'] = dropData
            else:
                # Prime/Syndiate item?
                for child in res_table.descendants:
                    if (child.name == "table"):
                        # Get drops!

                        for ele in child.contents:
                            if (ele.name == "tr"):
                                # Get part name
                                res_part_name = ele.contents[1].contents[0]
                                if (res_part_name.name == "a"):
                                    part_name = res_part_name["title"]
                                else:
                                    part_name = res_part_name.string

                                # Get drop locations
                                res_part_drops = ele.contents[2].contents

                                if (res_part_drops[0].name == "a" and res_part_drops[1].name == None):
                                    print ("        Found syndicate!")
                                    dropData["type"] = "Syndicate"
                                    dropData[part_name] = res_part_drops[0].string
                                elif (res_part_drops[0].name == None):
                                    if ("Market" not in res_part_drops[0]):
                                        print ("        Found relics!")
                                        dropData["type"] = "Void Relic"
                                    res_part_drops[:] = [x for x in res_part_drops if x.name != 'br']
                                    res_part_drops = list(map(str.strip, res_part_drops))
                                    dropData[part_name] = res_part_drops

                        if (len(dropData) > 0):
                            entry['source'] = dropData
                        break


    with open(path, 'w') as fp:
        json.dump(data, fp)

from urllib.request import urlopen
from bs4 import BeautifulSoup
import json
import re



name = "Chroma"#input("Name: ").strip();
cat = "warframes"#input("Category: ").strip().lower();

newData = {}
path = '../src/data/' + cat + '.json'
with open(path) as data_file:
    data = json.load(data_file)

# Create ID
id_max = 0
for key in data:
    entry = data[key]
    if int(entry["id"]) > id_max:
        id_max = int(entry["id"])

id_max += 1
newData['id'] = str(id_max)

print ("Scraping details for " + name)
# Load page
url = "http://warframe.wikia.com/wiki/" + name.replace(" ", "_")
page = urlopen(url)
soup = BeautifulSoup(page, "html.parser")

# Gather slot data
res_slot = soup.find("b", string="Weapon Slot")
if (res_slot):
    print ("     Setting slot")
    weaponSlot = res_slot.parent.parent.next_sibling.contents[0].string.strip()
    newData['slot'] = weaponSlot
res_type = soup.find("b", string="Weapon Type")
if (res_type):
    print ("     Setting type")
    weaponType = res_type.parent.parent.next_sibling.contents[0].string.strip()
    newData['type'] = weaponType
# Gather source data
res_table = soup.find("table", "foundrytable")
if (res_table):
    # Lab item?
    lab = soup.find("a", string=re.compile(".*Lab$"))
    if (lab):
        print ("     Found a lab!")
        newData['source'] = lab.string
    else:
        # Prime/Syndiate item?
        dropData = {}
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
                        if (res_part_drops[0].name == "a" and res_part_drops[0].name == None):
                            print ("        Found syndicate!")
                            dropData[part_name] = res_part_drops[0].string
                        elif (res_part_drops[0].name == None):
                            print ("        Found relics!")
                            res_part_drops[:] = [x for x in res_part_drops if x.name != 'br']
                            res_part_drops = list(map(str.strip, res_part_drops))
                            dropData[part_name] = res_part_drops

                if (len(dropData) > 0):
                    newData['source'] = dropData
                break

print (newData)
# data[name] = newData
# with open(path, 'w') as fp:
#     json.dump(data, fp)

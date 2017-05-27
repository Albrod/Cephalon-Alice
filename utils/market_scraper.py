from urllib.request import urlopen
from bs4 import BeautifulSoup
import json
import re

path1 = '../src/data/weapons.json'
with open(path1) as data_file:
    weapon_data = json.load(data_file)

path2 = '../src/data/archwingWeapons.json'
with open(path2) as data_file:
    archwing_weapon_data = json.load(data_file)

# Gather information
url = "http://warframe.wikia.com/wiki/Market"
page = urlopen(url)
soup = BeautifulSoup(page, "html.parser")

# Find primary weapon table
res_table = soup.find("span", string=" Boltor  Blueprint").parent.parent
key = "Boltor"
while (res_table):
    if (res_table.contents[0].name == None):
        key = res_table.contents[1]["title"]
        weapon_data[key]["source"] = "Market"
    else:
        key = res_table.contents[2]["title"]
        archwing_weapon_data[key]["source"] = "Market"

    nextTable = res_table.parent.next_sibling.next_sibling
    if (not nextTable):
        break
    res_table = nextTable.contents[3]
    print (key)

# Find secondary weapon table
res_table = soup.find("span", string=" Afuris  Blueprint").parent.parent
key = "Afuris"
while (res_table):
    if (res_table.contents[0].name == None):
        key = res_table.contents[1]["title"]
        weapon_data[key]["source"] = "Market"
    else:
        key = res_table.contents[2]["title"]
        archwing_weapon_data[key]["source"] = "Market"

    nextTable = res_table.parent.next_sibling.next_sibling
    if (not nextTable):
        break
    res_table = nextTable.contents[3]
    print (key)

# Find melee weapon table
res_table = soup.find("span", string=" Amphis  Blueprint").parent.parent
key = "Amphis"
while (res_table):
    if (res_table.contents[0].name == None):
        key = res_table.contents[1]["title"]
        weapon_data[key]["source"] = "Market"
    else:
        key = res_table.contents[2]["title"]
        archwing_weapon_data[key]["source"] = "Market"

    nextTable = res_table.parent.next_sibling.next_sibling
    if (not nextTable):
        break
    res_table = nextTable.contents[3]
    print (key)

with open(path1, 'w') as fp:
    json.dump(weapon_data, fp)
with open(path2, 'w') as fp:
    json.dump(archwing_weapon_data, fp)

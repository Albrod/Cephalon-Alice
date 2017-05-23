import urllib2
from bs4 import BeautifulSoup
import json

path = '../src/data/companions.json'
with open(path) as data_file:
    data = json.load(data_file)

for item, value in data.iteritems():
    print ("Scraping " + item)
    # Gather information
    url = "http://warframe.wikia.com/wiki/" + item.replace(" ", "_")
    page = urllib2.urlopen(url)
    soup = BeautifulSoup(page, "html.parser")

    # Edit data
    res = soup.find("b", string="Weapon Slot")
    if (res):
        weaponSlot = res.parent.parent.next_sibling.contents[0].string.strip()
        data[item]['slot'] = weaponSlot

    res2 = soup.find("b", string="Weapon Type")
    if (res2):
        weaponType = res2.parent.parent.next_sibling.contents[0].string.strip()
        data[item]['type'] = weaponType


with open(path, 'w') as fp:
    json.dump(data, fp)

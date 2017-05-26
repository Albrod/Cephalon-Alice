import json


path = '../src/data/companions.json'

json_file = open(path)
json_str = json_file.read()
json_data = json.loads(json_str)

newJSON = {}
for entry in json_data:
    newObj = {}
    newObj['id'] = "5" + json_data[entry]["id"]
    if "source" in entry:
        newObj['source'] = entry["source"]
    newJSON[entry] = newObj

with open(path, 'w') as fp:
    json.dump(newJSON, fp)

import json

categories = ["archwings", "archwingWeapons", "companions", "warframes", "weapons"]

for cat in categories:
    path = '../src/data/' + cat + '.json'

    json_file = open(path)
    json_str = json_file.read()
    json_data = json.loads(json_str)

    newJSON = {}
    for entry in json_data:
        newObj = {}
        newObj['id'] = entry["id"]
        if "source" in entry:
            newObj['source'] = entry["source"]
        newJSON[entry["name"]] = newObj

    with open(path, 'w') as fp:
        json.dump(newJSON, fp)

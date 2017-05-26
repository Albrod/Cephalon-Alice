import json

categories = ["archwings", "archwingWeapons", "companions", "warframes", "weapons"]

for cat in categories:
    path = '../src/data/' + cat + '.json'

    json_file = open(path)
    json_str = json_file.read()
    json_data = json.loads(json_str)

    id_max = 0
    for key in json_data:
        entry = json_data[key]
        if int(entry["id"]) > id_max:
            id_max = int(entry["id"])

    id_max += 1
    print (cat + ": " + str(id_max))

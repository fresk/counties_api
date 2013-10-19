from counties_api.mongo_db import *


#for doc in db.locations.find():
#    lat, lng = doc['location']['coordinates']
#    doc['location']['coordinates'] = [lng, lat]
#    db.locations.save( doc)

locs = db.locations.find({
    'location': {
        '$near': {
            '$geometry': {'type': 'Point', 'coordinates': [-93.652, 41.54]}
        }
    }
})


for l in locs:
    print l
import os
import json
import sqlite3
import time

## SETUP MONGO CONNECTION
import pymongo
import bson
from bson.objectid import ObjectId
class ObjectIDFieldRenamer(pymongo.son_manipulator.SONManipulator):

    def transform_incoming(self, son, collection):
        if "id" in son:
            son["_id"] = ObjectId(son['id'])
        return son

    def transform_outgoing(self, son, collection):
        if "_id" in son:
            son['id'] = str(son['_id'])
        if self.will_copy():
            return bson.son.SON(son)
        return son

mongo_client = pymongo.MongoClient('findyouriowa.com', 27017)
db = mongo_client.find_your_iowa
manipulator = ObjectIDFieldRenamer()
pymongo.database.Database.add_son_manipulator(db, manipulator)
db.locations.ensure_index([('location', pymongo.GEOSPHERE)])




## CREATE SQLITE DB
try:
    os.remove("locations.db")
except:
    pass

conn = sqlite3.connect('locations.db')
c = conn.cursor()

c.execute("""
CREATE VIRTUAL TABLE locations using fts3 (
  id varchar PRIMARY KEY NOT NULL,
  lat float,
  lng float,
  name varchar,
  city varchar,
  images varchar,
  categories varchar,
  popularity float,
  last_update integer,
  search_text varchar

);
""")

c.execute("""
CREATE TABLE location_categories(
    category_id varchar NOT NULL,
    location_id varchar NOT NULL,
    PRIMARY KEY (category_id, location_id)
);
""")



## CACHE IMPORTANT VALUES AND INSERT INTO SQLLITE
for r in db.locations.find():
    r['last_update'] = int(time.time())
    r['popularity'] = 0.0
    #id, lat, lon, name, city, image_list, popularity, last_update

    row = [
        r['id'],
        float(r['location']['coordinates'][1]), #lat
        float(r['location']['coordinates'][0]), #lng
        r['name'],
        r['address']['city'],
        ",".join(r['images']),
        ",".join(r['category']),
        r['popularity'], #popularity,
        r['last_update'],
        "%s  %s  %s %s %s" % (r['name'],  r['address']['city'], r['description'], r['keywords'], ",".join(r['category']))
    ]

    c.execute("INSERT INTO locations VALUES (?,?,?,?,?,?,?,?,?,?)", row)
    for cat in r['category']:
        c.execute("INSERT INTO location_categories VALUES (?,?)", [cat, r['id']] )

conn.commit()
c.close()

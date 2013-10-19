import pymongo
import bson
from bson.objectid import ObjectId

class ObjectIDFieldRenamer(pymongo.son_manipulator.SONManipulator):

    def transform_incoming(self, son, collection):
        if "id" in son:
            son["_id"] = ObjectId(son['id'])
        return son

    def transform_outgoing(self, son, collection):
        son['id'] = str(son['_id'])
        if self.will_copy():
            return bson.son.SON(son)
        return son


mongo_client = pymongo.MongoClient('findyouriowa.com', 27017)
db = mongo_client.find_your_iowa
manipulator = ObjectIDFieldRenamer()
pymongo.database.Database.add_son_manipulator(db, manipulator)

db.locations.ensure_index([('location', pymongo.GEOSPHERE)])


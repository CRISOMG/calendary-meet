import Realm from "realm";

export const ItemSchema = {
  name: "Item",
  properties: {
    _id: "objectId",
    isComplete: "bool",
    owner_id: "string",
    summary: "string",
  },
  primaryKey: "_id",
};

export const meetsSchema = {
  name: "meets",
  properties: {
    _id: "objectId?",
    description: "string",
    meet: "date",
    user_id: "objectId",
  },
  primaryKey: "_id",
};

export const usersSchema = {
  name: "users",
  properties: {
    _id: "objectId?",
    email: "string?",
    password: "string?",
  },
  primaryKey: "_id",
};

import * as Realm from "realm-web";

export const useRealmServices = () => {
  const app = new Realm.App({ id: "devicesync-avzpr" });

  const deleteUser = async () => {
    try {
      const res = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("users")
        .deleteOne({
          user_id: Realm.BSON.ObjectId(app.currentUser.id),
        });
      // const r1 = await app.removeUser(app.currentUser);
      const _ = await app.deleteUser(app.currentUser);
      return {
        deletedInfo: res,
        ..._,
      };
    } catch (error) {
      throw error;
    }
  };
  const retrieveUserCustomData = async () => {
    try {
      const user = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("users")
        .findOne({ user_id: Realm.BSON.ObjectId(app.currentUser.id) });
      return user;
    } catch (error) {
      console.error(error);
    }
  };
  const logout = async () => {
    await app.currentUser.logOut();
  };

  const retryConfirmation = async (email) => {
    await app.emailPasswordAuth.retryCustomConfirmation({ email });
  };

  const sendResetPassword = async (email) => {
    await app.emailPasswordAuth.sendResetPasswordEmail({ email });
  };

  const resetPassword = async ({ token, tokenId, password }) => {
    await app.emailPasswordAuth.resetPassword({
      password,
      token,
      tokenId,
    });
  };

  const createMeet = async ({ meet, title, description }) => {
    try {
      const res = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("meets")
        .insertOne({
          meet,
          title,
          description,
          user_id: Realm.BSON.ObjectId(app.currentUser.id),
        });

      console.log(res);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const updateMeet = async (id, { meet, title, description }) => {
    try {
      const res = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("meets")
        .updateOne(
          { _id: Realm.BSON.ObjectId(id) },
          {
            $set: {
              meet,
              title,
              description,
            },
          }
        );

      return res;
    } catch (error) {
      throw error;
    }
  };
  const createRemember = async ({ remember, meet_id }) => {
    try {
      const res = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("remembers")
        .insertOne({
          remember_date: remember,
          meet_id: Realm.BSON.ObjectId(meet_id),
          user_id: Realm.BSON.ObjectId(app.currentUser.id),
          active: true,
        });
      return res;
    } catch (error) {
      throw error;
    }
  };

  const updateRemember = async (id, { remember }) => {
    try {
      const res = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("remembers")
        .updateOne(
          { _id: Realm.BSON.ObjectId(id) },
          {
            $set: {
              remember_date: remember,
              active: true,
            },
          }
        );
      return res;
    } catch (error) {
      throw error;
    }
  };

  const retrieveMeets = async () => {
    try {
      const meets = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("meets")
        .aggregate([
          {
            $lookup: {
              from: "remembers",
              localField: "_id",
              foreignField: "meet_id",
              as: "remember",
            },
          },
          {
            $unwind: "$remember",
          },
        ]);
      return meets;
    } catch (error) {
      console.error(error);
    }
  };
  const deleteMeet = async ({ meet_id, remember_id }) => {
    try {
      const meet = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("meets")
        .deleteOne({ _id: meet_id });

      const remember = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("remembers")
        .deleteOne({ _id: remember_id });

      console.log("delete status:", {
        meet,
        remember,
      });
      return "ok";
    } catch (error) {
      throw error;
    }
  };
  const login = async ({ email, password }) => {
    try {
      const credentials = Realm.Credentials.emailPassword(email, password);
      const user = await app.logIn(credentials);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async ({ email, password }) => {
    try {
      const res = await app.emailPasswordAuth.registerUser({
        email,
        password,
      });

      console.log(res);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const confirmUser = async ({ token, tokenId }) => {
    try {
      const data = await app.emailPasswordAuth.confirmUser({
        token,
        tokenId,
      });
      return data;
    } catch (error) {
      throw error;
    }
  };

  return {
    deleteUser,
    logout,
    login,
    register,
    confirmUser,
    retryConfirmation,
    sendResetPassword,
    resetPassword,
    createMeet,
    updateMeet,
    createRemember,
    updateRemember,
    retrieveMeets,
    deleteMeet,
    retrieveUserCustomData,
  };
};

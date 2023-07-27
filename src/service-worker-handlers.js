import * as Realm from "realm-web";

export const swRequestNotificationsGrant = async () => {
  const result = await Notification.requestPermission((result) => result);
  console.log("swRequestNotificationsGrant:", result);
  return {
    result,
    isGranted: result === "granted",
    isDefault: result === "default",
    isDenied: result === "denied",
  };
};

export const swTestNewSuscription = async (suscription, type) => {
  try {
    const app = new Realm.App({ id: "devicesync-avzpr" });

    // const res =
    // type !== "local"
    //   ? await app.currentUser.callFunction("new_suscription", suscription)
    //   :

    const res = await fetch("/api/test-suscription", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        suscription,
      }),
    });
    console.log(res);
  } catch (error) {
    console.error(error);
  }
};

export const swUpdateSuscription = async (suscription) => {
  try {
    const app = new Realm.App({ id: "devicesync-avzpr" });

    const res = await app.currentUser
      ?.mongoClient("mongodb-atlas")
      ?.db("calendary")
      ?.collection("users")
      ?.updateOne(
        {
          user_id: Realm.BSON.ObjectId(app.currentUser.id),
        },
        {
          $set: {
            notifications: {
              suscription: suscription.toJSON(),
            },
          },
        }
      );

    const updated = (res.matchedCount && res.modifiedCount) || null;
    return { updated };
  } catch (error) {
    console.error("swUpdateSuscription:", error);
    throw error;
  }
};

export const swHandleSuscription = async (sw) => {
  try {
    const { result, isGranted, isDefault, isDenied } =
      await swRequestNotificationsGrant();

    if (!isDenied) {
      const suscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });

      return suscription;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const onServiceWorker = async (callback) => {
  try {
    return await navigator.serviceWorker.ready.then((sw) => {
      if (typeof callback === "function") {
        callback(sw);
      }

      if (!callback) {
        return sw;
      }
    });
  } catch (error) {
    console.error("onServiceWorker:", error);
    throw error;
  }
};

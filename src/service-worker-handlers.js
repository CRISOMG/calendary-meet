import * as Realm from "realm-web";

export const swRequestNotificationsGrant = async () => {
  const result = await Notification.requestPermission((result) => result);

  return {
    result,
    isGranted: result === "granted",
    isDefault: result === "default",
    isDenied: result === "denied",
  };
};

export const suscriptionExample = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/fVOQIiPG2nY:APA91bHDB1bZjh26kUZ3nquESQ3Lq7lFtTMobyNlWtsCtkLiwJfsX_JoTcOHyICd4ybIOW87TP0idBBnbZ30C-qtdRirAZwamYSB0uumJ3z6Y4samW3KFpqHrTOrtATnD116u5sLrgWx",
  expirationTime: null,
  keys: {
    p256dh:
      "BDqv68rc2HoGrUb0E6Cohk2aOCt-AgQ-ukNtAivknGt9PTaeYSA_KaDlXz3bdUR6Iwx3zfZ0qAEG12shz6nQ5xw",
    auth: "3iTWwiCZ_5g8vnC-HXFZRA",
  },
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
      .mongoClient("mongodb-atlas")
      .db("calendary")
      .collection("users")
      .updateOne(
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

    const updated = res.matchedCount && res.modifiedCount;
    return { updated };
  } catch (error) {
    console.error(error);
  }
};

export const swHandleSuscription = async (sw) => {
  const { result, isGranted, isDefault, isDenied } =
    await swRequestNotificationsGrant();

  if (isGranted) {
    const suscription = await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
    });

    return suscription;
  }
};

export const onServiceWorker = async (callback) => {
  try {
    const sw = await navigator.serviceWorker.ready;
    if (typeof callback === "function") {
      callback(sw);
    }

    if (!callback) {
      return sw;
    }
  } catch (error) {
    console.error(error);
  }
};

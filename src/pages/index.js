import Image from "next/image";
import { Inter, Trykker } from "next/font/google";
import * as Realm from "realm-web";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { endpoints } from "@/urls";
import dynamic from "next/dynamic";
import {
  onServiceWorker,
  swHandleSuscription,
  swTestNewSuscription,
  swUpdateSuscription,
} from "@/service-worker-handlers";

const inter = Inter({ subsets: ["latin"] });

function Home() {
  function parseToDateJS(date) {
    const [year, month, day] = date.split("-");

    let _date = new Date(+year, month - 1, day);

    if (!_date.toJSON()) {
      _date = new Date(date);
    }

    return _date;
  }

  const _user = {
    email: "testmongodbrealmcris@yopmail.com",
    name: "Cristian Caraballo",
    password: "123456",
  };
  const app = new Realm.App({ id: "devicesync-avzpr" });
  // const _db = app.currentUser.mongoClient("mongodb-atlas").db("calendary");

  const [user, setUser] = useState();
  useEffect(() => {
    if (app.currentUser) {
      setUser({
        appUser: app.currentUser,
      });
    }
  }, []);

  if (globalThis?.window) {
    window._app = app;
  }
  const register = async () => {
    try {
      const res = await app.emailPasswordAuth.registerUser(_user);

      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const login = async ({ email, password }) => {
    try {
      const credentials = Realm.Credentials.emailPassword(email, password);

      const user = await app.logIn(credentials);

      setUser(user);
      console.log(user);
    } catch (error) {
      console.error(error);
    }
  };

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
      console.log(error);
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

  const createMeet = async () => {
    try {
      const payload = {
        meet: parseToDateJS("2023-12-12"),
        description: "test",
      };
      // const res = await app.currentUser.functions.callFunction("createMeet", payload);
      const res = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("meets")
        .insertOne({
          ...payload,
          user_id: Realm.BSON.ObjectId(app.currentUser.id),
        });

      console.log(res);
      return res;
    } catch (error) {
      console.error(error);
    }
  };

  const retrieveMeets = async () => {
    try {
      const meets = await app.currentUser
        .mongoClient("mongodb-atlas")
        .db("calendary")
        .collection("meets")
        .find({});
      console.log(meets);
      return meets;
    } catch (error) {
      console.error(error);
    }
  };

  const router = useRouter();

  useEffect(() => {
    const { token, tokenId } = router.query;
    if (token && tokenId) {
      (async () => {
        // console.log({ token, tokenId });
        try {
          await app.emailPasswordAuth.confirmUser({ token, tokenId });
        } catch (error) {
          console.error(error);
          router.push("/");
        }
      })();
    }
  }, [router.query]);

  const [meetDate, setMeetDate] = useState("");

  useEffect(() => {
    if (meetDate) {
      console.log({ meetDate: parseToDateJS(meetDate).toJSON() });
    }
  }, [meetDate]);

  const [meetDescription, setMeetDescription] = useState("");

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="">
        <h1
          className="relative font-extrabold text-transparent text-6xl sm:text-9xl leading-relaxed bg-clip-text bg-gradient-to-bl from-blue-800 from-20% via-blue-500 via-50%
         to-blue-800 to-90% font-grand-hotel "
        >
          Calendary
          <span className="absolute text-amber-600 text-[1.5rem] sm:text-[3rem] -bottom-2 sm:-bottom-8 right-7 sm:right-14 ">
            Meeting
          </span>
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          // href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
          className="cursor-pointer hover:text-black group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          // target="_blank"
          // rel="noopener noreferrer"
          onClick={() => login(_user)}
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Login
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>
        <a
          className="cursor-pointer hover:text-black group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={register}
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Register
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>
        <a
          className="cursor-pointer hover:text-black group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={createMeet}
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Create Meet
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>
        <a
          className="cursor-pointer hover:text-black group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={retrieveMeets}
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            List Meets
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>
        <a
          className="cursor-pointer hover:text-black group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={logout}
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Logout
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>{" "}
        <a
          className="cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-black hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={deleteUser}
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Delete User
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>{" "}
        <a
          className="cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-black hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={() =>
            onServiceWorker(async (sw) => {
              swTestNewSuscription(
                (
                  await app.currentUser
                    .mongoClient("mongodb-atlas")
                    .db("calendary")
                    .collection("users")
                    .findOne({
                      user_id: Realm.BSON.ObjectId(app.currentUser.id),
                    })
                ).notifications.suscription
              );
            })
          }
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Test Notification
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>
        <a
          className="cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-black hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={async () => {
            // onServiceWorker(async (sw) => {
            console.log(process.env.NEXT_PUBLIC_VAPID_KEY);
            swTestNewSuscription(
              (
                await app.currentUser
                  .mongoClient("mongodb-atlas")
                  .db("calendary")
                  .collection("users")
                  .findOne({
                    user_id: Realm.BSON.ObjectId(app.currentUser.id),
                  })
              ).notifications.suscription,
              "local"
            );
            // });
          }}
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Test Local Notification
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>
        <a
          className="cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-black hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={() =>
            onServiceWorker(async (sw) => {
              swUpdateSuscription(await swHandleSuscription(sw));
            })
          }
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Add Notification Suscription
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>
      </div>

      <input
        className="text-black"
        type="datetime-local"
        value={meetDate}
        onChange={(ev) => {
          console.log(ev.target.value);
          setMeetDate(ev.target.value);
        }}
      />

      <input
        className="text-black"
        value={meetDescription}
        onChange={(ev) => {
          setMeetDescription(ev.target.value);
        }}
      />
    </main>
  );
}

export default dynamic(async () => await Promise.resolve(Home), {
  ssr: false,
});

import { useEffect } from "react";
import "../styles/globals.css";

import * as Realm from "realm-web";
import {
  swHandleSuscription,
  swRequestNotificationsGrant,
} from "../service-worker-handlers";

import { SnackbarProvider } from "notistack";

import { store } from "../redux/store";
import { Provider } from "react-redux";

export default function App({ Component, pageProps }): JSX.Element {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async function () {
        try {
          const sw = await navigator.serviceWorker.register("/sw.js");
          console.log(
            "Service Worker registration successful with scope: ",
            sw.scope
          );
          await swRequestNotificationsGrant();
        } catch (error) {
          console.log("Service Worker registration failed: ", error);
        }
      });
    }
  }, []);

  return (
    <>
      <Provider store={store}>
        <SnackbarProvider maxSnack={3}>
          <Component {...pageProps} />
        </SnackbarProvider>
      </Provider>
    </>
  );
}

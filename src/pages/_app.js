import { useEffect } from "react";
import "@/styles/globals.css";

import * as Realm from "realm-web";
import { swHandleSuscription } from "@/service-worker-handlers";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async function () {
        try {
          const sw = await navigator.serviceWorker.register("/sw.js");
          console.log(
            "Service Worker registration successful with scope: ",
            sw.scope
          );
        } catch (error) {
          console.log("Service Worker registration failed: ", error);
        }
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

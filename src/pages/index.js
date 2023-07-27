import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import dynamic from "next/dynamic";
import { Inter } from "next/font/google";

import * as Realm from "realm-web";

import {
  onServiceWorker,
  swHandleSuscription,
  swTestNewSuscription,
  swUpdateSuscription,
} from "@/service-worker-handlers";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputLabel,
  TextField,
} from "@mui/material";

import {
  Add,
  AdsClick,
  Close,
  Delete,
  Edit,
  Label,
  Logout,
  PlusOne,
} from "@mui/icons-material";

import { CardMeet } from "../components/CartMeet";

import { CreateMeetModal } from "../components/CreateMeetModal";
import { UpdateMeetModal } from "../components/UpdateMeetModal";

import { useSnackbar } from "notistack";
import { useSelectorAuth } from "@/redux/slices/auth";

import { useRealmServices } from "../hooks/useRealm";

const inter = Inter({ subsets: ["latin"] });

function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const app = new Realm.App({ id: "devicesync-avzpr" });

  const [loading, setLoading] = useState("");
  const [meets, setMeets] = useState("");

  const [openCreateMeetModal, setOpenCreateMeetModal] = useState("");
  const [openUpdateMeetModal, setOpenUpdateMeetModal] = useState("");

  const { user } = useSelectorAuth();
  console.log("user from redux:", user);

  const {
    deleteUser,
    logout,
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
  } = useRealmServices();

  useEffect(() => {
    if (!app.currentUser) {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotificationsFlow = async () => {
    try {
      setLoading("handleNotificationsFlow");

      const sw = await onServiceWorker();
      const sus = await swHandleSuscription(sw);
      const { updated } = await swUpdateSuscription(sus);

      if (updated) {
        enqueueSnackbar("notificationes activadas exitosamente.", {
          variant: "success",
        });
      } else {
        enqueueSnackbar("resultado no esperado.", {
          variant: "warning",
        });
      }
      setLoading(false);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleActiveNotifications = async () => {
    try {
      setLoading("handleNotificationsFlow");

      const user = await retrieveUserCustomData();
      if (!user?.notifications?.suscription) {
        await handleNotificationsFlow();
      } else {
        enqueueSnackbar("notificationes estan activas.", {
          variant: "info",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleActiveNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if (globalThis?.window) {
  //   window._app = app;
  // }

  const fetchMeets = async () => {
    try {
      setLoading(true);
      const res = await retrieveMeets();
      setMeets(res);
      console.log("meets:", res);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMeets();
  }, []);

  const handleLogout = async () => {
    try {
      const resLogout = await logout();
      router.push("/login");
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };
  const handleDeleteUser = async () => {
    try {
      await deleteUser();
      router.push("/login");
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  // swTestNewSuscription
  return (
    <main className={`min-h-screen md:p-24 mb-24 ${inter.className}`}>
      <div className="mb-12 mx-auto w-min">
        <h1 className="calendary-logo">
          Calendary
          <span className="calendary-sub-logo">Meeting</span>
        </h1>
      </div>
      <div className="relative mx-auto border border-white rounded p-4 min-h-[8rem] max-w-5xl flex flex-wrap mt-24">
        <p className="absolute -top-8">
          Usuario: {app?.currentUser?.profile?.email}
        </p>

        <div
          onClick={() => handleLogout()}
          className="select-none cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors  hover:border-gray-300 hover:bg-gray-100 hover:text-black"
        >
          <span className="mr-4 font-bold text-2xl">Cerrar sesion</span>
          <IconButton
            disableRipple
            sx={{ backgroundColor: "black" }}
            size="large"
          >
            <Logout sx={{ color: "white" }} fontSize="inherit" />
          </IconButton>
        </div>
        <div
          onClick={() =>
            confirm("seguro que quiere borrar su usuario?") &&
            handleDeleteUser()
          }
          className="select-none cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors  hover:border-gray-300 hover:bg-gray-100 hover:text-black"
        >
          <span className="mr-4 font-bold text-2xl">Borrar usuario</span>
          <IconButton
            disableRipple
            sx={{ backgroundColor: "black" }}
            size="large"
          >
            <Delete sx={{ color: "white" }} fontSize="inherit" />
          </IconButton>
        </div>
      </div>

      <div className="relative mx-auto border border-white rounded p-4 min-h-[8rem] max-w-5xl flex flex-wrap mt-24">
        <p className="absolute -top-8">Reuniones:</p>
        <div className="absolute -right-6 -top-7">
          <IconButton
            disableRipple
            sx={{ backgroundColor: "white" }}
            size="large"
            onClick={() => setOpenCreateMeetModal(true)}
          >
            <Add sx={{ color: "black" }} fontSize="inherit" />
          </IconButton>
        </div>
        {meets && meets.length ? (
          meets.map(({ title, description, meet, remember, _id }, i) => {
            return (
              <CardMeet
                key={`${description}-${i}`}
                {...{
                  title,
                  description,
                  meet,
                  meet_id: _id,
                  remember: remember.remember_date,
                  remember_id: remember._id,
                }}
                onDelete={async () => {
                  if (confirm("Seguro que quiere borrar la reunion?")) {
                    const status = await deleteMeet({
                      meet_id: _id,
                      remember_id: remember._id,
                    });

                    if (status == "ok") {
                      fetchMeets();
                    }
                  }
                }}
                onUpdate={() =>
                  setOpenUpdateMeetModal({
                    title,
                    description,
                    meet,
                    meet_id: _id,
                    remember: remember.remember_date,
                    remember_id: remember._id,
                  })
                }
              />
            );
          })
        ) : (
          <h2 className="text-white text-2xl font-extrabold">
            No tienes reuniones pendientes
          </h2>
        )}
      </div>
      <div className="relative mx-auto border border-white rounded p-4 min-h-[8rem] max-w-5xl flex flex-wrap mt-24">
        <p className="absolute -top-8">Funciones:</p>
        <div
          onClick={async () => {
            if (loading === "swTestNewSuscription") {
              return;
            }

            try {
              setLoading("swTestNewSuscription");
              const user = await retrieveUserCustomData();
              await swTestNewSuscription(user?.notifications?.suscription);
            } catch (error) {
              throw error;
            } finally {
              setLoading(false);
            }
          }}
          className="select-none cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors  hover:border-gray-300 hover:bg-gray-100 hover:text-black"
        >
          <span className="mr-4 font-bold text-2xl">Probar Notificacion</span>
          {loading === "swTestNewSuscription" ? (
            <CircularProgress color="info" />
          ) : (
            <IconButton
              disableRipple
              sx={{ backgroundColor: "black" }}
              size="large"
            >
              <AdsClick sx={{ color: "white" }} fontSize="inherit" />
            </IconButton>
          )}
        </div>
        {/* handleNotificationsFlow */}
        <div
          onClick={async () => {
            if (loading !== "handleNotificationsFlow") {
              await handleNotificationsFlow();
            }
          }}
          className="select-none cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors  hover:border-gray-300 hover:bg-gray-100 hover:text-black"
        >
          <span className="mr-4 font-bold text-2xl">
            Recordar en este dispositivo
          </span>
          {loading === "handleNotificationsFlow" ? (
            <CircularProgress color="info" />
          ) : (
            <IconButton
              disableRipple
              sx={{ backgroundColor: "black" }}
              size="large"
            >
              <AdsClick sx={{ color: "white" }} fontSize="inherit" />
            </IconButton>
          )}
        </div>
      </div>

      {openCreateMeetModal && (
        <CreateMeetModal
          onClose={() => setOpenCreateMeetModal(false)}
          open={openCreateMeetModal}
          onSubmit={async (values) => {
            const { title, description, meet, remember } = values;

            try {
              const _meet = await createMeet({
                title,
                description,
                meet: new Date(meet),
              });

              await createRemember({
                remember: new Date(remember),
                meet_id: _meet.insertedId,
              });

              fetchMeets();
            } catch (error) {
              throw error;
            }
          }}
        />
      )}

      {openUpdateMeetModal && (
        <UpdateMeetModal
          onClose={() => setOpenUpdateMeetModal(false)}
          open={openUpdateMeetModal}
          onSubmit={async (values) => {
            const { meet_id, remember_id } = openUpdateMeetModal;
            const { title, description, meet, remember } = values;

            try {
              const meetStatus = await updateMeet(meet_id, {
                title,
                description,
                meet: new Date(meet),
              });

              const rememberStatus = await updateRemember(remember_id, {
                remember: new Date(remember),
              });

              console.log("update status:", {
                meetStatus,
                rememberStatus,
              });
              fetchMeets();
            } catch (error) {
              throw error;
            }
          }}
        />
      )}
    </main>
  );
}

export default dynamic(async () => await Promise.resolve(Home), {
  ssr: false,
});

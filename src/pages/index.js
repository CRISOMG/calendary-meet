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
  Close,
  Delete,
  Edit,
  Label,
  Logout,
  PlusOne,
} from "@mui/icons-material";

import { useFormik } from "formik";
import * as yup from "yup";
const inter = Inter({ subsets: ["latin"] });

function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const _user = {
    email: "testmongodbrealmcris@yopmail.com",
    name: "Cristian Caraballo",
    password: "123456",
  };
  const app = new Realm.App({ id: "devicesync-avzpr" });

  const { user } = useSelectorAuth();
  console.log("user from redux:", user);

  // const [user, setUser] = useState();
  useEffect(() => {
    if (!app.currentUser) {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.currentUser]);

  const handleNotificationsFlow = async () => {
    try {
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
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
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
  useEffect(() => {
    (async () => {
      try {
        const user = await retrieveUserCustomData();
        if (!user?.notifications?.suscription) {
          await handleNotificationsFlow();
        }
      } catch (error) {
        console.log(error);
      }
    })();
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
      throw error;
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

  const handleLogout = async () => {
    try {
      const resLogout = await logout();
      router.push("/login");
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const [loading, setLoading] = useState("");
  const [meets, setMeets] = useState("");

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

  const [openCreateMeetModal, setOpenCreateMeetModal] = useState("");
  const [openUpdateMeetModal, setOpenUpdateMeetModal] = useState("");

  const CardMeet = (params) => {
    const { title, description, meet, remember, meet_id, remember_id } = params;
    return (
      <>
        <div className="m-4 h-min  text-black group rounded-lg border border-transparent px-5 py-4 transition-colors border-gray-300 bg-gray-100 ">
          <h2>
            <b>{title}</b>
          </h2>
          <p>{description}</p>
          <p>
            Hora de reunion:
            <br />
            {meet?.toLocaleString ? meet?.toLocaleString() : meet}
          </p>
          <p>
            Recordatorio:
            <br />
            {remember?.toLocaleString ? remember?.toLocaleString() : remember}
          </p>
          <div className="mt-4 ml-auto flex justify-end">
            <IconButton
              disableRipple
              sx={{ backgroundColor: "red", mr: "8px" }}
              size="large"
              onClick={async () => {
                if (confirm("Seguro que quiere borrar la reunion?")) {
                  const status = await deleteMeet({ meet_id, remember_id });

                  if (status == "ok") {
                    fetchMeets();
                  }
                }
              }}
            >
              <Delete sx={{ color: "white" }} fontSize="inherit" />
            </IconButton>
            <IconButton
              disableRipple
              sx={{ backgroundColor: "black" }}
              size="large"
              onClick={() => setOpenUpdateMeetModal(params)}
            >
              <Edit sx={{ color: "white" }} fontSize="inherit" />
            </IconButton>
          </div>
        </div>
      </>
    );
  };

  return (
    <main className={`min-h-screen p-24 ${inter.className}`}>
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

        <button
          onClick={() => handleLogout()}
          className="cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-black hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <span className="mr-4 font-bold text-2xl">Logout</span>
          <IconButton
            disableRipple
            sx={{ backgroundColor: "black" }}
            size="large"
          >
            <Logout sx={{ color: "white" }} fontSize="inherit" />
          </IconButton>
        </button>
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

import { useSnackbar } from "notistack";
import { useSelectorAuth } from "@/redux/slices/auth";
const CreateMeetModal = ({ onClose, open, onSubmit }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const { handleSubmit, handleChange, errors } = useFormik({
    initialValues: {
      title: "",
      description: "",
      meet: "",
      remember: "",
    },
    validationSchema: yup.object().shape({
      title: yup.string().required("Campo requerido."),
      description: yup.string().required("Campo requerido."),
      meet: yup
        .date()
        .required("Campo requerido.")
        .min(new Date(), "Seleccione una fecha y hora mayor a la actual."),
      remember: yup
        .date()
        .required("Campo requerido.")
        .min(new Date(), "Seleccione una fecha y hora mayor a la actual.")
        .max(
          yup.ref("meet"),
          "Seleccione una fecha y hora menor a la de reunion."
        ),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        await onSubmit(values);

        enqueueSnackbar("Reunion creada con exito!", { variant: "success" });
        onClose();
      } catch (error) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle sx={{ minWidth: "16rem" }} className="relative">
        Crear Meet
        <Close
          onClick={() => onClose()}
          size="large"
          sx={{
            position: "absolute",
            fontSize: "2rem",
            top: "16pxm",
            right: "2rem",
            color: "black",
            cursor: "pointer",
          }}
          fontSize="inherit"
        />
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container flexDirection={"column"}>
            <Grid item my={2}>
              <InputLabel htmlFor="title">Titulo</InputLabel>
              <TextField
                error={Boolean(errors?.title)}
                helperText={errors?.title ? errors?.title : " "}
                onChange={handleChange}
                id="title"
              />
            </Grid>
            <Grid item my={2}>
              <InputLabel htmlFor="description">Descricion</InputLabel>
              <TextField
                error={Boolean(errors?.description)}
                helperText={errors?.description ? errors?.description : " "}
                onChange={handleChange}
                id="description"
              />
            </Grid>
            <Grid item my={2}>
              <InputLabel htmlFor="meet">Fecha de Reunion</InputLabel>
              <TextField
                error={Boolean(errors?.meet)}
                helperText={errors?.meet ? errors?.meet : " "}
                onChange={handleChange}
                id="meet"
                type="datetime-local"
              />
            </Grid>
            <Grid item my={2}>
              <InputLabel htmlFor="remember">Recordatorio</InputLabel>
              <TextField
                error={Boolean(errors?.remember)}
                helperText={errors?.remember ? errors?.remember : " "}
                onChange={handleChange}
                id="remember"
                type="datetime-local"
              />
            </Grid>
            <Grid item my={2}>
              <Button type="submit" variant="contained">
                {loading ? (
                  <CircularProgress
                    sx={{ color: "white", "&:hover": { color: "black" } }}
                    size={35}
                  />
                ) : (
                  "Enviar"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const UpdateMeetModal = ({ onClose, open, onSubmit }) => {
  const { ..._meet } = open;
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const { handleSubmit, handleChange, errors, values } = useFormik({
    initialValues: {
      title: _meet?.title ?? "",
      description: _meet?.description ?? "",
      meet: _meet?.meet ?? "",
      remember: _meet?.remember ?? "",
    },
    validationSchema: yup.object().shape({
      title: yup.string().required("Campo requerido."),
      description: yup.string().required("Campo requerido."),
      meet: yup
        .date()
        .required("Campo requerido.")
        .min(new Date(), "Seleccione una fecha y hora mayor a la actual."),
      remember: yup
        .date()
        .required("Campo requerido.")
        // .min(new Date(), "Seleccione una fecha y hora mayor a la actual.")
        .max(
          yup.ref("meet"),
          "Seleccione una fecha y hora menor a la de reunion."
        ),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        await onSubmit(values);

        enqueueSnackbar("Reunion actualizada con exito!", {
          variant: "success",
        });
        onClose();
      } catch (error) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  const parseDate = (date) => {
    let _date = new Date(date);
    if (_date) {
      let h = _date.getHours().toString();
      h = h.length === 1 ? `0${h}` : h;

      let m = _date.getMinutes().toString();
      m = m.length === 1 ? `0${m}` : m;

      _date = `${_date.toJSON().split("T")[0]}T${h}:${m}`;
    }
    return _date;
  };

  return (
    <Dialog onClose={onClose} open={!!open}>
      <DialogTitle sx={{ minWidth: "16rem" }} className="relative">
        Actualizar Meet
        <Close
          onClick={() => onClose()}
          size="large"
          sx={{
            position: "absolute",
            fontSize: "2rem",
            top: "16pxm",
            right: "2rem",
            color: "black",
            cursor: "pointer",
          }}
          fontSize="inherit"
        />
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container flexDirection={"column"}>
            <Grid item my={2}>
              <InputLabel htmlFor="title">Titulo</InputLabel>
              <TextField
                error={Boolean(errors?.title)}
                helperText={errors?.title ? errors?.title : " "}
                onChange={handleChange}
                value={values.title}
                id="title"
              />
            </Grid>
            <Grid item my={2}>
              <InputLabel htmlFor="description">Descricion</InputLabel>
              <TextField
                error={Boolean(errors?.description)}
                helperText={errors?.description ? errors?.description : " "}
                onChange={handleChange}
                id="description"
                value={values.description}
              />
            </Grid>

            <Grid item my={2}>
              <InputLabel htmlFor="meet">Fecha de Reunion</InputLabel>
              <TextField
                error={Boolean(errors?.meet)}
                helperText={errors?.meet ? errors?.meet : " "}
                onChange={handleChange}
                id="meet"
                value={parseDate(values.meet) ?? ""}
                type="datetime-local"
              />
            </Grid>
            <Grid item my={2}>
              <InputLabel htmlFor="remember">Recordatorio</InputLabel>
              <TextField
                error={Boolean(errors?.remember)}
                helperText={errors?.remember ? errors?.remember : " "}
                onChange={handleChange}
                id="remember"
                value={parseDate(values.remember) ?? ""}
                type="datetime-local"
              />
            </Grid>
            <Grid item my={2}>
              <Button type="submit" variant="contained">
                {loading ? (
                  <CircularProgress
                    sx={{ color: "white", "&:hover": { color: "black" } }}
                    size={35}
                  />
                ) : (
                  "Actualizar"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// const _ = (
//   <>
//     <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
//       <a
//         className="cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-black hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         onClick={() =>
//           onServiceWorker(async (sw) => {
//             swTestNewSuscription(
//               (
//                 await app.currentUser
//                   .mongoClient("mongodb-atlas")
//                   .db("calendary")
//                   .collection("users")
//                   .findOne({
//                     user_id: Realm.BSON.ObjectId(app.currentUser.id),
//                   })
//               ).notifications.suscription
//             );
//           })
//         }
//       >
//         <h2 className={`mb-3 text-2xl font-semibold`}>
//           Test Notification
//           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
//         </h2>
//         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
//       </a>
//       <a
//         className="cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-black hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         onClick={async () => {
//           // onServiceWorker(async (sw) => {
//           console.log(process.env.NEXT_PUBLIC_VAPID_KEY);
//           swTestNewSuscription(
//             (
//               await app.currentUser
//                 .mongoClient("mongodb-atlas")
//                 .db("calendary")
//                 .collection("users")
//                 .findOne({
//                   user_id: Realm.BSON.ObjectId(app.currentUser.id),
//                 })
//             ).notifications.suscription,
//             "local"
//           );
//           // });
//         }}
//       >
//         <h2 className={`mb-3 text-2xl font-semibold`}>
//           Test Local Notification
//           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
//         </h2>
//         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
//       </a>
//       <a
//         className="cursor-pointer  group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-black hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         onClick={() =>
//           onServiceWorker(async (sw) => {
//             swUpdateSuscription(await swHandleSuscription(sw));
//           })
//         }
//       >
//         <h2 className={`mb-3 text-2xl font-semibold`}>
//           Add Notification Suscription
//           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none"></span>
//         </h2>
//         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
//       </a>
//     </div>

//     <input
//       className="text-black"
//       type="datetime-local"
//       value={meetDate}
//       onChange={(ev) => {
//         console.log(ev.target.value);
//         setMeetDate(ev.target.value);
//       }}
//     />

//     <input
//       className="text-black"
//       value={meetDescription}
//       onChange={(ev) => {
//         setMeetDescription(ev.target.value);
//       }}
//     />
//   </>
// );

export default dynamic(async () => await Promise.resolve(Home), {
  ssr: false,
});

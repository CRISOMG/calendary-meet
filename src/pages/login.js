import { Inter } from "next/font/google";
import * as Realm from "realm-web";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import { useFormik } from "formik";
import * as yup from "yup";

import { useAuthActions } from "../redux/slices/auth";
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import { useSnackbar } from "notistack";

import { useRealmServices } from "../hooks/useRealm";

const inter = Inter({ subsets: ["latin"] });

function Login() {
  const app = new Realm.App({ id: "devicesync-avzpr" });
  const { enqueueSnackbar } = useSnackbar();
  const { retryConfirmation, login, confirmUser } = useRealmServices();
  const router = useRouter();

  const handleConfirmationUser = async ({ token, tokenId }) => {
    try {
      const data = await confirmUser({
        token,
        tokenId,
      });
      enqueueSnackbar("ususario confirmado con exito, puede iniciar sesion.", {
        variant: "success",
      });
      return data;
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  useEffect(() => {
    const { token, tokenId } = router.query;
    if (token && tokenId) {
      handleConfirmationUser({ token, tokenId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  const { dispatchSetUser } = useAuthActions();

  const [loading, setLoading] = useState(false);
  const { errors, values, handleChange, handleSubmit, handleBlur } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: yup.object().shape({
      email: yup.string().required("Campo requerido."),
      password: yup.string().required("Campo requerido."),
    }),
    onSubmit: async (values) => {
      try {
        const { email, password } = values;
        setLoading(true);
        const user = await login({ email, password });
        dispatchSetUser(user.toJSON());

        router.push("/");
      } catch (error) {
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <main className={`min-h-screen md:p-24 ${inter.className}`}>
      <div className="mb-12 mx-auto w-min">
        <h1 className="calendary-logo">
          Calendary
          <span className="calendary-sub-logo">Meeting</span>
        </h1>
      </div>

      <div className="border border-white rounded p-4  mx-auto w-min mt-[10%]">
        <h1 className="font-grand-hotel font-bold text-4xl leading-relaxed">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mt-2" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            type="email"
            name="email"
            onChange={handleChange}
            className="text-black "
          />
          {errors.email && (
            <small className="text-red-500 mb-4">{errors.email}</small>
          )}

          <label className="mt-2" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            onChange={handleChange}
            className="text-black "
          />
          {errors.password && (
            <small className="text-red-500 mb-4">{errors.password}</small>
          )}

          <Link className="text-center hover:underline" href={"/registro"}>
            registrar un nuevo usuario
          </Link>

          <button
            disabled={loading}
            className="mt-4 border border-white rounded w-min px-4 py-2 mx-auto hover:bg-white hover:text-black"
            type="submit"
          >
            {loading ? (
              <CircularProgress
                sx={{ color: "black", "&:hover": { color: "black" } }}
                size={35}
              />
            ) : (
              "Enviar"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

export default dynamic(async () => await Promise.resolve(Login), {
  ssr: false,
});

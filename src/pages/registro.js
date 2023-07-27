import { Inter } from "next/font/google";
import * as Realm from "realm-web";

import { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import { useFormik } from "formik";
import * as yup from "yup";

import { useAuthActions } from "../redux/slices/auth";
import { CircularProgress } from "@mui/material";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

function Registro() {
  const app = new Realm.App({ id: "devicesync-avzpr" });

  const router = useRouter();

  const register = async ({ email, password }) => {
    try {
      const res = await app.emailPasswordAuth.registerUser({
        email,
        password,
      });

      console.log(res);
      return res;
    } catch (error) {
      console.error(error);
    }
  };

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
        const user = await register({ email, password });
        alert("se te envio un correo con el link de confirmacion.");
        router.push("login");
      } catch (error) {
        alert("Ha ocurrido un error", error.message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <main className={`min-h-screen p-24 ${inter.className}`}>
      <div className="mb-12 mx-auto w-min">
        <h1 className="calendary-logo">
          Calendary
          <span className="calendary-sub-logo">Meeting</span>
        </h1>
      </div>

      <div className="border border-white rounded p-4  mx-auto w-min mt-[10%]">
        <h1 className="font-grand-hotel font-bold text-4xl leading-relaxed">
          Registro
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

          <Link className="text-center hover:underline" href={"/login"}>
            login
          </Link>

          <button
            disabled={loading}
            className="mt-4 border border-white rounded w-min px-4 py-2 mx-auto hover:bg-white hover:text-black"
            type="submit"
          >
            {loading ? (
              <CircularProgress
                sx={{ color: "white", "&:hover": { color: "black" } }}
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

export default dynamic(async () => await Promise.resolve(Registro), {
  ssr: false,
});
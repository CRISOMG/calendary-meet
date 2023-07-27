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
  InputLabel,
  TextField,
} from "@mui/material";
import {
  Close,

} from "@mui/icons-material";

import { useFormik } from "formik";
import * as yup from "yup";
const inter = Inter({ subsets: ["latin"] });

import { useSnackbar } from "notistack";

export const CreateMeetModal = ({ onClose, open, onSubmit }) => {
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
              <InputLabel htmlFor="description">Descripcion</InputLabel>
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

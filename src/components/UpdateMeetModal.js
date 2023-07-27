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

import { useSnackbar } from "notistack";
import { useSelectorAuth } from "@/redux/slices/auth";

import { useFormik } from "formik";
import * as yup from "yup";
const inter = Inter({ subsets: ["latin"] });

export const UpdateMeetModal = ({ onClose, open, onSubmit }) => {
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
              <InputLabel htmlFor="description">Descripcion</InputLabel>
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

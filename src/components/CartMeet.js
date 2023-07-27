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

export const CardMeet = (params) => {
  const { title, description, meet, remember, onDelete, onUpdate } = params;
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
            onClick={onDelete}
          >
            <Delete sx={{ color: "white" }} fontSize="inherit" />
          </IconButton>
          <IconButton
            disableRipple
            sx={{ backgroundColor: "black" }}
            size="large"
            onClick={onUpdate}
          >
            <Edit sx={{ color: "white" }} fontSize="inherit" />
          </IconButton>
        </div>
      </div>
    </>
  );
};

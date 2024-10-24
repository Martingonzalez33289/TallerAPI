import express from "express";
import { configFileRouter} from "./configpc.file.router.js";

const router = express.Router();

export function routerConfig (app) {
 
    app.use("/api/v1", router);

    router.use( "/configpc", configFileRouter );
}
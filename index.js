import express, { query } from 'express';
import {read, write} from "./src/files.js";
import Joi from 'joi';
import nodemailer from 'nodemailer';
import { routerConfig } from './routes/index.js';
import fs from 'fs';
import dayjs from 'dayjs';


const app = express();
app.use(express.json());


// Registrar todas las solicitudes

app.use((req, res, next) => {
    const fecha = dayjs().format('HH:mm DD-MM-YYYY');
    const entrada = `${fecha} [${req.method}] ${req.path} ${JSON.stringify(req.headers)}\n`;

    fs.appendFile("access_log.txt", entrada, (err) => {
        if (err) {
            console.error(err);
            console.log('registro NO guardado')
        }
        else{
            console.log('registro guardado')
        }
    });

    next();
});

routerConfig(app);

app.listen(3200, () => {
    console.log('server is running on port 3200');
});

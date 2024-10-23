import express, { query } from 'express';
import {read, write} from "./src/files.js";
import Joi from 'joi';
import nodemailer from 'nodemailer';

const app = express();
app.use(express.json());

// Controlador de Emails
const transportador = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'gestoremails9@gmail.com',
        pass: 'Gestorgenerico10'
    }
});
    
const configpc = read();
    
const mail = {
    from: 'Remitente',
    to: 'carlos.castaneda@ucaldas.edu.com',
    subject: 'Configuracion de Pc´s',
    text: configpc
};



//Validaciones de joi
const validarConfiguracion = (config) => {
    const schema = Joi.object({
        cpu: Joi.string().min(1).max(50).required(),
        gpu: Joi.string().min(1).max(50).required(),
        ram: Joi.string().min(1).max(50).required(),
        psu: Joi.string().min(1).max(50).required(),
        almacenamiento: Joi.string().min(1).max(50).required(),
        precio: Joi.number().integer().min(1).required(),
    });
    return schema.validate(config);
};


// Obtener todas las configuraciones
app.get ('/configpc', (req, res) => {
    const configpc = read();
    res.json(configpc);

    // Enviamos el email
    transportador.sendMail(mail, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Correo enviado: ' + info.response);
      });
});

//Obtener un registro por ID
app.get ('/configpc/:id', (req, res) => {
    const configpc = read();
    const config = configpc.find(config => config.id === parseInt(req.params.id));
    if(config){
        res.json(config);
    }
    else{
        res.status(404).json('Error = Configuracion no encontrada');
    }   
});

// Generar un nuevo registro
app.post('/configpc', (req,res)=>{

    const {error} = validarConfiguracion(req.body);
    if(error) return res.status(400).json(error.details[0].message);

    const configpc = read();
    const config = {
        id: configpc.length + 1,
        ...req.body,
    };

    configpc.push(config);
    write(configpc);
    res.status(201).json()
    res.send('Configuracion Creada');
});

// Actualizar registro
app.put('/configpc/:id', (req,res)=>{
    const {error} = validarConfiguracion(req.body);
    if(error) return res.status(400).json(error.details[0].message);
    const configpc = read();
    let config = configpc.find(config => config.id === parseInt(req.params.id));
    if (config){
        config = {
            ...config,
            ...req.body
        };

    configpc[
        configpc.findIndex(c => c.id === parseInt(req.params.id))
    ] = config;
    write(configpc);
    res.json(config);
    res.send('Actualizacion realizada');
    }
    else{
        res.status(404).json('Error: configuracion no existente');
    }      
});

// Eliminar registro
app.delete('/configpc/:id', (req,res)=>{
    const configpc = read();
    const config = configpc.find(config => config.id === parseInt(req.params.id));
    if (config){
        configpc.splice(configpc.findIndex(config => config.id === parseInt(req.params.id)), 1);
        write(configpc);
        res.json(config);
        res.send('Se elimino el registro');
    }
    else{
        res.status(404).json('Error: configuracion no existente');
    }       
});

app.listen(3200, () => {
    console.log('server is running on port 3200');
});

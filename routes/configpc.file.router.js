import express, { query } from 'express';
import {read, write} from "../src/files.js";
import Joi from 'joi';
import nodemailer from 'nodemailer';
import dayjs from 'dayjs';

export const configFileRouter = express.Router();


// Controlador de Emails
const transportador = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'gestoremails9@gmail.com',
        pass: 'Gestorgenerico10'
    }
});
    
let configpc = read();
    
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
configFileRouter.get ('/', (req, res) => {
    let configpc = read();

    // limitar por precio maximo
    let precioObtenido = req.query.precio;
    let limite = req.query.limite;
    console.log('precio' + precioObtenido);
    if(precioObtenido === undefined){
        res.json(configpc);
    }
    else
    {     
        const precios = configpc.filter(configpc => configpc.precio < precioObtenido);
        if (limite && !isNaN(limite)) {
            configpc = configpc.slice(0, parseInt(limite));
        } 
        res.json(configpc);
    }
        
    res.status(201).json()
    // Enviamos el email
    transportador.sendMail(mail, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Correo enviado: ' + info.response);
      });
});

//Obtener un registro por ID
configFileRouter.get ('/:id', (req, res) => {
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
configFileRouter.post('/', (req,res)=>{

    const {error} = validarConfiguracion(req.body);
    if(error) return res.status(400).json(error.details[0].message);

    const ipReq = req.ip;
    const crearFecha = dayjs().format('HH:mm DD-MM-YYYY');   


    const configpc = read();
    const config = {
        id: configpc.length + 1,
        ...req.body,
        ip: ipReq,
        fecha: crearFecha
    };
    console.log(ipReq);

    configpc.push(config);
    write(configpc);
    res.status(201).json()
    res.send('Configuracion Creada');
});

// Actualizar registro
configFileRouter.put('/:id', (req,res)=>{
    const {error} = validarConfiguracion(req.body);
    if(error) return res.status(400).json(error.details[0].message);

    const ipReq = req.ip;
    const crearFecha = dayjs().format('HH:mm DD-MM-YYYY');

    const configpc = read();
    let config = configpc.find(config => config.id === parseInt(req.params.id));
    if (config){
        config = {
            ...config,
            ...req.body,
            ip: ipReq,
            fecha: crearFecha
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
configFileRouter.delete('/:id', (req,res)=>{
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

// Actualizar registro
configFileRouter.put('/actualizarCampos', (req,res)=>{
    let serial = req.body;
    const fechaActual = dayjs().format('HH:mm DD-MM-YYYY'); 

    console.log(serial);

    configpc = configpc.map(config => { return {
        ...config,
        serial,
        updated_at: fechaActual
    };
    
    });
    write(configpc);

    res.status(201).json('registros actualizados');    
});



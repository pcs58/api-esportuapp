"use strict";

const express = require("express");
const app = express();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

//Swagger documentation
const swaggerOptions = {
    swaggerDefinition:{
      swagger: '2.0',
      info:{
          version: "1.1.0",
          title: "Documentacion Servidor EsportUApp",
          description: "Raquel Ortega, Janira Elías, Noelia Quiles y Pablo Carrillo.",
          servers: ["http://localhost:3000"]
      },
      tags:[{"name":"GET","description":"Llamadas GET"},{"name":"POST","description":"Llamadas POST"},{"name":"PUT","description":"Llamadas PUT"},{"name":"DELETE","description":"Llamadas DELETE"}],
      securityDefinitions:{
        Bearer: {
          type: 'apiKey',
          scheme: 'bearer',
          name: 'Authorization',
          in: 'header'
        }
      } 
    },
    basePath: "/",
    //APIs a documentar
    apis:["./index.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

module.exports = app;
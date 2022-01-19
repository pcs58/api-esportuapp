const { application } = require('express');
var express = require("express")
var cors = require('cors')
var router = require('./routes/router');

var app = express()
app.use(express.json())
app.use(cors())
app.use("/api-docs", require("./api-docs"))
app.use('/esportuapp',router);


var listener = app.listen(process.env.PORT||3000, () => {
  console.log(`Servidor en el puerto ${listener.address().port}`);
});

// routes
app.use('/', require('./routes/user'));
app.use('/', require('./routes/socio'));
app.use('/', require('./routes/reservas'));
app.use('/', require('./routes/informes'));
app.use('/', require('./routes/webmaster'));

//Docu Swager 

/**
 * @swagger
 * /esportuapp/login:
 *  post:
 *      summary: Iniciar sesión a un usuario mediante su correo y contraseña.
 *      tags:
 *        - POST
 *      description: Un usuario cualquiera podrá iniciar sesión para acceder a ciertas llamadas que necesitan autenticación mediante su correo electrónico y su contraseña.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in : body
 *          name: Login
 *          schema:
 *            type: object
 *            properties:
 *              login:
 *                type: string 
 *              password:
 *                type: string
 *      responses:
 *        200:
 *          description: Se ha iniciado sesión con éxito.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              token:
 *                type: string 
 *              rol:
 *                type: integer 
 *        403:
 *          description: Los datos introducidos son incorrectos y no se ha podido loggear al usuario.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string         
 */

/**
 * @swagger
 * /esportuapp/registro:
 *  post:
 *      summary: Registra a un usuario mediante su nombre, apellido, correo, contraseña.
 *      tags:
 *        - POST
 *      description: Un usuario cualquiera podrá registrarse y se creará una solicitud de usuario.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in : body
 *          name: Login
 *          schema:
 *            type: object
 *            properties:
 *              nombre:
 *                type: string
 *              apellidos:
 *                type: string
 *              login:
 *                type: string 
 *              password:
 *                type: string
 *      responses:
 *        201:
 *          description: Se ha registrado el usuario con éxito.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              token:
 *                type: string 
 *              rol:
 *                type: integer 
 *        403:
 *          description: Los datos introducidos son incorrectos.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string         
 */

/**
 * @swagger
 * /esportuapp/tipoUsuario/{email}:
 *  get:
 *      summary: Comprobar si un usuario es socio dado su email.
 *      tags:
 *        - GET
 *      security:
 *        - Bearer: []
 *      description: Un usuario logueado podrá comprobar si un usuario es socio a partir de su email.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in: path
 *          name: email
 *          description: El email del usuario a comprobar si es socio o no
 *      responses:
 *        200:
 *          description: Es Socio/No es Socio.
 *          schema:
 *            type: object
 *            properties:
 *              esSocio:
 *                type: boolean     
 */

/**
 * @swagger
 * /esportuapp/deportesActividadesDisponibles/{fecha}/{hora}/{deporteActividad}:
 *  get:
 *      summary: Obtiene los deportes o actividades disponibles dada una fecha y una hora.
 *      tags:
 *        - GET
 *      description: Un usuario podrá comprobar si hay actividades o deportes dada una fecha y una hora.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: fecha
 *          in: path
 *          schema:
 *            type: string
 *            format: date
 *        - name: hora
 *          in: path
 *          schema:
 *            type: string
 *        - name: deporteActividad
 *          in: path
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Deportes y actividades disponibles.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    deporte:
 *                      type: integer     
 */

/**
 * @swagger
 * /esportuapp/pistasSalasDisponibles/{fecha}/{hora}/{tipoDeporteActividad}/{deporteActividad}:
 *  get:
 *      summary: Obtiene las salas o pistas disponibles dada una fecha, una hora y un deporte o actividad.
 *      tags:
 *        - GET
 *      description: Un usuario podrá comprobar si hay Salas o Pistas disponibles dada una fecha, una hora y un deporte o actividad.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: fecha
 *          in: path
 *          schema:
 *            type: string
 *            format: date
 *        - name: hora
 *          in: path
 *          schema:
 *            type: string
 *        - name: tipoDeporteActividad
 *          in: path
 *          schema:
 *            type: integer
 *        - name: deporteActividad
 *          in: path
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Salas o pistas disponibles.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    idpista/idsala:
 *                      type: integer
 *                    nombre:
 *                      type: string   
 */

/**
 * @swagger
 * /esportuapp/reserva:
 *  post:
 *      summary: Realiza una reserva
 *      tags:
 *        - POST
 *      security:
 *        - Bearer: []
 *      description: Un usuario podrá realizar una reserva a nombre de un socio o de un no socio. En este último caso, la reserva la haría un recepcionista.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in : body
 *          name: Reserva
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              fecha:
 *                type: string
 *                format: date
 *              hora:
 *                type: string
 *              da:
 *                type: integer
 *              ps:
 *                type: integer
 *              tipo:
 *                type: string
 *      responses:
 *        200:
 *          description: Resultado de la operación.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string 
 */

/**
 * @swagger
 * /esportuapp/aceptarSolicitud:
 *  put:
 *      summary: Acepta una solicitud de socio
 *      tags:
 *        - PUT
 *      security:
 *        - Bearer: []
 *      description: Un usuario webmaster podrá aceptar la solicitud de socio de un usuario.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in : body
 *          name: Solicitud
 *          schema:
 *            type: object
 *            properties:
 *              idUsuario:
 *                type: integer
 *      responses:
 *        200:
 *          description: Resultado de la operación.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string 
 */

/**
 * @swagger
 * /esportuapp/rechazarSolicitud:
 *  put:
 *      summary: Rechaza una solicitud de socio
 *      tags:
 *        - PUT
 *      security:
 *        - Bearer: []
 *      description: Un usuario webmaster podrá rechazar la solicitud de socio de un usuario.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in : body
 *          name: Solicitud
 *          schema:
 *            type: object
 *            properties:
 *              idUsuario:
 *                type: integer
 *      responses:
 *        200:
 *          description: Resultado de la operación.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string 
 */

/**
 * @swagger
 * /esportuapp/cancelarReserva:
 *  put:
 *      summary: Cancela una reserva de un socio
 *      tags:
 *        - PUT
 *      security:
 *        - Bearer: []
 *      description: Un usuario socio podrá cancelar una reserva.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in : body
 *          name: Reserva
 *          schema:
 *            type: object
 *            properties:
 *              id_reserva_sesion:
 *                type: integer
 *              tipo:
 *                type: string
 *      responses:
 *        200:
 *          description: Resultado de la operación.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string 
 */

/**
 * @swagger
 * /esportuapp/resumenReserva/{idpistaactividad}/{deporteActividad}/{email}:
 *  get:
 *      summary: Obtiene el precio dada una pista o una actividad.
 *      tags:
 *        - GET
 *      security:
 *        - Bearer: []
 *      description: Un usuario podrá obtener el precio de una pista o una actividad dada su id.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: idpistaactividad
 *          in: path
 *          schema:
 *            type: integer
 *        - name: deporteActividad
 *          in: path
 *          schema:
 *            type: string
 *        - name: email
 *          in: path
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: precio de la pista o de la actividad.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              precio:
 *                type: number
 *                format: float
 *              monedero:
 *                type: number
 *                format: float
 */

/**
 * @swagger
 * /esportuapp/resumenReserva/{idpistaactividad}/{deporteActividad}:
 *  get:
 *      summary: Obtiene el precio dada una pista o una actividad.
 *      tags:
 *        - GET
 *      security:
 *        - Bearer: []
 *      description: Un usuario podrá obtener el precio de una pista o una actividad dada su id.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: idpistaactividad
 *          in: path
 *          schema:
 *            type: integer
 *        - name: deporteActividad
 *          in: path
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: precio de la pista o de la actividad.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              precio:
 *                type: number
 *                format: float
 *              monedero:
 *                type: number
 *                format: float
 */

/**
 * @swagger
 * /esportuapp/bloquearUsuario:
 *  put:
 *      summary: Bloquea a un socio
 *      tags:
 *        - PUT
 *      security:
 *        - Bearer: []
 *      description: Un usuario webmaster podrá bloquear a un socio.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in : body
 *          name: Solicitud
 *          schema:
 *            type: object
 *            properties:
 *              idUsuario:
 *                type: integer
 *      responses:
 *        200:
 *          description: Resultado de la operación.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string 
*/

/**
 * @swagger
 * /esportuapp/calendario/{fecha}:
 *  get:
 *      summary: Obtiene las sesiones programadas durante una semana.
 *      tags:
 *        - GET
 *      parameters:
 *        - name: fecha
 *          in: path
 *          schema:
 *            type: string
 *            format: date
 *      description: Cualquier usuario podrá consultar las sesiones que habrá la semana seleccionada.
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Sesiones.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id_reserva_sesion:
 *                      type: integer
 *                    actividad_deporte:
 *                      type: string
 *                    sala_pista:
 *                      type: string
 *                    fecha:
 *                      type: string
 */

/**
 * @swagger
 * /esportuapp/misReservas:
 *  get:
 *      summary: Obtiene las reservas realizadas por un socio.
 *      tags:
 *        - GET
 *      security:
 *        - Bearer: []
 *      description: Un usuario socio logueado podrá obtener sus reservas realizadas.
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Mis reservas.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id_reserva_sesion:
 *                      type: integer
 *                    actividad_deporte:
 *                      type: string
 *                    sala_pista:
 *                      type: string
 *                    fecha:
 *                      type: string
 *                    sesiones:
 *                      type: integer     
 */

/**
 * @swagger
 * /esportuapp/informeSocios/{year}:
 *  get:
 *      summary: Obtiene el informe de nuevos socios cada mes.
 *      tags:
 *        - GET
 *      security:
 *        - Bearer: []
 *      description: Un usuario webmaster podrá obtener un informe annual de cuantos usuarios nuevos hay al mes.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: year
 *          in: path
 *          schema:
 *            type: integer
 *      responses:
 *        200:
 *          description: Resultado del informe.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    UsuariosAlMes:
 *                      type: integer
 */

/**
 * @swagger
 * /esportuapp/desbloquearUsuario:
 *  put:
 *      summary: Desbloquea a un socio
 *      tags:
 *        - PUT
 *      security:
 *        - Bearer: []
 *      description: Un usuario webmaster podrá desbloquear a un socio.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in : body
 *          name: Solicitud
 *          schema:
 *            type: object
 *            properties:
 *              idUsuario:
 *                type: integer
 *      responses:
 *        200:
 *          description: Resultado de la operación.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string 
 */

/**
 * @swagger
 * /esportuapp/socio:
 *  get:
 *      summary: Obtiene las sesiones con fecha de hoy y en las que esta apuntado el usuario.
 *      tags:
 *        - GET
 *      description: Obtiene las sesiones con fecha de hoy y en las que esta apuntado el usuario.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: login
 *          in: path
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Resultado de la operación.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    sesiones:
 *                      type: integer     
 */

/**
 * @swagger
 * /esportuapp/informeClases/{year}:
 *  get:
 *      summary: Obtiene los informes de las clases realizadas en el club durante un año.
 *      tags:
 *        - GET
 *      security:
 *        - Bearer: []
 *      description: Informe sobre el número de socios que asisten a cada actividad durante cada mes de un año en concreto
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: year
 *          in: path
 *          schema:
 *            type: string
 *            format: date
 *      responses:
 *        200:
 *          description: Informe de las actividades.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    actividad:
 *                      type: string
 *                    mes:
 *                      type: integer
 *                    plazas:
 *                      type: integer  
 */

/**
 * @swagger
 * /esportuapp/informePistas/{year}:
 *  get:
 *      summary: Obtiene los informes de las pistas reservadas en el club durante un año.
 *      tags:
 *        - GET
 *      security:
 *        - Bearer: []
 *      description: Informe sobre el número de socios que reservan cada pista durante cada mes de un año en concreto
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: year
 *          in: path
 *          schema:
 *            type: string
 *            format: date
 *      responses:
 *        200:
 *          description: Informe de las actividades.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    pista:
 *                      type: string
 *                    mes:
 *                      type: integer
 *                    reservas:
 *                      type: integer  
 */

/**
 * @swagger
 * /esportuapp/pista:
 *  post:
 *      summary: Crea una pista
 *      tags:
 *        - POST
 *      security:
 *        - Bearer: []
 *      description: Crear pista
 *      consumes:
 *        - multipart/form-data
 *      parameters:
 *        - in : formData
 *          name: nombre
 *          type: string
 *        - in : formData
 *          name: descripcion
 *          type: string
 *        - in : formData
 *          name: precioSocio
 *          type: number
 *          format: float
 *        - in : formData
 *          name: precioNoSocio
 *          type: number
 *          format: float
 *        - in : formData
 *          name: capacidad
 *          type: integer
 *        - in : formData
 *          name: deporte
 *          type: integer
 *        - in : formData
 *          name: file
 *          type: file           
 *      responses:
 *        201:
 *          description: Pista registrada correctamente.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string      
 *        500:
 *          description: Error del servidor. Ha ocurrido un error y no se ha podido registrar la empresa.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string 
 */

/**
 * @swagger
 * /esportuapp/actividad:
 *  post:
 *      summary: Registrar una nueva actividad
 *      tags:
 *        - POST
 *      security:
 *        - Bearer: []
 *      description: Crear actividad
 *      consumes:
 *        - multipart/form-data
 *      parameters:
 *        - in : formData
 *          name: nombre
 *          type: string
 *        - in : formData
 *          name: descripcion
 *          type: string
 *        - in : formData
 *          name: precioSocio
 *          type: number
 *          format: float
 *        - in : formData
 *          name: precioNoSocio
 *          type: number
 *          format: float
 *        - in : formData
 *          name: file
 *          type: file           
 *      responses:
 *        201:
 *          description: Actividad registrada correctamente.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string      
 *        500:
 *          description: Error del servidor. Ha ocurrido un error y no se ha podido registrar la actividad.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string 
 */

/**
 * @swagger
 * /esportuapp/sala:
 *  post:
 *      summary: Crea una sala
 *      tags:
 *        - POST
 *      security:
 *        - Bearer: []
 *      description: Crear sala
 *      consumes:
 *        - multipart/form-data
 *      parameters:
 *        - in : formData
 *          name: nombre
 *          type: string
 *        - in : formData
 *          name: descripcion
 *          type: string
 *        - in : formData
 *          name: capacidad
 *          type: integer
 *        - in : formData
 *          name: file
 *          type: file           
 *      responses:
 *        201:
 *          description: Sala registrada correctamente.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string      
 *        500:
 *          description: Error del servidor. Ha ocurrido un error y no se ha podido registrar la empresa.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string 
 */

/**
 * @swagger
 * /esportuapp/listadoInstalaciones/{fecha}/{hora}/{deporte}:
 *  get:
 *      summary: Obtiene las pistas disponibles o no dada una fecha, una hora y un deporte.
 *      tags:
 *        - GET
 *      description: Un usuario podrá comprobar si las Pistas disponibles o no dada una fecha, una hora y un deporte.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: fecha
 *          in: path
 *          schema:
 *            type: string
 *            format: date
 *        - name: hora
 *          in: path
 *          schema:
 *            type: string
 *        - name: deporte
 *          in: path
 *          schema:
 *            type: integer
 *      responses:
 *        200:
 *          description: Pistas disponibles.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: integer
 *                    deporte:
 *                      type: integer
 *                    pista:
 *                      type: string
 *                    fecha:
 *                      type: string
 *                      format: date
 *                    disponible:
 *                      type: boolean  
 */

/**
 * @swagger
 * /esportuapp/clase:
 *  post:
 *      summary: Crear una sesión de una actividad.
 *      tags:
 *        - POST
 *      security:
 *        - Bearer: []
 *      description: Un usuario webmaster podrá crear una sesión de una actividad..
 *      produces:
 *        - application/json
 *      parameters:
 *        - in : body
 *          name: Clase
 *          schema:
 *            type: object
 *            properties:
 *              actividad:
 *                type: integer 
 *              descripcion:
 *                type: string
 *              fecha:
 *                type: string
 *                format: date
 *              hora:
 *                type: string
 *              clase:
 *                type: integer
 *              entrenador:
 *                type: integer
 *      responses:
 *        200:
 *          description: Se ha creado la clase con éxito.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *        403:
 *          description: Forbidden. Debes ser usuario Webmaster para poder acceder a este recurso.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string         
 */

/**
 * @swagger
 * /esportuapp/salasDisponibles/{fecha}/{hora}:
 *  get:
 *      summary: Obtiene las salas disponibles dada una fecha y una hora.
 *      tags:
 *        - GET
 *      security:
 *        - Bearer: []
 *      description: Un usuario podrá comprobar si hay Salas disponibles dada una fecha y una hora.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: fecha
 *          in: path
 *          schema:
 *            type: string
 *            format: date
 *        - name: hora
 *          in: path
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Salas disponibles.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    idsala:
 *                      type: integer
 *                    nombre:
 *                      type: string
 *                    capacidad:
 *                      type: integer  
 */

/**
 * @swagger
 * /esportuapp/entrenadores/{fecha}/{hora}:
 *  get:
 *      summary: Obtiene los entrenadores que estan disponibles en la fecha y la hora indicadas.
 *      tags:
 *        - GET
 *      security:
 *        - Bearer: []
 *      description: Cualquier usuario podrá consultar los entrenadores que estan disponibles en la fecha y hora indicada.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: fecha
 *          in: path
 *          schema:
 *            type: string
 *            format: date
 *        - name: hora
 *          in: path
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Entrenadores.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: integer
 *                    nombre:
 *                      type: string
 *                    apellidos:
 *                      type: string
 */

/**
 * @swagger
 * /esportuapp/fotos:
 *  get:
 *      summary: Obtiene las fotos de la BD, tanto de pistas como de actividades y salas.
 *      tags:
 *        - GET
 *      description: Obtiene las fotos de la BD, tanto de pistas como de actividades y salas.
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Imagenes.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              message:
 *                type: string
 *              results:
 *                type: array
 *                items:
 *                  type: string
 */

const {secret} = require('../config')
var jwt = require('jwt-simple');
var db = require('../database');
var moment = require('moment');
const con = require('../database');

// Funciones auxiliares
function llamadaBD(sql, pCallback){
    db.query(sql, function (err, result) {
      if (err) db.rollback( function () { 
        throw err });
      if(pCallback) pCallback(result);
      else return undefined;
    });
}

function getTokenFromAuthHeader(pet) {
    var cabecera = pet.header('Authorization')
    if (cabecera) {
        //Parte el string por el espacio. Si está, devolverá un array de 2
        //la 2ª pos será lo que hay detrás de "Bearer"
        var campos = cabecera.split(' ')
        if (campos.length>1 && cabecera.startsWith('Bearer')) {
            return campos[1] 
        }
    }
    return undefined
}

const ReservasMethods = {
    deportesActividadesDisponibles: function(pet, resp){
        var horaBuscada = pet.params.hora
        var fechaBuscada = pet.params.fecha
        var deporteActividad = pet.params.deporteActividad
        var sql= "";
        if(deporteActividad == 'd')
            sql = `SELECT DISTINCT deporte
            FROM    pistas
            WHERE   NOT EXISTS
                    (
                    SELECT  NULL
                    FROM    reservas r1
                    WHERE   r1.pista = pistas.id
                    AND fecha_reserva = '` + fechaBuscada +` `+ horaBuscada + `:00'
                    )
                    AND NOT EXISTS 
                    (
                        SELECT  NULL
                        FROM    bloqueos b1
                        WHERE   b1.pista = pistas.id
                        AND curdate() between b1.fecha_fin and b1.fecha_inicio
                    )`;
        else
            sql = `SELECT distinct id as deporte
            FROM    actividades
            WHERE EXISTS
                (
                SELECT  NULL
                FROM    sesiones s1, salas sa1
                WHERE   s1.actividad = actividades.id and s1.sala = sa1.id
                AND fecha_sesion = '` + fechaBuscada + ` ` + horaBuscada + `:00'
                AND plazas_ocupadas < sa1.capacidad
                and (suspendida != (1) or suspendida is null)
                )`
        llamadaBD(sql,function (result) {
                resp.status(200);
                resp.send({status:200, message: "OK", results: result});
        })
    },
    pistasSalasDisponibles: function(pet, resp){
        var horaBuscada = pet.params.hora
        var fechaBuscada = pet.params.fecha
        var deporteActividad = pet.params.deporteActividad
        var tipoDeporteActividad = pet.params.tipoDeporteActividad
        var sql= "";
        if(deporteActividad == 'd')
            sql = `SELECT id as pista_sala, nombre
            FROM    pistas
            WHERE   NOT EXISTS
                (
                    SELECT  NULL
                    FROM    reservas r1
                    WHERE   r1.pista = pistas.id
                    AND fecha_reserva = '` + fechaBuscada +` `+ horaBuscada + `:00'
                )
                AND NOT EXISTS 
                (
					SELECT  NULL
					FROM    bloqueos b1
					WHERE   b1.pista = pistas.id
					AND curdate() between b1.fecha_fin and b1.fecha_inicio
				)
            AND pistas.deporte=` + tipoDeporteActividad;
        else
            sql = `SELECT sala as pista_sala, salas.nombre 
            FROM sesiones left join salas on sesiones.sala = salas.id
            WHERE EXISTS
            (
                SELECT  NULL
                FROM    sesiones s1, salas sa1
                WHERE  s1.sala = sa1.id
                AND fecha_sesion = '` + fechaBuscada + ` ` + horaBuscada + `:00'
                AND plazas_ocupadas < sa1.capacidad
                AND (suspendida != (1) or suspendida is null)
            ) 
            AND sesiones.actividad=` + tipoDeporteActividad;
        llamadaBD(sql,function (result) {
                resp.status(200);
                resp.send({status:200, message: "OK", results: result});
        })
        
    },
    resumenReserva: function (pet,res)
    {
        var idpistaactividad = pet.params.idpistaactividad;
        var deporteActividad = pet.params.deporteActividad;
        var emailReserva = pet.params.email;
        var sql="";
        var GetPrecio = function (UsuarioReserva) {
            if(deporteActividad == "d")
            {
                sql= "select " + (UsuarioReserva!=undefined && UsuarioReserva.rol == 1? "precioSocio" : "precioNoSocio") + " as precio from pistas where id=" + idpistaactividad;
                llamadaBD(sql, function(result){
                    if(result.length == 0)
                    {
                        res.status(404);
                        res.send({status:404, message: "La pista seleccionada no existe."});
                    }
                    else
                    {
                        if(UsuarioReserva != undefined && UsuarioReserva.rol == 1)
                        {
                            sql="select monedero from usuarios where id=" + UsuarioReserva.id
                            llamadaBD(sql, function (result1){
                                if(result1.length==0)
                                {
                                    res.status(404);
                                    res.send({status:404, message: "El usuario no existe."});
                                }
                                else
                                {
                                    res.status(200);
                                    res.send({status:200, precio: result[0].precio, monedero: result1[0].monedero});
                                }
                            })
                        }
                        else
                        {
                            res.status(200);
                            res.send({status:200, precio: result[0].precio});
                        }
                    }
                })
            }
            else{
                sql= "select " + (UsuarioReserva!=undefined && UsuarioReserva.rol == 1? "precioSocio" : "precioNoSocio") + " as precio from actividades where id=" + idpistaactividad;
                llamadaBD(sql, function(result){
                    if(result.length == 0)
                    {
                        res.status(404);
                        res.send({status:404, message: "La actividad seleccionada no existe."});
                    }
                    else
                    {
                        if(UsuarioReserva != undefined && UsuarioReserva.rol == 1)
                        {
                            sql="select monedero from usuarios where id=" + UsuarioReserva.id
                            llamadaBD(sql, function (result1){
                                if(result1.length==0)
                                {
                                    res.status(404);
                                    res.send({status:404, message: "El usuario no existe."});
                                }
                                else
                                {
                                    res.status(200);
                                    res.send({status:200, precio: result[0].precio, monedero: result1[0].monedero});
                                }
                            })
                        }
                        else
                        {
                            res.status(200);
                            res.send({status:200, precio: result[0].precio});
                        }
                    }
                })
            }
        }
        var pCallback = function (UsuarioLogueado) {
            if(UsuarioLogueado.rol == 2)
            {
                ReservasMethods.RolByEmail(emailReserva, GetPrecio)
            }
            else if(UsuarioLogueado.rol == 1)
            {
                GetPrecio(UsuarioLogueado)
            }
            else{
                res.status(403);
                res.send({status:403, message: "Forbidden. No puedes realizar esta acción."});
            }
            
        }
        ReservasMethods.getIdEmailRolFromToken(pet, pCallback)
    },
    crearReserva: function (pet,res)
    {
        var emailReserva = pet.body.email;
        var fechaBuscada= pet.body.fecha;
        var horaBuscada= pet.body.hora;
        var deporteActividadBuscado = pet.body.da;
        var pistaSalaBuscada = pet.body.ps;
        var deporteActividad = pet.body.tipo;
        var sql ="";
        var reservaCommit = function () {
            con.commit(function(err) {
                if (err) { 
                con.rollback(function() {
                    res.status(500);
                    res.send({status:500, message:"Server Error"})
                });
                }
                else
                {
                    res.status(201);
                    res.send({status:201, message: "Su reserva se ha completado con éxito"});
                }
            });
        }

        var pCallback = function (emailYRol) {
            if(emailYRol == undefined || emailYRol.rol == 4 || emailYRol.rol == 3 || emailYRol.rol == 5)
            {
                res.status(403);
                res.send({status:403, message: "No tienes permisos para crear una reserva."});
            }
            else
            {
                if(deporteActividad == 'a')
                {
                    sql = `SELECT sesiones.id, actividades.precioSocio, actividades.precioNoSocio
                    FROM sesiones left join salas on sesiones.sala = salas.id
                    left join actividades on sesiones.actividad = actividades.id
                    WHERE sesiones.sala=` + pistaSalaBuscada + ` AND fecha_sesion='` + fechaBuscada + ` ` + horaBuscada + `:00'
                        AND actividad=` + deporteActividadBuscado + ` AND sesiones.plazas_ocupadas < salas.capacidad and (sesiones.suspendida != (1) or sesiones.suspendida is null)`;
                    llamadaBD(sql, function(result1)
                    {
                        if(result1.length==0)
                        {
                            res.status(404);
                            res.send({status:404, message: "Ups, acaban de realizar una reserva y ya no quedan plazas en esa sala. Intenta introducir otra sala."});
                        }
                        else
                        {
                            var reservaSocio_NoSocio = function(UsuarioReserva){
                                sql="insert into usuarios_sesion (id_usuario, id_sesion, fecha_alta) VALUES (" + UsuarioReserva.id + ", " + result1[0].id + ", now());" +
                                "update sesiones set plazas_ocupadas=plazas_ocupadas+1 where id=" + result1[0].id;
                                con.beginTransaction();
                                llamadaBD(sql,function(){
                                    if(UsuarioReserva.rol == 1)
                                    {
                                        if(UsuarioReserva.monedero >= result1[0].precioSocio)
                                        {
                                            sql="update usuarios set monedero = monedero-" + result1[0].precioSocio + " where id=" + UsuarioReserva.id;
                                            llamadaBD(sql, function(){
                                                reservaCommit();
                                            })
                                        }
                                        else{
                                            con.rollback();
                                            res.status(400);
                                            res.send({status:400, message: "No hay suficiente dinero en tu monedero. Recarga tu monedero."});
                                        } 
                                    }
                                    else
                                        reservaCommit();
                                })
                            }
                            if(emailYRol.rol == 2)
                            {
                                var pCallback2 = function (Usuario)
                                {
                                    if(Usuario == undefined)
                                    {
                                        sql = `insert into usuarios (email,rol) values ('` + emailReserva + `',3); SELECT LAST_INSERT_ID() as id;`;
                                        con.beginTransaction();
                                        llamadaBD(sql,function(result2)
                                        {
                                            sql="insert into usuarios_sesion (id_usuario, id_sesion, fecha_alta) VALUES (" + result2[0].id + ", " + result1[0].id + ", now()); " +
                                            "update sesiones set plazas_ocupadas=plazas_ocupadas+1 where id=" + result1[0].id;
                                            llamadaBD(sql,function(){
                                                reservaCommit();
                                            })
                                        })
                                    }
                                    else if(Usuario.rol == 1 || Usuario.rol == 3)
                                        reservaSocio_NoSocio(Usuario);
                                    else
                                    {
                                        res.status(400);
                                        res.send({status:400, message: "Hubo un fallo al procesar su solicitud"});
                                    }
                                }
                                ReservasMethods.RolByEmail(email, pCallback2);
                                
                            }
                            else
                                reservaSocio_NoSocio(emailYRol);
                        }
                    })
                }     
                else
                {
                    sql = ` SELECT  NULL
                    FROM    reservas r1
                    WHERE   r1.pista = ` + pistaSalaBuscada + `
                    AND fecha_reserva = '` + fechaBuscada + ` ` + horaBuscada + `:00'`
                    llamadaBD(sql,function (result1) {
                        if(result1.length!=0)
                        {
                            res.status(404);
                            res.send({status:404, message: "Ups, parece que ya han reservado esa pista. Intenta introducir otra hora."});
                        }
                        else
                        {
                            var reservaSocio_NoSocio = function(UsuarioReserva){
                                sql=`INSERT INTO reservas (fecha_alta, fecha_reserva, usuario, pista) 
                                    VALUES (now(), '` + fechaBuscada + ` ` + horaBuscada + `:00', ` + UsuarioReserva.id + `, ` + pistaSalaBuscada + `)`;
                                con.beginTransaction();
                                llamadaBD(sql,function(){
                                    if(UsuarioReserva.rol == 1)
                                    {
                                        sql="select precioSocio from pistas where id=" + pistaSalaBuscada;
                                        llamadaBD(sql,function (precioSocioPista){
                                            if(UsuarioReserva.monedero >= precioSocioPista[0].precioSocio)
                                            {
                                                sql="update usuarios set monedero = monedero-" + precioSocioPista[0].precioSocio + " where id=" + UsuarioReserva.id;
                                                llamadaBD(sql, function(){
                                                    reservaCommit();
                                                })
                                            }
                                            else
                                            {
                                                con.rollback();
                                                res.status(400);
                                                res.send({status:400, message: "No hay suficiente dinero en tu monedero. Recarga tu monedero."});
                                            }
                                        })
                                    }
                                    else
                                        reservaCommit();
                                })
                            }
                            if(emailYRol.rol == 2){
                                var pCallback2 = function (Usuario) {
                                    if(Usuario == undefined)
                                    {
                                        sql = `insert into usuarios (email,rol) values ('` + emailReserva + `',3);`;
                                        con.beginTransaction();
                                        llamadaBD(sql,function(result2)
                                        {
                                            sql=`INSERT INTO reservas (fecha_alta, fecha_reserva, usuario, pista) 
                                            VALUES (now(), '` + fechaBuscada + ` ` + horaBuscada + `:00', ` + result2.insertId + `, ` + pistaSalaBuscada + `)`;
                                            llamadaBD(sql,function(){
                                                reservaCommit();
                                            })
                                        })
                                    }
                                    else if(Usuario.rol == 1 || Usuario.rol == 3)
                                        reservaSocio_NoSocio(Usuario);
                                    else
                                    {
                                        res.status(400);
                                        res.send({status:400, message: "Hubo un fallo al procesar su solicitud"});
                                    }
                                }
                                ReservasMethods.RolByEmail(emailReserva,pCallback2);
                                
                            }
                            else
                                reservaSocio_NoSocio(emailYRol) 
                        }
                    })
                }
            }
        }
        ReservasMethods.getIdEmailRolFromToken(pet, pCallback)
    },
    RolByEmail: function (email, pCallback){
        var sql="select id,rol,monedero from usuarios where email='" + email + "'";
        llamadaBD(sql, function(result)
        {
            pCallback(result.length == 0? undefined : {
                id:result[0].id,
                rol:result[0].rol,
                monedero: result[0].monedero
            })
        })
    },
    getIdEmailRolFromToken: function (pet,pCallback){
        var token = getTokenFromAuthHeader(pet)
        var login = jwt.decode(token, secret)
        var sql="select id,email, rol, monedero from usuarios where email='" + login.login + "'";
        llamadaBD(sql,function (result){
            pCallback(result.length == 0? undefined : {
                id:result[0].id,
                email: result[0].email,
                rol:result[0].rol,
                monedero:result[0].monedero
            })
        })
    },
    misReservas: function (pet,res)
    {
        ReservasMethods.getIdEmailRolFromToken(pet,
            function (UsuarioLogueado) {
                if(!UsuarioLogueado && UsuarioLogueado.rol != 1)
                {
                    res.status(403);
                    res.send({status:403, message: "No tienes permisos para crear una reserva."});
                }
                else
                {
                    var sql= `SELECT sesiones.id as idsesion,sesiones.suspendida,actividades.nombre as nombreactividad, salas.nombre as nombresala,sesiones.fecha_sesion 
                        FROM usuarios_sesion 
                            LEFT JOIN sesiones on id_sesion = sesiones.id 
                            LEFT JOIN actividades on sesiones.actividad = actividades.id
                            LEFT JOIN salas on sesiones.sala = salas.id
                        WHERE id_usuario=` + UsuarioLogueado.id + ` AND usuarios_sesion.fecha_cancelacion is null
                        ORDER BY fecha_sesion DESC`;
                        
                    llamadaBD(sql, function (result) {
                        var misReservas = [];
                        for(var i=0; i<result.length; i++)
                        {
                            var sesion= {
                                id_reserva_sesion: result[i].idsesion,
                                actividad_deporte: result[i].nombreactividad,
                                sala_pista: result[i].nombresala,
                                fecha: result[i].fecha_sesion,
                                pasada: (result[i].fecha_sesion > new Date()? false : true),
                                suspendida: (result[i].suspendida==null? false : result[i].suspendida.lastIndexOf(1)!==-1),
                                tipo: "a"
                            }
                            misReservas.push(sesion)
                        }
                        sql= `SELECT reservas.id as idreserva, pistas.nombre as nombrepista,
                            CASE 
                                WHEN pistas.deporte = 1 THEN 'Fútbol'
                                WHEN pistas.deporte = 2 THEN 'Pádel'
                                WHEN pistas.deporte = 3 THEN 'Tenis'
                                WHEN pistas.deporte = 4 THEN 'Bádminton'
                                WHEN pistas.deporte = 5 THEN 'Voleibol'
                                END as deporte, fecha_reserva, suspendida
                            FROM reservas
                            LEFT JOIN pistas on reservas.pista = pistas.id
                            WHERE reservas.usuario = ` + UsuarioLogueado.id +` AND reservas.fecha_cancelacion is null
                            ORDER BY fecha_reserva DESC`;
                        llamadaBD(sql, function (result1){
                            console.log(result1)
                            for(var i=0; i<result1.length; i++)
                            {
                                var reserva= {
                                    id_reserva_sesion: result1[i].idreserva,
                                    actividad_deporte: result1[i].deporte,
                                    sala_pista: result1[i].nombrepista,
                                    fecha: result1[i].fecha_reserva,
                                    suspendida: (result1[i].suspendida==null? false : result1[i].suspendida.lastIndexOf(1)!==-1),
                                    pasada: (result1[i].fecha_reserva > new Date()? false : true),
                                    tipo: "d"
                                }
                                misReservas.push(reserva)
                            }
                            var misReservasOrdered = ReservasMethods.orderArrayByFechaHoraASC(misReservas)
                            misReservasOrdered.map( function(reserva) {
                                reserva.fecha=ReservasMethods.formatDateTime(reserva.fecha)
                                return reserva
                            })
                            res.status(200);
                            res.send({status:200, message: "OK", results: misReservasOrdered});
                        })
                    })
                }
            })
    },
    orderArrayByFechaHoraASC: function(array)
    {
        for(var i=0; i<array.length-1; i++){
            if(array[i].fecha < array[i+1].fecha)
            {
                var aux=array[i];
                array[i]=array[i+1];
                array[i+1]=aux;
            }
        }
        return array;
    },
    formatDateTime: function(fecha){
        var fechaformateada = fecha.getDate() + ' - ' + fecha.toLocaleString('es-es', {month: 'long' }).charAt(0).toUpperCase() + fecha.toLocaleString('es-es', {month: 'long' }).slice(1) + ' - ' + fecha.getFullYear() + ' | ' + fecha.getHours() + ':' + (fecha.getMinutes()<10?'0':'') + fecha.getMinutes();
        return fechaformateada;
    },
    cancelReserva: function (pet, res){
        ReservasMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado){
            var tipo = pet.body.tipo; //a o d (actividad o deporte)
            var id_reserva_sesion = pet.body.id_reserva_sesion;
            if(tipo == "a")
            {
                var sql = "select NULL from usuarios_sesion where id_usuario=" + UsuarioLogueado.id + " and id_sesion=" + id_reserva_sesion + " and fecha_cancelacion is null";
                llamadaBD(sql, function(result){
                    if(result.length == 0)
                    {
                        res.status(404);
                        res.send({status:404, message: "La reserva seleccionada no existe"});
                    }
                    else{
                        sql = "update usuarios_sesion set fecha_cancelacion=now() where id_usuario = " + UsuarioLogueado.id;
                        con.beginTransaction();
                        llamadaBD(sql, function (){
                            sql=`SELECT precioSocio 
                                FROM usuarios_sesion 
                                LEFT JOIN sesiones on usuarios_sesion.id_sesion = sesiones.id
                                LEFT JOIN actividades on sesiones.actividad = actividades.id
                                WHERE usuarios_sesion.id_usuario=` + UsuarioLogueado.id + ` and usuarios_sesion.id_sesion=` + id_reserva_sesion;
                                llamadaBD(sql, function (result1) {
                                    sql = `update usuarios set monedero=monedero+` + result1[0].precioSocio + ` where usuarios.id=` + UsuarioLogueado.id;
                                    llamadaBD(sql, function (){
                                        sql =`update sesiones set plazas_ocupadas=plazas_ocupadas-1 where id=` + id_reserva_sesion;
                                        llamadaBD(sql, function(){
                                            con.commit(function(err) {
                                                if (err) { 
                                                con.rollback(function() {
                                                    res.status(500);
                                                    res.send({status:500, message:"Server Error"})
                                                });
                                                }
                                                else
                                                {
                                                    res.status(200);
                                                    res.send({status:200, message: "Su cancelación se ha completado con éxito"});
                                                }
                                            });
                                        })
                                    })
                                })
                        })
                    }
                })
            }
            else{
                var sql = "select NULL from reservas where id=" + id_reserva_sesion;
                llamadaBD(sql, function(result){
                    if(result.length == 0)
                    {
                        res.status(404);
                        res.send({status:404, message: "La reserva seleccionada no existe"});
                    }
                    else{
                        sql = "update reservas set fecha_cancelacion=now() where usuario = " + UsuarioLogueado.id;
                        con.beginTransaction();
                        llamadaBD(sql, function (){
                            sql=`SELECT precioSocio 
                                FROM reservas 
                                LEFT JOIN pistas on reservas.pista = pistas.id
                                WHERE reservas.id=` + id_reserva_sesion;
                                llamadaBD(sql, function (result1) {
                                    sql = `update usuarios set monedero=monedero+` + result1[0].precioSocio + ` where usuarios.id=` + UsuarioLogueado.id;
                                    llamadaBD(sql, function (){
                                        con.commit(function(err) {
                                            if (err) { 
                                            con.rollback(function() {
                                                res.status(500);
                                                res.send({status:500, message:"Server Error"})
                                            });
                                            }
                                            else
                                            {
                                                res.status(200);
                                                res.send({status:200, message: "Su cancelación se ha completado con éxito"});
                                            }
                                        });
                                    })
                                })
                        })
                    }
                })
            } 
        })
    }
}

module.exports = ReservasMethods;
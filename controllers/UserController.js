const {secret} = require('../config')
var jwt = require('jwt-simple');
var db = require('../database');
var moment = require('moment');
const { json } = require('express');
const con = require('../database');
const { format } = require('mysql');
const { formatDateTime } = require('./ReservasController');

// Funciones auxiliares
function llamadaBD(sql, pCallback){
    db.query(sql, function (err, result) {
      if (err) db.rollback( function () { 
        throw err });
      if(pCallback) pCallback(result);
      else return undefined;
    });
}

function encriptado(password){
    var crypto = require('crypto')
    var shasum = crypto.createHash('sha256')
    shasum.update(password)
    var password_encrypt = shasum.digest('hex')
    return password_encrypt;
}

function loginOK(result, resp){
    var payload = {
    login: result[0].email,
    exp: moment().add(60, 'minutes').valueOf()
    }
    var token = jwt.encode(payload, secret)
    resp.status(200);
    resp.send({status:200, message:"OK", token:token, rol: result[0].rol})
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

// Métodos exportados
const UserMethods = {
    login: function(pet, resp){
        var loginBuscado = pet.body.login
        var passwordBuscado = encriptado(pet.body.password)
        var sql = "select * from esportuapp.usuarios where email='" + loginBuscado + "' and password='" + passwordBuscado + "' and bloqueado=0 and solicitud=1";
        llamadaBD(sql,function (result) {
            if (result.length != 0) {
                loginOK(result, resp);
            }
            else{
                //resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
        })
    },

    registro: function(pet, resp){
        const emailBuscado = pet.body.email
        const nombreBuscado = pet.body.nombre
        const apellidosBuscado = pet.body.apellidos
        const passwordBuscado = encriptado(pet.body.password);
        console.log(passwordBuscado)

        const sql = "insert into esportuapp.usuarios (email, nombre, apellidos, password, rol, bloqueado, solicitud) values ('" + emailBuscado + "','" + nombreBuscado + "','" + apellidosBuscado + "','" + passwordBuscado + "',1,0,0)";
        llamadaBD(sql,function (result) {
            if (result.length != 0) {
                //registroOK(result, resp);
                resp.status(201).json({message: "ok"})
            }
            else{
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
        })
    },    
    getIdEmailRolFromToken: function (pet,pCallback){
        var token = getTokenFromAuthHeader(pet)
        var login = jwt.decode(token, secret)
        var sql="select id,email, rol from usuarios where email='" + login.login + "'";
        llamadaBD(sql,function (result){
            if(result.length!=0)
            {
                UsuarioLogueado = {
                    id: result[0].id,
                    email: result[0].email,
                    rol: result[0].rol
                }
                pCallback(UsuarioLogueado);
            } 
            else
                return undefined;
        })
    },
    aceptarSolicitud: function (pet,resp){
        var pCallback = function (UsuarioLogueado){
            var usuarioAceptar = pet.body.idUsuario;
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var sql= "select null from usuarios where id=" + usuarioAceptar;
                llamadaBD(sql, function(result){
                    if(result.length==0)
                    {
                        resp.status(404);
                        resp.send({status:403, message: "Bad Request: Usuario no encontrado"});
                    }
                    else{
                        sql="update usuarios set solicitud=1, fecha_socio=now() where id=" + usuarioAceptar;
                        llamadaBD(sql, function(result1){
                            if(result1.affectedRows == 0)
                            {
                                resp.status(500);
                                resp.send({status:500, message:"Server Error"})
                            }
                            else{
                                resp.status(200);
                                resp.send({status:200, message: "Solicitud aceptada correctamente"});
                            }

                        })
                    }
                })
            }
        } 
        UserMethods.getIdEmailRolFromToken(pet, pCallback)       
    },
    rechazarSolicitud: function (pet,resp){
        var pCallback = function (UsuarioLogueado){
            var usuarioRechazar = pet.body.idUsuario;
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var sql= "select null from usuarios where id=" + usuarioRechazar;
                llamadaBD(sql, function(result){
                    if(result.length==0)
                    {
                        resp.status(404);
                        resp.send({status:403, message: "Bad Request: Usuario no encontrado"});
                    }
                    else{
                        sql="update usuarios set solicitud=2 where id=" + usuarioRechazar;
                        llamadaBD(sql, function(result1){
                            if(result1.affectedRows == 0)
                            {
                                resp.status(500);
                                resp.send({status:500, message:"Server Error"})
                            }
                            else{
                                resp.status(200);
                                resp.send({status:200, message: "Solicitud rechazada correctamente"});
                            }

                        })
                    }
                })
            }
        }
        UserMethods.getIdEmailRolFromToken(pet,pCallback);
        
    },
    tipoUsuario: function(pet, resp){
        var emailBuscado = pet.params.email
        var sql = "select email from usuarios where rol=1 and email='" + emailBuscado + "'";
        llamadaBD(sql,function (result) {
            resp.status(200);
            resp.send({esSocio: (result.length == 0? false : true)});
        })
    },
    chequeaJWT: function(pet, resp, next){
        var token = getTokenFromAuthHeader(pet)
        var es_valido = false;
        if(token != undefined)
        {
          try{
            jwt.decode(token, secret)
            es_valido = true;
          }
          catch(error){
            es_valido = false;
          }
        }
          
        if (es_valido) {
            next()
        }
        else {
            resp.status(403);
            resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
      
        }
    },
    getCalendarioPrecios: function (pet, res){
        var fecha = pet.params.fecha;
        var sql = `select actividades.nombre, actividades.precioSocio, actividades.precioNoSocio, sesiones.fecha_sesion 
                    FROM sesiones LEFT JOIN actividades on sesiones.actividad = actividades.id
                    WHERE fecha_sesion BETWEEN '` + fecha + `' AND DATE_ADD('` + fecha + `', INTERVAL 7 DAY) and (sesiones.suspendida != (1) or sesiones.suspendida is null)`
        llamadaBD(sql, function (result){
            res.status(200);
            res.send({status:200, message: "OK", result: result});
        })
    },
    listadoInstalaciones: function (pet,res){
        var fechaBuscada = pet.params.fecha;
        var horaBuscada = pet.params.hora;
        var deporteBuscado = pet.params.deporte;
        var sql = `SELECT id, nombre, deporte
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
        AND pistas.deporte=` + deporteBuscado;
        llamadaBD(sql, function(result){
            sql ="select id,deporte,nombre from pistas where deporte=" + deporteBuscado;
            llamadaBD(sql, function(result1){
                res.status(200);
                var resultados = [];
                for(var i=0;i < result1.length;i++){
                    var instalacion={
                        id:result1[i].id,
                        deporte:result1[i].deporte,
                        pista:result1[i].nombre,
                        fecha: UserMethods.formatDateTime(new Date(fechaBuscada +`T`+ horaBuscada + `:00`)),
                        disponible: (UserMethods.estaReservada(result1[i].id,result))
                    }
                    resultados.push(instalacion)
                }
                res.send({status:200, message: "OK", result: resultados});
            })
        })
    },
    estaReservada: function (idABuscar,arrayDisponibilidad){
        for(var j=0;j<arrayDisponibilidad.length;j++){
            if(arrayDisponibilidad[j].id==idABuscar)
                return true;
        }
        return false;
    },
    listadoActividades: function (pet,res){
        var fechaBuscada = pet.params.fecha;
        var horaBuscada = pet.params.hora;
        var actividadBuscada = pet.params.actividad;
        var sql = `SELECT sesiones.id as id_sesion, salas.id as id_sala, salas.nombre, sesiones.actividad, salas.capacidad, sesiones.plazas_ocupadas
        FROM sesiones left join salas on sesiones.sala = salas.id
        where sesiones.actividad=` + actividadBuscada + `  and 
        fecha_sesion= '` + fechaBuscada + ` ` + horaBuscada + `:00'
        and (suspendida != (1) or suspendida is null)`
        llamadaBD(sql, function(result){  
            var resultados = [];
            for(var i=0;i < result.length;i++){
                var sesion={
                    id:result[i].idsesion,
                    actividad:result[i].actividad,
                    sala:result[i].nombre,
                    idsala: result[i].id_sala,
                    fecha: UserMethods.formatDateTime(new Date(fechaBuscada +`T`+ horaBuscada + `:00`)),
                    disponible: (UserMethods.estaDisponible(result[i].plazas_ocupadas,result[i].capacidad)),
                    capacidad: result[i].capacidad,
                    plazas_ocupadas: result[i].plazas_ocupadas
                }
                resultados.push(sesion)
            }
            res.status(200);
            res.send({status:200, message: "OK", result: resultados});
        })
    },
    formatDateTime: function(fecha){
        var fechaformateada = fecha.getDate() + ' - ' + fecha.toLocaleString('es-es', {month: 'long' }).charAt(0).toUpperCase() + fecha.toLocaleString('es-es', {month: 'long' }).slice(1) + ' - ' + fecha.getFullYear() + ' | ' + fecha.getHours() + ':' + (fecha.getMinutes()<10?'0':'') + fecha.getMinutes();
        return fechaformateada;
    },
    estaDisponible: function(plazas_ocupadas,capacidad){
        if(plazas_ocupadas<capacidad)
            return true
        return false;
    },
    getFotos: function (pet, res){
        var sql = `select imagen from salas where imagen is not null`
        var imagenes = []
        llamadaBD(sql, function (result){
            for(var i=0; i<result.length; i++){
                imagenes.push(result[i].imagen);
            }
            sql="select imagen from actividades where imagen is not null"
            llamadaBD(sql,function (result1){
                for(var i=0; i<result1.length;i++){
                    imagenes.push(result1[i].imagen)
                }
                sql="select imagen from pistas where imagen is not null"
                llamadaBD(sql, function (result2){
                    for(var i=0; i<result2.length;i++){
                        imagenes.push(result2[i].imagen)
                    }
                    res.status(200);
                    res.send({status:200, message: "OK", result: imagenes});
                })
            })
        })
    },

}

module.exports = UserMethods;
const {secret} = require('../config')
var jwt = require('jwt-simple');
var db = require('../database');
const fetch = require('node-fetch');
const { json, response } = require('express');

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

// Métodos exportados
const SocioMethods = {
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

    home: function(pet, resp){
        var pCallback = function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 1)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{   
                var sql = `select sesiones.* from esportuapp.sesiones, esportuapp.usuarios, esportuapp.usuarios_sesion 
                where usuarios.email = '` + UsuarioLogueado.email + `' and sesiones.id = id_sesion and usuarios.id = id_usuario and 
                DATE_FORMAT(fecha_sesion , '%Y%m%d') = DATE(NOW()) and (sesiones.suspendida != (1) or sesiones.suspendida is null);`;
    
                llamadaBD(sql,function (result) {
                    resp.status(200);
                    resp.send({sesiones: result})
                })
            }
        }
        SocioMethods.getIdEmailRolFromToken(pet, pCallback)
    },

    datosUsuario: function(pet, resp){
        var pCallback = function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 1)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var sql = "select usuarios.*, roles.nombre as rol from usuarios, roles where usuarios.email = '" + UsuarioLogueado.email + "' and roles.id = usuarios.rol";

                llamadaBD(sql,function (result) {
                    resp.status(200);
                        resp.send(result[0])
                })
            }
        }
        SocioMethods.getIdEmailRolFromToken(pet, pCallback)
    },

    anyadirMonedero: function(pet, resp){
        var pCallback = function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 1)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var token;
                
                fetch("https://tpvviw.tk/api/v1/auth/authtoken", {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    }, 
                    body: JSON.stringify({
                        "apiKey": "89aba131-7997-44a46-bbqc8-8hc25cd4081c",
                    })
                })
                .then((response)=>response.json())
                .then(response =>  {
                    token = response.authToken

                    fetch("https://tpvviw.tk/api/v1/payments/", {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'Authorization': "Bearer " + token, 
                            'Content-Type': 'application/json'
                        }, 
                        body: JSON.stringify({
                            "amount": pet.body.amount,
                            "concept": "Añadir dinero al monedero",
                            "refence": "124234x",
                            "creditCard": {
                            "owner": "Pepa Cerdá",
                            "number": pet.body.number,
                            "ccv": pet.body.cvv,
                            "expiry": pet.body.expiry
                            }
                        })
                    })
                    .then((response)=>response.json())
                    .then(response =>  {
                        if(response.status == 'ACCEPTED') {
                            var sql = "update esportuapp.usuarios set monedero = monedero + " + pet.body.amount + " where usuarios.id = " + UsuarioLogueado.id;
                            llamadaBD(sql,function (result) {
                                sql = "select monedero from esportuapp.usuarios where id = " + UsuarioLogueado.id ;
                                llamadaBD(sql,function (result) {
                                    resp.status(200);
                                    resp.send(({status:200, message: "OK", result: {resultado: response.statusDetail, monedero: result[0].monedero}}))
                                })    
                            })
                        }
                        else{
                            sql = "select monedero from esportuapp.usuarios where id = " + UsuarioLogueado.id ;
                            llamadaBD(sql,function (result) {
                                resp.status(400);
                                resp.send(({status:400, message: "ERROR", result: {resultado: response.statusDetail, monedero: result[0].monedero}}))
                            })
                        }
                        }).catch(error => {console.log(error)});
                })
            }
        }
        SocioMethods.getIdEmailRolFromToken(pet, pCallback)
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
}

module.exports = SocioMethods;
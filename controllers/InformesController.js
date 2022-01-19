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

const InformesMethods = {
    informeSocios: function (pet, res){
        InformesMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado) {
            if(UsuarioLogueado.rol != 5)
            {
                res.status(403);
                res.send({status:403, message: "Forbbiden: No tienes permisos para realizar esta acción"});
            }
            else{
                var year = pet.params.year;
                var sql = "select";
                for(var i=1; i<13; i++){
                    sql+="(select count(*) from usuarios where month(usuarios.fecha_socio) = " + i + " and year(usuarios.fecha_socio) = " + year + ") as users" + i;
                    if(i<12)
                        sql+= ","
                }
                llamadaBD(sql,function (results){
                    var response= {
                        status: 200,
                        message: "OK",
                        results: []
                    }
                    for(var i=1; i<13; i++)
                    {
                        var resultByMonth = {
                            "reservas": results[0]["users" + i]
                        }
                        response.results.push(resultByMonth);
                    }
                    res.status(200);
                    res.send(response);
                })
                
            }
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
    }
}
module.exports = InformesMethods;
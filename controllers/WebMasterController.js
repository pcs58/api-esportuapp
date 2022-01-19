const {secret} = require('../config')
var jwt = require('jwt-simple');
var db = require('../database');
var moment = require('moment');
const con = require('../database');
var fs = require("fs");
var path = require('path');

// Funciones auxiliares
function llamadaBD(sql, pCallback, folder){
    con.query(sql, function (err, result) {
        if (err) con.rollback( function () { 
          if(folder && fs.existsSync(folder) ){
            fs.rmdirSync(folder, { recursive: true });
          }
          
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
const WebMasterMethods = {   
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
    
    bloquear: function (pet,resp){
        var pCallback = function (UsuarioLogueado){
            var usuarioAceptar = pet.body.idUsuario;
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var sql= "select rol from usuarios where id=" + usuarioAceptar;
                llamadaBD(sql, function(result){
                    if(result.length==0)
                    {
                        resp.status(404);
                        resp.send({status:403, message: "Bad Request: Usuario no encontrado"});
                    }
                    else{
                        if(result[0].rol == 5)
                        {
                            resp.status(403);
                            resp.send({status:403, message: "Forbbiden: No se puede bloquear a un WebMaster"});
                        }
                        else{
                            sql="update usuarios set bloqueado=true where id=" + usuarioAceptar;
                            llamadaBD(sql, function(result1){
                                if(result1.affectedRows == 0)
                                {
                                    resp.status(500);
                                    resp.send({status:500, message:"Server Error"})
                                }
                                else{
                                    resp.status(200);
                                    resp.send({status:200, message: "Usuario bloqueado"});
                                }
    
                            })
                        }
                    }
                })
            }
        } 
        WebMasterMethods.getIdEmailRolFromToken(pet, pCallback)       
    },

    desbloquear: function (pet,resp){
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
                        resp.status(403);
                        resp.send({status:403, message: "Bad Request: Usuario no encontrado"});
                    }
                    else{
                        sql="update usuarios set bloqueado=0 where id=" + usuarioAceptar;
                        llamadaBD(sql, function(result1){
                            if(result1.affectedRows == 0)
                            {
                                resp.status(500);
                                resp.send({status:500, message:"Server Error"})
                            }
                            else{
                                resp.status(200);
                                resp.send({status:200, message: "Usuario desbloqueado"});
                            }

                        })
                    }
                })
            }
        } 
        WebMasterMethods.getIdEmailRolFromToken(pet, pCallback)       
    },

    listar: function (pet,resp){
        var pCallback = function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var sql= "select usuarios.nombre, usuarios.apellidos, usuarios.id, roles.nombre as rol, usuarios.bloqueado from usuarios, roles where rol != 5 and roles.id = rol";
                llamadaBD(sql, function(result){
                    if(result.length==0)
                    {
                        resp.status(403);
                        resp.send({status:403, message: "Bad Request: Usuario no encontrado"});
                    }
                    else{
                        resp.status(200);
                        resp.json({usuarios: result});
                    }

                })
            }
        }
        WebMasterMethods.getIdEmailRolFromToken(pet, pCallback)       
    },

    listarSolicitudes: function (pet,resp){
        var pCallback = function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var sql= "select usuarios.nombre, usuarios.id,usuarios.apellidos, usuarios.nombre, roles.nombre as rol from usuarios, roles where roles.id = rol and solicitud=0";
                llamadaBD(sql, function(result){
                    if(result.length==0)
                    {
                        resp.status(403);
                        resp.send({status:403, message: "Bad Request: Usuario no encontrado"});
                    }
                    else{
                        resp.status(200);
                        resp.json({usuarios: result});
                    }

                })
            }
        }
        WebMasterMethods.getIdEmailRolFromToken(pet, pCallback)       
    },

    informeClases: function (pet,resp){
        var pCallback = function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var year = pet.params.year;
                var sql = "select";
                for(var i=1; i<13; i++){
                    for(var j=1; j<6; j++){
                        sql += "(select count(*) FROM esportuapp.sesiones where sesiones.actividad = " + j + " and year(fecha_sesion) = " + year + " and month(fecha_sesion) =  " + i + " GROUP BY actividad) as users" + i + j;
                        if(j<5)
                            sql += ","
                    }
                    if(i<12)
                        sql += ","
                }
                llamadaBD(sql, function(results){
                    var response= {
                        status: 200,
                        message: "OK",
                        results: []
                    }

                    for(var i=1; i<13; i++)
                    {
                        for(var j=1; j<6; j++){
                            if( results[0]["users" + i + j] == null){
                                var resultByMonth = {
                                    ["reservas"]: 0
                                }
                            }
                            else{
                                var resultByMonth = {
                                    ["reservas"]: results[0]["users" + i + j]
                                }
                            }
                            response.results.push(resultByMonth); 
                        }
                    }
                    resp.status(200);
                    resp.send({"status":200, "message":"ok", "results": response.results});
                })
            }
        }
        WebMasterMethods.getIdEmailRolFromToken(pet, pCallback)       
    },

    informePistas: function (pet,resp){
        var pCallback = function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var year = pet.params.year;
                var sql = "select";
                for(var i=1; i<13; i++){
                    for(var j=1; j<6; j++){
                        sql += "(select count(*) FROM esportuapp.reservas, esportuapp.pistas where pista = pistas.id and pistas.deporte = " + j + " and year(fecha_reserva) = " + year + " and month(fecha_reserva) = " + i + " GROUP BY pistas.deporte) as users" + i + j;
                        if(j<5)
                            sql += ","
                    }
                    if(i<12)
                        sql += ","
                }
                llamadaBD(sql, function(results){
                    var response= {
                        status: 200,
                        message: "OK",
                        results: []
                    }

                    for(var i=1; i<13; i++)
                    {
                        for(var j=1; j<6; j++){
                            if( results[0]["users" + i + j] == null){
                                var resultByMonth = {
                                    ["reservas"]: 0
                                }
                            }
                            else{
                                var resultByMonth = {
                                    ["reservas"]: results[0]["users" + i + j]
                                }
                            }
                            response.results.push(resultByMonth); 
                        }
                    }
                    resp.status(200);
                    resp.send({"status":200, "message":"ok", "results": response.results});
                })
            }
        }
        WebMasterMethods.getIdEmailRolFromToken(pet, pCallback)   
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

    crearPista : function (pet, res){
        WebMasterMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var nombrePista = pet.body.nombre;
                var descripcion = pet.body.descripcion;
                var precioSocio = pet.body.precioSocio;
                var precioNoSocio = pet.body.precioNoSocio;
                var capacidad = pet.body.capacidad;
                var deporte = pet.body.deporte;

                var sql = `INSERT INTO pistas (nombre,descripcion,precioSocio,precioNoSocio,capacidad,deporte) 
                            VALUES ('` + nombrePista.replace(/'/g, "\\'") + `','` + descripcion + `', ` + precioSocio + `, ` + precioNoSocio + `, ` + capacidad + `, ` + deporte + `);
                            SELECT LAST_INSERT_ID() as id;`;
                con.beginTransaction();
                llamadaBD(sql, function (result){
                    var partialPath="..\\..\\EsportUApp-Client\\src\\assets\\pistas\\" + result[1][0].id + "\\" + pet.file.originalname;
                    var partialPathBD="../../assets/pistas/" + result[1][0].id + "/" + pet.file.originalname;
                    var file = path.join(__dirname, partialPath)
                    fs.readFile(pet.file.path, function (err, data) {
                        var checkExists = path.join(__dirname,"..\\..\\EsportUApp-Client\\src\\assets\\pistas\\" + result[1][0].id);
                        if (!fs.existsSync(checkExists)){
                            fs.mkdirSync(checkExists);
                        }
                        fs.writeFile(file, data, function (err) {
                            if( err ){
                                resp.status(500);
                                resp.send({status:500, message:"Server Error"})
                            }
                            else{
                                var updateEmpresaImagen="Update pistas set imagen='" + partialPathBD + "' where id=" + result[1][0].id;
                                llamadaBD(updateEmpresaImagen, function (result) {
                                    con.commit(function(err) {
                                    if (err) { 
                                        fs.unlinkSync(checkExists);
                                        con.rollback(function() {
                                        res.status(500);
                                        res.send({status:500, message:"Server Error"})
                                        });
                                    }
                                    else
                                    {
                                        res.status(201)
                                        res.send({status:201,message:"Recurso creado correctamente"})
                                    }
                                    });
                                }, checkExists)
                            }
                        });
                    });
                })
            }
        })
    },
    crearSala : function (pet, res){
        WebMasterMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                res.status(403);
                res.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var nombreSala = pet.body.nombre;
                var descripcion = pet.body.descripcion;
                var capacidad = pet.body.capacidad;
                var sql = `INSERT INTO salas (nombre,descripcion,capacidad) 
                            VALUES ('` + nombreSala.replace(/'/g, "\\'") + `','` + descripcion + `', ` + capacidad + `);
                            SELECT LAST_INSERT_ID() as id;`;
                con.beginTransaction();
                llamadaBD(sql, function (result){
                    var partialPath="..\\..\\EsportUApp-Client\\src\\assets\\salas\\" + result[1][0].id + "\\" + pet.file.originalname;
                    var partialPathBD="../../assets/salas/" + result[1][0].id + "/" + pet.file.originalname;
                    var file = path.join(__dirname, partialPath)
                    fs.readFile(pet.file.path, function (err, data) {
                        var checkExists = path.join(__dirname,"..\\..\\EsportUApp-Client\\src\\assets\\salas\\" + result[1][0].id);
                        if (!fs.existsSync(checkExists)){
                            fs.mkdirSync(checkExists);
                        }
                        fs.writeFile(file, data, function (err) {
                            if( err ){
                                resp.status(500);
                                resp.send({status:500, message:"Server Error"})
                            }
                            else{
                                var updateEmpresaImagen="Update salas set imagen='" + partialPathBD + "' where id=" + result[1][0].id;
                                llamadaBD(updateEmpresaImagen, function (result) {
                                    con.commit(function(err) {
                                    if (err) { 
                                        fs.unlinkSync(checkExists);
                                        con.rollback(function() {
                                        res.status(500);
                                        res.send({status:500, message:"Server Error"})
                                        });
                                    }
                                    else
                                    {
                                        res.status(201)
                                        res.send({status:201,message:"Recurso creado correctamente"})
                                    }
                                    });
                                }, checkExists)
                            }
                        });
                    });
                })
            }
        });
    },

    crearActividad : function (pet, res){
        WebMasterMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var nombreActividad = pet.body.nombre;
                var descripcion = pet.body.descripcion;
                var precioSocio = pet.body.precioSocio;
                var precioNoSocio = pet.body.precioNoSocio;

                var sql = `INSERT INTO actividades (nombre,descripcion,precioSocio,precioNoSocio) 
                            VALUES ('` + nombreActividad.replace(/'/g, "\\'") + `','` + descripcion.replace(/'/g, "\\'") + `', ` + precioSocio + `, ` + precioNoSocio + `);
                            SELECT LAST_INSERT_ID() as id;`;
                con.beginTransaction();
                llamadaBD(sql, function (result){
                    var partialPath="..\\..\\EsportUApp-Client\\src\\assets\\actividades\\" + result[1][0].id + "\\" + pet.file.originalname;
                    var partialPathBD="../../assets/actividades/" + result[1][0].id + "/" + pet.file.originalname;
                    var file = path.join(__dirname, partialPath)
                    fs.readFile(pet.file.path, function (err, data) {
                        var checkExists = path.join(__dirname,"..\\..\\EsportUApp-Client\\src\\assets\\actividades\\" + result[1][0].id);
                        if (!fs.existsSync(checkExists)){
                            fs.mkdirSync(checkExists);
                        }
                        fs.writeFile(file, data, function (err) {
                            if( err ){
                                resp.status(500);
                                resp.send({status:500, message:"Server Error"})
                            }
                            else{
                                var updateEmpresaImagen="Update actividades set imagen='" + partialPathBD + "' where id=" + result[1][0].id;
                                llamadaBD(updateEmpresaImagen, function (result) {
                                    con.commit(function(err) {
                                    if (err) { 
                                        fs.unlinkSync(checkExists);
                                        con.rollback(function() {
                                        res.status(500);
                                        res.send({status:500, message:"Server Error"})
                                        });
                                    }
                                    else
                                    {
                                        res.status(201)
                                        res.send({status:201,message:"Recurso creado correctamente"})
                                    }
                                    });
                                }, checkExists)
                            }
                        });
                    });
                })
            }
        })
    },
    getEntrenadoresDisponibles: function (pet,res){
        WebMasterMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                res.status(403);
                res.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var fechaBuscada = pet.params.fecha;
                var horaBuscada = pet.params.hora;
                var sql=`select usuarios.id,nombre,apellidos 
                from usuarios 
                left join sesiones on usuarios.id = sesiones.entrenador
                where usuarios.rol=4 and (sesiones.fecha_sesion!='` + fechaBuscada + ` ` + horaBuscada + `:00' or (select count(*) from sesiones where entrenador=usuarios.id)=0) and usuarios.bloqueado != (1)`;
                llamadaBD(sql, function(result){
                    res.status(200)
                    res.send({status:200,message:"OK", results: result})
                })
            }
        });
    },
    getSalasDisponibles: function (pet, res){
        WebMasterMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                res.status(403);
                res.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var horaBuscada= pet.params.hora;
                var fechaBuscada=pet.params.fecha;
                sql = `select distinct salas.id,nombre,capacidad
                from salas left join sesiones on salas.id = sesiones.sala 
                where (select count(*) from sesiones where sala=salas.id and sesiones.fecha_sesion='` + fechaBuscada + ` ` + horaBuscada + `:00') =0; 
                and (suspendida!= (1) suspendida is null)`;
                llamadaBD(sql,function(result){
                    res.status(200)
                    res.send({status:200,message:"OK", results: result})
                })
            }
        })
    },
    crearClase: function (pet, res){
        WebMasterMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                res.status(403);
                res.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var actividad = pet.body.actividad;
                var descripcion = pet.body.descripcion;
                var fecha_sesion = pet.body.fecha;
                var hora_sesion = pet.body.hora;
                var sala = pet.body.clase;
                var entrenador = pet.body.entrenador;
                var sql = "select rol from usuarios where id=" + entrenador;
                llamadaBD(sql, function(result0){
                    if(result0.length==0)
                    {
                        res.status(404);
                        res.send({status:404, message: "Bad Request: Usuario no encontrado"});
                    }
                    else{
                        if(result0[0].rol != 4)
                        {
                            res.status(400);
                            res.send({status:400, message: "La persona seleccionada no es un entrenador."});
                        }
                        else{
                            sql = `select null from sesiones where fecha_sesion='` + fecha_sesion + ` ` + hora_sesion + `:00' and sala=` + sala;
                            llamadaBD(sql,function (result){
                                if(result.length != 0)
                                {
                                    res.status(400);
                                    res.send({status:400, message: "Esa sala acabada de ser reservada, seleccione otra sala."});
                                }
                                else{
                                    sql=`select null from sesiones where fecha_sesion='`+ fecha_sesion + ` ` + hora_sesion + `:00' and entrenador=` + entrenador;
                                    llamadaBD(sql,function (result1){
                                        if(result.length != 0)
                                        {
                                            res.status(400);
                                            res.send({status:400, message: "Ese entrenador o entrenadora acabada de ser asignado/a a una actividad a esa hora, seleccione otra sala."});
                                        }
                                        else{
                                            sql = `INSERT INTO sesiones (fecha_sesion,plazas_ocupadas,descripcion,suspendida,entrenador,sala,actividad) 
                                            VALUES ('`+ fecha_sesion + ` ` + hora_sesion + `:00', 0, '` + descripcion.replace(/'/g, "\\'") + `', 0, ` + entrenador + `,` + sala + `, ` + actividad + `);
                                            SELECT LAST_INSERT_ID() as id;`;
                                            llamadaBD(sql, function (result){
                                                res.status(201)
                                                res.send({status:201,message:"Sesión creada correctamente"})
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
                
            }
        });
    },

    bloquearSala: function (pet,resp){
        var pCallback = function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var sql= "select null from salas where id=" + pet.body.id_sala;
                llamadaBD(sql, function(result){
                    if(result.length==0)
                    {
                        resp.status(404);
                        resp.send({status:403, message: "Bad Request: Sala no encontrada"});
                    }
                    else{
                        sql = "insert into esportuapp.bloqueos(fecha_inicio, fecha_fin, sala) values ('" + pet.body.fecha_inicio + "','" + pet.body.fecha_fin + "','" + pet.body.id_sala + "')";
                        console.log(sql)
                        llamadaBD(sql, function(result1){
                            if(result1.length != 0)
                            {
                                sql ="select id from esportuapp.bloqueos where fecha_inicio = '" + pet.body.fecha_inicio + "' and fecha_fin = '" + pet.body.fecha_fin + "' and sala = " + pet.body.id_sala;
                                llamadaBD(sql, function(result3){
                                    let bloqueado_id = result3[0].id;
                                    sql = "update esportuapp.bloqueos, esportuapp.sesiones, esportuapp.usuarios_sesion, esportuapp.usuarios, esportuapp.actividades set monedero = monedero + precioSocio where bloqueos.id = " + bloqueado_id + " and sesiones.sala = bloqueos.sala and usuarios_sesion.id_sesion = sesiones.id and usuarios.id = usuarios_sesion.id_usuario and sesiones.actividad = actividades.id and date_format(sesiones.fecha_sesion, '%Y-%m-%d') between fecha_inicio and fecha_fin;";
                                    llamadaBD(sql, function(result2){
                                        resp.status(200);
                                        resp.send({status:200, message: "Bloqueo de Sala registrado"});
                                    })
                                })
                            }
                            else{
                                resp.status(500);
                                resp.send({status:500, message:"Server Error"})
                            }

                        })
                    }
                })
            }
        } 
        WebMasterMethods.getIdEmailRolFromToken(pet, pCallback)       
    },

    getSalas: function (pet, res){
        WebMasterMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                res.status(403);
                res.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var fecha = new Date();
                sql = `select distinct salas.id,nombre,capacidad, if(fecha_fin < curdate(),null,bloqueos.fecha_fin) as fecha_fin, 
                if(fecha_fin < curdate(),null,bloqueos.fecha_inicio) as fecha_inicio, if(fecha_fin >= curdate(),true,false) as bloqueada
                from salas left join bloqueos on salas.id=bloqueos.sala
                where fecha_fin >= curdate() or (select count(*) from bloqueos where sala=salas.id)=0;`
                llamadaBD(sql,function(result){
                    result.map(sala => { 
                        if(sala.bloqueada==true)
                        {
                            sala.fecha_bloqueada = `Bloqueada de ` + sala.fecha_inicio.getDate() +`/` + sala.fecha_inicio.getMonth() +1 + `/` +sala.fecha_inicio.getFullYear() + ` al ` + 
                                sala.fecha_fin.getDate() +`/` + sala.fecha_fin.getMonth() +1 + `/` +sala.fecha_fin.getFullYear()
                        }
                        else{
                            sala.fecha_bloqueada = undefined
                        }
                        delete sala.fecha_inicio
                        delete sala.fecha_fin
                        return sala
                    })
                    res.status(200)
                    res.send({status:200,message:"OK", results: result})
                })
            }
        })
    },
  
    bloquearPista: function (pet,resp){
        var pCallback = function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                resp.status(403);
                resp.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                var sql= "select null from pistas where id=" + pet.body.id_pista;
                llamadaBD(sql, function(result){
                    if(result.length==0)
                    {
                        resp.status(404);
                        resp.send({status:403, message: "Bad Request: Sala no encontrada"});
                    }
                    else{
                        sql = "insert into esportuapp.bloqueos(fecha_inicio, fecha_fin, pista) values ('" + pet.body.fecha_inicio + "','" + pet.body.fecha_fin + "','" + pet.body.id_pista + "')";
                        llamadaBD(sql, function(result1){
                            if(result1.length != 0)
                            {
                                sql = "select id from esportuapp.bloqueos where fecha_inicio = '" + pet.body.fecha_inicio + "' and fecha_fin = '" + pet.body.fecha_fin + "' and pista = " + pet.body.id_pista;
                                llamadaBD(sql, function(result3){
                                    let bloqueado_id = result3[0].id;
                                    sql = "update esportuapp.bloqueos, esportuapp.pistas, esportuapp.reservas, esportuapp.usuarios set monedero = monedero + precioSocio, reservas.suspendida = 1 where bloqueos.id = " + bloqueado_id + " and reservas.pista = bloqueos.pista and usuarios.id = reservas.usuario and pistas.id = reservas.pista and date_format(reservas.fecha_reserva, '%Y-%m-%d') between fecha_inicio and fecha_fin;";
                                    llamadaBD(sql, function(result2){
                                        resp.status(200);
                                        resp.send({status:200, message: "Bloqueo de Pista registrado"});
                                    })
                                })
                            }
                            else{
                                resp.status(500);
                                resp.send({status:500, message:"Server Error"})
                            }

                        })
                    }
                })
            }
        } 
        WebMasterMethods.getIdEmailRolFromToken(pet, pCallback)       
    },
  
    getPistas: function (pet, res){
        WebMasterMethods.getIdEmailRolFromToken(pet, function (UsuarioLogueado){
            if(UsuarioLogueado.rol != 5)
            {
                res.status(403);
                res.send({status:403, message: "Bad Request: 403 Forbbiden"});
            }
            else{
                sql = "select distinct pistas.id, nombre, capacidad, deporte, if(fecha_fin < curdate(), null, bloqueos.fecha_fin) as fecha_fin,  if(fecha_fin < curdate(), null, bloqueos.fecha_inicio) as fecha_inicio, if(fecha_fin >= curdate(),true,false) as bloqueada from pistas left join bloqueos on pistas.id=bloqueos.pista where fecha_fin >= curdate() or (select count(*) from bloqueos where pista=pistas.id)=0";
                llamadaBD(sql,function(result){
                    var response= {
                        status: 200,
                        message: "OK",
                        results: []
                    }
                
                    result.map(pista => { 
                        if(pista.bloqueada==true)
                        {
                            pista.fecha_bloqueada = `Bloqueada de ` + pista.fecha_inicio.getDate() +`/` + pista.fecha_inicio.getMonth() +1 + `/` +pista.fecha_inicio.getFullYear() + ` al ` + 
                            pista.fecha_fin.getDate() +`/` + pista.fecha_fin.getMonth() +1 + `/` +pista.fecha_fin.getFullYear()
                        }
                        else{
                            pista.fecha_bloqueada = undefined
                        }
                            delete pista.fecha_inicio
                            delete pista.fecha_fin
                            return pista
                        })

                        var deporte1 = [];
                        var deporte2 = [];
                        var deporte3 = [];
                        var deporte4 = [];
                        var deporte5 = [];

                        result.forEach(element =>{
                            if(element.deporte == 1)
                                deporte1.push(element);
                            else if(element.deporte == 2)
                                deporte2.push(element);
                            else if(element.deporte == 3)
                                deporte3.push(element);
                            else if(element.deporte == 4)
                                deporte4.push(element);
                            else if(element.deporte == 5)
                                deporte5.push(element);
                        })

                        
                        response.results.push({id_deporte:1,pistas: deporte1})
                        response.results.push({id_deporte:2,pistas: deporte2})
                        response.results.push({id_deporte:3,pistas: deporte3})
                        response.results.push({id_deporte:4,pistas: deporte4})
                        response.results.push({id_deporte:5,pistas: deporte5})

                        res.status(200)
                        res.send(response)
                    })
            }
        })
    },
}

module.exports = WebMasterMethods;
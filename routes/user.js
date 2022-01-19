const {Router} = require('express');
const router = Router();

var UserController = require('../controllers/UserController');

// Home page route.
router.post('/esportuapp/login', UserController.login);
router.get('/esportuapp/tipoUsuario/:email', UserController.chequeaJWT, UserController.tipoUsuario);
router.put('/esportuapp/aceptarSolicitud', UserController.chequeaJWT, UserController.aceptarSolicitud);
router.put('/esportuapp/rechazarSolicitud', UserController.chequeaJWT, UserController.rechazarSolicitud);
router.get('/esportuapp/calendario/:fecha', UserController.getCalendarioPrecios)
router.get('/esportuapp/listadoInstalaciones/:fecha/:hora/:deporte', UserController.listadoInstalaciones)
router.get('/esportuapp/calendario/:fecha', UserController.getCalendarioPrecios);
router.get('/esportuapp/listadoActividades/:fecha/:hora/:actividad', UserController.listadoActividades)
router.get('/esportuapp/fotos', UserController.getFotos);


// Home page route.
router.post('/esportuapp/registro', UserController.registro);

module.exports = router;
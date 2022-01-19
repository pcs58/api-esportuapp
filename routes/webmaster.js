const {Router} = require('express');
var multer = require('multer');
const router = Router();

var upload = multer({ dest: '/assets' })
var UserController = require('../controllers/UserController');
var WebMasterController = require('../controllers/WebMasterController');

// Home page route.
router.put('/esportuapp/bloquearUsuario', WebMasterController.chequeaJWT, WebMasterController.bloquear);
router.put('/esportuapp/desbloquearUsuario', WebMasterController.chequeaJWT, WebMasterController.desbloquear);
router.get('/esportuapp/listadoUsuarios', WebMasterController.chequeaJWT, WebMasterController.listar);
router.get('/esportuapp/listadoSolicitudes', WebMasterController.chequeaJWT, WebMasterController.listarSolicitudes);
router.get('/esportuapp/informeClases/:year', WebMasterController.chequeaJWT, WebMasterController.informeClases);
router.get('/esportuapp/informePistas/:year', WebMasterController.chequeaJWT, WebMasterController.informePistas);
router.post('/esportuapp/pista', UserController.chequeaJWT, upload.single("file"), WebMasterController.crearPista);
router.post('/esportuapp/sala', UserController.chequeaJWT, upload.single("file"), WebMasterController.crearSala);
router.put('/esportuapp/bloquearSala', UserController.chequeaJWT, WebMasterController.bloquearSala);
router.post('/esportuapp/actividad', UserController.chequeaJWT, upload.single("file"),WebMasterController.crearActividad);
router.get('/esportuapp/entrenadores/:fecha/:hora', UserController.chequeaJWT, WebMasterController.getEntrenadoresDisponibles);
router.post('/esportuapp/clase', UserController.chequeaJWT, WebMasterController.crearClase);
router.get('/esportuapp/salasDisponibles/:fecha/:hora', UserController.chequeaJWT, WebMasterController.getSalasDisponibles);
router.get('/esportuapp/salas', UserController.chequeaJWT, WebMasterController.getSalas);
router.put('/esportuapp/bloquearPista', UserController.chequeaJWT, WebMasterController.bloquearPista);
router.get('/esportuapp/pistas', UserController.chequeaJWT, WebMasterController.getPistas);
router.get('/esportuapp/salas', UserController.chequeaJWT, WebMasterController.getSalas);

module.exports = router;
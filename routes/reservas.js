const {Router} = require('express');
const ReservasMethods = require('../controllers/ReservasController');
const router = Router();

var ReservasController = require('../controllers/ReservasController');
var UserController = require('../controllers/UserController')

// Home page route.
router.get('/esportuapp/deportesActividadesDisponibles/:fecha/:hora/:deporteActividad', ReservasController.deportesActividadesDisponibles);
router.get('/esportuapp/pistasSalasDisponibles/:fecha/:hora/:tipoDeporteActividad/:deporteActividad', ReservasController.pistasSalasDisponibles)
router.get('/esportuapp/resumenReserva/:idpistaactividad/:deporteActividad/:email', UserController.chequeaJWT, ReservasController.resumenReserva)
router.get('/esportuapp/resumenReserva/:idpistaactividad/:deporteActividad', UserController.chequeaJWT, ReservasController.resumenReserva)
router.post('/esportuapp/reserva', UserController.chequeaJWT, ReservasController.crearReserva)
router.get('/esportuapp/misReservas', UserController.chequeaJWT, ReservasController.misReservas)
router.put('/esportuapp/cancelarReserva', UserController.chequeaJWT, ReservasMethods.cancelReserva)

module.exports = router;
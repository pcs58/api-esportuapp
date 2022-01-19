const {Router} = require('express');
const router = Router();

var SocioController = require('../controllers/SocioController');

// Home page route.
router.get('/esportuapp/socio', SocioController.chequeaJWT, SocioController.home);
router.get('/esportuapp/socio/mi_cuenta', SocioController.chequeaJWT, SocioController.datosUsuario);
router.put('/esportuapp/socio/anyadirMonedero', SocioController.chequeaJWT, SocioController.anyadirMonedero);

module.exports = router;
const {Router} = require('express');
const router = Router();

var InformesController = require('../controllers/InformesController');
var UserController = require('../controllers/UserController')

// Home page route.
router.get('/esportuapp/informeSocios/:year', UserController.chequeaJWT, InformesController.informeSocios);


module.exports = router;
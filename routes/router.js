const {Router} = require('express');
const router = Router();

var home_controller = require('../controllers/HomeController');

// Home page route.
router.get('/', home_controller.main_home);

module.exports = router;
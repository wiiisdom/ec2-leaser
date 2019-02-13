var router = require('express').Router();

const backend_controller = require('../../controllers/backend.controller');
const image_controller = require('../../controllers/image.controller');

// add a backend via a POST query
router.post('/backend/add', backend_controller.add);

// delete a backend via a DELETE query
router.delete('/backend/:backend', backend_controller.delete);

// get backend details via a GET query
router.get('/backend/:backend', backend_controller.show);

// list backends via a GET query
router.get('/backend', backend_controller.list);

// list ami available via GET query
router.get('/image', image_controller.list);

// add ami via POST
//router.post('/image/add', image_controller.add);

// delete ami via DELETE
//router.delete('/image/:image', image_controller.delete);

// start ami via POST
router.post('/image/start', image_controller.start);

module.exports = router;
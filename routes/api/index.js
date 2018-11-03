var router = require('express').Router();

const backend_controller = require('../../controllers/backend.controller');

// add a backend via a POST query
router.post('/backend/add', backend_controller.add);

// delete a backend via a DELETE query
router.delete('/backend/:backend', backend_controller.delete);

// get backend details via a GET query
router.get('/backend/:backend', backend_controller.show);

// list backends via a GET query
router.get('/backend', backend_controller.list);

module.exports = router;
const backend_controller = require("../controllers/backend.controller");
const image_controller = require("../controllers/image.controller");
var passport = require("passport");
require("../services/auth.service")();
var { generateToken, sendToken } = require("../services/token.service");

var router = require("express").Router();

router.get("/check", (req, res) => {
  return res.send("OK2");
});

// get backend details via a GET query
router.get(
  "/backend/:backend",
  passport.authenticate("jwt", { session: false }),
  backend_controller.show
);

// list backends via a GET query
router.get(
  "/backend",
  passport.authenticate("jwt", { session: false }),
  backend_controller.list
);

// list ami available via GET query
router.get(
  "/image",
  passport.authenticate("jwt", { session: false }),
  image_controller.list
);

// start ami via POST
router.post(
  "/image/start",
  passport.authenticate("jwt", { session: false }),
  image_controller.start
);

// auth via google
router.post(
  "/auth/google",
  passport.authenticate("google-token", { session: false }),
  (req, res, next) => {
    if (!req.user) {
      return res.send(401, "User Not Authenticated");
    }
    req.auth = {
      id: req.user.id,
    };

    next();
  },
  generateToken,
  sendToken
);

module.exports = router;

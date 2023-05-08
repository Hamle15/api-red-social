const User = require("../models/User");

const findUserByEmail = (email, res) => {
  return User.findOne({ email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "The user does not exist",
        });
      }
      // Procesar el objeto user aquí
    })
    .catch((error) => {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    });
};

module.exports = {
  findUserByEmail,
};

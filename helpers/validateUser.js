const User = require("../models/User");

const findUserByEmail = (email) => {
  return User.findOne({ email })
    .exec()
    .then((user) => {
      if (!user) {
        throw new Error("The user does not exist");
      }
      return user;
    });
};

module.exports = {
  findUserByEmail,
};

const bcrypt = require("bcrypt");
const User = require("../models/User");

//ActionsTest
const pruebaUsers = (req, res) => {
  return res.status(200).send({
    message: "Mensaje Sended from: controllers/user.js",
  });
};

const register3 = async (req, res) => {
  //Take de info of teh body
  let params = req.body;
  let hola = params.nick.toLowerCase();
  let mial = params.email.toLowerCase();
  console.log(hola);
  console.log(mial);

  // Check that the data arrives correctly
  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "error",
      message: "Missing data to send ",
    });
  }

  try {
    // Control Users Duple
    const findDuplicate = await User.find({
      $or: [{ email: params.email }, { nick: params.nick }],
    }).exec();

    console.log(findDuplicate);

    if (findDuplicate && findDuplicate.length >= 1) {
      return res.status(200).send({
        status: "succes",
        message: "El usuario ya existe",
      });
    }

    //encrypt password

    let passwordHash = await bcrypt.hash(params.password, 10);
    params.password = passwordHash;

    //Save DB

    //Crate obj of the users
    let user_to_save = new User(params);
    let userStorage = await user_to_save.save();
    if (!userStorage) {
      return res.status(500).send({
        status: "error",
        message: "Error to save de User",
      });
    }

    return res.status(200).json({
      status: "succes",
      message: "User Register correctly",
      user: userStorage,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en la consulta",
    });
  }
};

const register = (req, res) => {
  let params = req.body;

  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "error",
      message: "Missing data to send ",
    });
  }

  User.find({
    $or: [
      { email: params.email.toLowerCase() },
      { nick: params.nick.toLowerCase() },
    ],
  })
    .exec()
    .then(async (users) => {
      if (users && users.length >= 1) {
        return res.status(200).send({
          status: "succes",
          message: "El usuario ya existe",
        });
      }
      let pdw = await bcrypt.hash(params.password, 10);
      params.password = pdw;

      let user_to_save = new User(params);

      user_to_save.save().then((userStored) => {
        if (!userStored) {
          return res.status(500).send({
            status: "error",
            message: "Error to save de User",
          });
        }
        return res.status(200).json({
          status: "succes",
          message: "User resgister corrtley",
          user: userStored,
        });
      });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "error",
        message: "Error en la consulta",
      });
    });
};

module.exports = {
  pruebaUsers,
  register,
};

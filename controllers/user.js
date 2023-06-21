const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("../services/jwt");
const moongoosePaguinate = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");
const Follow = require("../models/Follow");
const Publication = require("../models/Publication");

const { validate } = require("../helpers/validateRegister");

//ActionsTest
const pruebaUsers = (req, res) => {
  return res.status(200).send({
    message: "Mensaje Sended from: controllers/user.js",
    usuario: req.user,
  });
};

//Toca ver como corregirla
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
      message: "Missing data to send",
    });
  }

  // Validación avanzada
  const validationResult = validate(params);
  if (!validationResult.valid) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors: validationResult.errors,
    });
  }

  if (params.nick.length >= 10) {
    return res.status(400).json({
      status: "error",
      message: "The nick is too long",
    });
  }

  User.find({
    $or: [{ email: params.email }, { nick: params.nick.toLowerCase() }],
  })
    .exec()
    .then(async (users) => {
      if (users && users.length >= 1) {
        return res.status(500).json({
          status: "error",
          message: "El usuario ya existe",
        });
      }

      let pdw = await bcrypt.hash(params.password, 10);
      params.password = pdw;

      let user_to_save = new User(params);

      user_to_save.save().then((userStored) => {
        if (!userStored) {
          return res.status(500).json({
            status: "error",
            message: "Error to save the User",
          });
        }
        return res.status(200).json({
          status: "success",
          message: "User registered successfully",
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

const login = async (req, res) => {
  //Take the params
  let params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Missing data",
    });
  }

  try {
    //Search in DB the email
    const userFind = await User.findOne({ email: params.email })
      // .select({"password": 0})
      .exec(); //se puede quitar el excec
    if (!userFind) {
      return res.status(404).send({
        status: "error",
        menssage: "Mail o Password Incorrect",
        message2: "Para Hamlet: NO EXISTE EL USUARIO PERO SE PONE POR SI",
      });
    }

    //Check the password
    const pwd = bcrypt.compareSync(params.password, userFind.password);

    if (!pwd) {
      return res.status(400).send({
        status: "error",
        menssage: "Mail o Password Incorrect",
      });
    }

    //Token
    const token = jwt.createToken(userFind);

    //Data User
    return res.status(200).json({
      message: "You have identificy correctly",
      user: {
        id: userFind._id,
        name: userFind.name,
        nick: userFind.nick,
      },
      token,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      menssage: "The user do not exist",
    });
  }
};

const profile = async (req, res) => {
  //Recibir el paramatro por la url
  const id = req.params.id;

  try {
    //Consulta sacar los datos de el usuario
    const userProfile = await User.findById(id)
      .select({ password: 0, role: 0 })
      .exec();
    if (!userProfile) {
      return res.status(404).send({
        status: "error",
        menssage: "The user did not exist",
      });
    }

    //Info de seguimiento
    const followInfo = await followService.followThisUser(req.user.id, id);

    //Posteriormente: devlver informacion de follows

    return res.status(200).json({
      status: "succes",
      user: userProfile,
      followin: followInfo.following,
      follower: followInfo.followers,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      menssage: "The user did not exist",
    });
  }
};

const list = async (req, res) => {
  //Controlar en la paguina estamos
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  page = parseInt(page);

  //Consulta con moongoose paguinate
  let itemsPerPage = 5;

  try {
    const UserFind = await User.find()
      .select("-password -email -__v")
      .sort("_id")
      .paginate(page, itemsPerPage);
    const total = await User.countDocuments({}).exec();
    if (!UserFind) {
      return res.status(404).send({
        status: "error",
        menssage: "User did not found",
      });
    }

    let followUsersIds = await followService.followUserIds(req.user.id);

    //Devolver el resultado (posterior info folllow)
    return res.status(200).send({
      status: "succes",
      UserFind,
      page,
      total,
      itemsPerPage,
      pages: Math.ceil(total / itemsPerPage),
      users_following: followUsersIds.followingClean,
      user_follow_me: followUsersIds.followersClean,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      menssage: "User did not found",
    });
  }
};

const update = (req, res) => {
  //Take info of the User to update
  let UserIdentidy = req.user;
  let userUpdate = req.body;

  //Delete Campos sobrantes
  delete userUpdate.iat;
  delete userUpdate.exp;
  delete userUpdate.role;

  //Check if the User Exist

  User.find({
    $or: [{ email: userUpdate.email }, { nick: userUpdate.nick }],
  })
    .exec()
    .then(async (users) => {
      let userIsset = false;
      users.forEach((users) => {
        if (users && users._id != UserIdentidy.id) userIsset = true;
      });

      if (userIsset == true) {
        return res.status(200).send({
          status: "succes",
          message: "El usuario ya existe",
        });
      }

      if (userUpdate.password) {
        let pdw = await bcrypt.hash(userUpdate.password, 10);
        userUpdate.password = pdw;
      } else {
        delete userUpdate.password;
      }

      //Look and update
      User.findByIdAndUpdate(UserIdentidy.id, userUpdate, { new: true })
        .then((userUpdate) => {
          if (!userUpdate) {
            return res.status(500).json({
              status: "error",
              menssage: "Error al actualizar ",
            });
          }
          return res.status(200).send({
            status: "succes",
            menssage: "Methot Up date",
            user: userUpdate,
          });
        })
        .catch((error) => {
          return res.status(500).json({
            status: "error",
            menssage: "Error al actualizar ",
            error,
          });
        });
    });
};

const upload = (req, res) => {
  // Recojer el fichero de img and comprobar q exixste
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      menssage: "The Peticion do not have de img",
    });
  }

  //Cojer el nombre del archivo
  let image = req.file.originalname;

  //Sacar la extension del arhivo
  const imageSpilt = image.split(".");
  const extension = imageSpilt[1];

  //Comprobar Extension
  //Si no es correcto, borrar
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    //Borrar arichivo subido
    const filePath = req.file.path;
    const fileDelete = fs.unlinkSync(filePath);
    //Devolver Res negativa
    return res.status(400).send({
      status: "error",
      message: "Extension invalid",
    });
  }

  //Si es correcto guardar en BD
  User.findOneAndUpdate(
    { _id: req.user.id },

    { avatar: req.file.filename },
    { new: true }
  )
    .then((userUpdate) => {
      if (!userUpdate) {
        return res.status(500).send({
          status: "error",
          message: "Error en la subida del avatar",
        });
      }
      return res.status(200).send({
        status: "succes",
        user: userUpdate,
        file: req.file,
      });
    })
    .catch((error) => {
      return res.status(500).send({
        status: "error",
        message: "Error en la subida del avatar",
      });
    });
};

const avatar = (req, res) => {
  //Sacar el param de la url
  const file = req.params.file;

  //Montar el path
  const filePath = "./uploads/avatars/  " + file;

  //Comprobar que existe
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        menssage: "the image do not exist",
      });
    }
    //Devolver el file
    return res.sendFile(path.resolve(filePath));
  });
};

const counters = async (req, res) => {
  let userId = req.user.id;

  if (req.params.id) {
    userId = req.params.id;
  }

  try {
    const following = await Follow.count({ user: userId });
    const followers = await Follow.count({ followed: userId });
    const publications = await Publication.count({ user: userId });

    return res.status(200).send({
      status: "succes",
      following: following,
      followers: followers,
      publications: publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      menssage: "The user do not exist",
    });
  }
};
module.exports = {
  pruebaUsers,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  counters,
};

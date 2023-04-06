const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("../services/jwt");

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
      message: "Missing data to send ",
    });
  }

  User.find({
    $or: [
      { email: params.email},
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

const login = async (req, res ) => {

  //Take the params
  let params = req.body;

  if(!params.email || !params.password){
    return res.status(400).send({
      status: "error",
      message: "Missing data"
    });
  }

  try {
    //Search in DB the email
    const userFind = await User.findOne({email: params.email})
    // .select({"password": 0})
    .exec(); //se puede quitar el excec
    if(!userFind){
      return res.status(404).send({
        status: "error",
        menssage: "Mail o Password Incorrect",
        message2: "Para Hamlet: NO EXISTE EL USUARIO PERO SE PONE POR SI"
      });
    }

    //Check the password
    const pwd = bcrypt.compareSync(params.password, userFind.password);
    
    if(!pwd){
      return res.status(400).send({
        status: "error",
        menssage: "Mail o Password Incorrect"
      })
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
      token
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      menssage: "The user do not exist",
    }); 
  }
}

const profile = async (req, res) => {
  //Recibir el paramatro por la url
  const id = req.params.id;


  

  try {
    //Consulta sacar los datos de el usuario
    const userProfile = await User.findById(id).select({password: 0, role: 0}).exec();
    if(!userProfile){
      return res.status(404).send({
        status: "error",
        menssage: "The user did not exist"
      })
    }

    //Return result 
    //POsteriormente: devlver informacion de follows
    return res.status(200).json({
      status: "succes",
      user: userProfile,
    })
  } catch (error) {
    return res.status(404).send({
      status: "error",
      menssage: "The user did not exist"
    })
  }

  
}
module.exports = {
  pruebaUsers,
  register,
  login,
  profile,
};

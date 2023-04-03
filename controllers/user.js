const User = require("../models/User");

//ActionsTest
const pruebaUsers = (req, res) => {
  return res.status(200).send({
    message: "Mensaje Sended from: controllers/user.js",
  });
};

//Register of Users
const register = async (req, res) => {

  //Take data from the req
  let params = req.body;


  // Check that the data arrives correctly
  if(!params.name ||!params.email || !params.password || !params.nick){
    return res.status(400).json({
      status: "error",
      message: "Missing data to send "
    });
  }

  let user_to_save = new User(params);
  // Control Users Duple
  User.find({$or: [
    {email: user_to_save.email.toLoweCase()},
    {nick: user_to_save.nick.toLoweCase()},
  ]}).exec()
      .then((users) => {
        if(users && users.length >= 1){
          return res.status(200).send({
            status: "succes",
            message: "El usuario ya existe"
          })
        }else{
          //encrypt password

          //Save Users in the DB

          // Return Res


          return res.status(200).json({
            status: "succes",
            message: "Action of register of users",
            user_to_save
          })
        }


      })
      .catch((error) => {
        return res.status(500).json({
          status: "error",
          message: "Error en la consulta"
        })
      })

  
};

module.exports = {
  pruebaUsers,
  register
};

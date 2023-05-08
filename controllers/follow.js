const Follow = require("../models/Follow");
const User = require("../models/User");
const { findUserByEmail } = require("../helpers/validate");

const testFollow = (req, res) => {
  return res.status(200).send({
    message: "Message sent from: controllers/follow",
  });
};

//Accion follow
const save = (req, res) => {
  //Check if the User Exist
  findUserByEmail(req.user.email, res).then((user) => {
    //Take the params by the body

    //Take the id of the user Id

    //Create obj whit model follow

    //Save obj in bd

    res.status(200).json({
      status: "succes",
      menssage: "Methon Save",
      user: req.user,
    });
  });
};

//Take the params of the body

//Take the id of the user identify

//Crate a obj whit the model follow

//Save in the DB

//Action delete a follow

//Action of people that i follow

//Action list of user that they follow me

module.exports = {
  testFollow,
  save,
};

const Publication = require("../models/Publication");
const { findUserByEmail } = require("../helpers/validateUser");
const testPublication = (req, res) => {
  return res.status(200).send({
    message: "Message sended: controllers/publication",
  });
};

//Save publicacion

const save = (req, res) => {
  //Recojer datos de body
  const params = req.body;

  //Si no llegan data negativa
  if (!params.text) {
    return res.status(400).json({
      status: "error",
      menssage: "Proporciona el texto",
    });
  }

  const textoLimpio = params.text.replace(/\s+/g, " ").trim();
  const palabras = textoLimpio.split(" ");

  if (palabras.length > 64) {
    return res.status(400).json({
      status: "error",
      menssage: "El texto no debe tener mas de 64 palabras",
      palabras: palabras.length,
      textoLimpio,
      params,
    });
  }

  //Crear y llenar el obj del modelo(publicacion)
  let newPublication = new Publication(params);
  newPublication.text = textoLimpio;
  newPublication.user = req.user.id;

  //Guardar objeto en bd
  newPublication
    .save()
    .then((publication) => {
      if (!publication) {
        return res.status(500).json({
          status: "error",
          menssage: "No se ha guardado la publicacion",
        });
      }
      //Devolver Respuesta
      return res.status(200).send({
        status: "succes",
        message: "Publicacion guardada",
        publication,
        textoLimpio,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "error",
        message: "No se ha guardado la publicacion",
      });
    });
};

//Sacar una publicacion en contreto

const detail = (req, res) => {
  //Sacar id de las url
  const publicacionId = req.params.id;

  //Find con la condicion del id

  Publication.findById(publicacionId)
    .then((publicationStored) => {
      if (!publicationStored) {
        return res.status(400).send({
          status: "error",
          menssage: "El id no existe",
        });
      }
      //Devolver respuesta
      return res.status(200).json({
        status: "succes",
        publicationStored,
      });
    })
    .catch((error) => {
      return res.status(400).send({
        status: "error",
        menssage: "La publicacion no existe",
      });
    });
};

//Delete publicacion
const remove = (req, res) => {
  findUserByEmail(req.user.email)
    .then(() => {
      const publicacionId = req.params.id;

      Publication.find({ user: req.user.id, _id: publicacionId })
        .deleteOne()
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.status(400).json({
              status: "error",
              message: "The publicacion does not exist",
            });
          }
          return res.status(200).json({
            status: "success",
            message: "Route Remove",
            publicacionId,
          });
        })
        .catch((error) => {
          return res.status(400).json({
            status: "error",
            message: "The publicacion do not exist",
          });
        });
    })
    .catch((error) => {
      return res.status(404).json({
        status: "error",
        message: error.message,
      });
    });
};

// Listar publicacion de un usuario
const user = (req, res) => {
  return res.status(200).send({
    status: "succes",
    menssage: "Publicaciones del usuario",
    user: req.user,
  });
};

//List all publicacion of user that i follow

// Subir ficheros

//Devolver archivos multimedia

module.exports = {
  testPublication,
  save,
  detail,
  remove,
  user,
};

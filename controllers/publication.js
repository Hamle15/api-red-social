const Publication = require("../models/Publication");

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
      menssage: "El texto debe tener entre 4 y 1 palabra",
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

//Delete publicacion

//List all publicacion of user that i follow

// Listar publicacion de un usuario

// Subir ficheros

//Devolver archivos multimedia

module.exports = {
  testPublication,
  save,
};

const Publication = require("../models/Publication");
const User = require("../models/User");
const { findUserByEmail } = require("../helpers/validateUser");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");

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
const user = async (req, res) => {
  try {
    const userId = req.params.id;

    // Controlar página
    let page = 1;

    if (req.params.page) {
      page = req.params.page;
    }

    const itemsPerPage = 5;

    const totalDocs = await Publication.countDocuments({ user: userId });

    const publication = await Publication.find({ user: userId })
      .sort("-created_at")
      // .populate("user", "-password -__v")
      .select("-user -__v")
      .paginate(page, itemsPerPage);

    const user = await User.findById(userId).select(
      "-password -role -__v -created_at -email"
    );

    return res.status(200).send({
      status: "success",
      message: "Publicaciones del usuario",
      totalDocs,
      pages: Math.ceil(totalDocs / itemsPerPage),
      userIdentify: user,
      publication,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "El usuario no existe",
    });
  }
};

// Subir ficheros

const upload = (req, res) => {
  //Sacar publicacion id

  const publicationId = req.params.id;
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      menssage: "Inlcuir Imagen",
    });
  }

  let image = req.file.originalname;

  const imageSplit = image.split(".");
  const extension = imageSplit[1];

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

  Publication.findOneAndUpdate(
    { user: req.user.id, _id: publicationId },
    { file: req.file.filename },
    { new: true }
  )
    .then((publicationUpdate) => {
      if (!publicationUpdate) {
        return res.status(500).send({
          status: "error",
          message: "Error en la subida del avatar",
        });
      }
      return res.status(200).send({
        status: "succes",
        publication: publicationUpdate,
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

//Devolver archivos multimedia

const media = (req, res) => {
  const publicationId = req.params.id;

  // Buscar la publicación por su ID en la base de datos
  Publication.findById(publicationId)
    .then((publication) => {
      if (!publication) {
        return res.status(404).send({
          status: "error",
          message: "Publication not found",
        });
      }

      // Obtener el nombre del archivo de la publicación
      const fileName = publication.file;

      // Montar el path utilizando el nombre de archivo obtenido
      const filePath = `./uploads/publications/${fileName}`;

      // Comprobar que el archivo existe
      fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
          return res.status(404).send({
            status: "error",
            message: "La publicación no tiene imagen",
          });
        }

        // Devolver el archivo como respuesta
        return res.sendFile(path.resolve(filePath));
      });
    })
    .catch((error) => {
      return res.status(500).send({
        status: "error",
        message: "La publicacion no existe",
      });
    });
};

/*const media = (req, res) => {
  //Sacar el param de la url
  const file = req.params.file;

  //Montar el path
  const filePath = "./uploads/publications/" + file;

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
};*/

//List all publicacion of user that i follow
const feedModificado = async (req, res) => {
  const userId = req.user.id;
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  const itemsPerPage = 5;

  try {
    const myFollows = await followService.followUserIds(userId);

    const totalDocs = await Publication.countDocuments({
      user: myFollows.following,
    });

    const publications = await Publication.aggregate([
      {
        //Filtra las publicaciones del los usuarios seguidos
        $match: { user: { $in: myFollows.following } },
      },
      {
        //Agrupa por id las publicaciones de los usuarios creando un nuevo array
        $group: {
          _id: "$user",
          publications: { $push: "$$ROOT" },
        },
      },
      {
        //Obtiene los datos completos del usuario
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $sort: { "publications.created_at": -1 },
      },
      {
        $skip: (page - 1) * itemsPerPage,
      },
      {
        $limit: itemsPerPage,
      },
      {
        $project: {
          "user.password": 0,
          "user.email": 0,
          "user.__v": 0,
          "publications.user.password": 0,
          "publications.user.email": 0,
          "publications.user.__v": 0,
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
          publications: "$publications",
        },
      },
    ]);

    return res.status(200).send({
      status: "success",
      message: "Route feed",
      totalDocs,
      pages: Math.ceil(totalDocs / itemsPerPage),
      page,
      myFollows: myFollows.following,
      publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error interno, comuníquese con el soporte",
    });
  }
};

const feed = async (req, res) => {
  const userId = req.user.id;
  //Sacar paguina actual
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  //Establecer numero de  elementos por paguina
  const itemsPerPage = 5;

  try {
    //Sacar array de ids de usuarios que yo sigo como usuario identificado
    const myFollows = await followService.followUserIds(userId);

    //Find a publicaciones in, ordernar, popular, paguinar
    const totalDocs = await Publication.countDocuments({
      user: myFollows.following,
    });
    const publications = await Publication.find({
      user: myFollows.following /*{"$in": myFollows.following}*/,
    })
      .sort("-created_at")
      .populate("user", "-password -email -__v")
      .select("-__v") // Excluir el campo "__v"
      .paginate(page, itemsPerPage);

    return res.status(200).send({
      status: "succes",
      menssage: "Routa feed",
      totalDocs,
      pages: Math.ceil(totalDocs / itemsPerPage),
      page,
      myFollows: myFollows.following,
      publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      menssage: "Error interno comuniquese con el soporte",
    });
  }
};

module.exports = {
  testPublication,
  save,
  detail,
  remove,
  user,
  upload,
  media,
  feed,
};

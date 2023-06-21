const Follow = require("../models/Follow");
const User = require("../models/User");

const followService = require("../services/followService");
const { findUserByEmail } = require("../helpers/validate");

const moongoosePaginate = require("mongoose-pagination");

const testFollow = (req, res) => {
  return res.status(200).send({
    message: "Message sent from: controllers/follow",
  });
};

const save = (req, res) => {
  // Check if the User Exists
  findUserByEmail(req.user.email, res).then((user) => {
    // Take the params from the request body
    const params = req.body;

    // Take the user ID from the request
    const identity = req.user;

    // Check if the user is trying to follow themselves
    if (identity.id === params.followed) {
      return res.status(400).json({
        status: "error",
        message: "No puedes seguirte a ti mismo",
      });
    }

    // Check if the follow relationship already exists
    Follow.findOne({ user: identity.id, followed: params.followed })
      .then((existingFollow) => {
        if (existingFollow) {
          return res.status(400).json({
            status: "error",
            message: "Ya sigues a este usuario",
          });
        }

        // Check if the followed user exists
        User.findById(params.followed)
          .then((followedUser) => {
            if (!followedUser) {
              return res.status(400).json({
                status: "error",
                message: "El usuario seguido no existe",
              });
            }

            // Create a new Follow object
            let userToFollow = new Follow({
              user: identity.id,
              followed: params.followed,
            });

            // Save the Follow object in the database
            userToFollow
              .save()
              .then((followStored) => {
                if (!followStored) {
                  return res.status(500).json({
                    status: "error",
                    message: "Error al guardar el seguimiento",
                  });
                }

                return res.status(200).send({
                  status: "ok",
                  follow: {
                    id: followStored.id,
                    identity: {
                      id: identity.id,
                      name: identity.name,
                    },
                    followed: {
                      id: followedUser._id,
                      name: followedUser.name,
                    },
                  },
                });
              })
              .catch((error) => {
                return res.status(500).json({
                  status: "error",
                  message: "Error al guardar el seguimiento",
                });
              });
          })
          .catch((error) => {
            return res.status(500).json({
              status: "error",
              message: "Error al buscar el usuario seguido",
            });
          });
      })
      .catch((error) => {
        return res.status(400).json({
          status: "error",
          message: "El usuario seguido no existe",
        });
      });
  });
};

//Action delete a follow
const unfollow = (req, res) => {
  findUserByEmail(req.user.email, res).then((user) => {
    const userId = req.user.id;

    const followedId = req.params.id;

    Follow.find({
      user: userId,
      followed: followedId,
    })
      .deleteOne()
      .then((followStored) => {
        if (!followStored) {
          return res.status(500).send({
            status: "error",
            message: "No lo haz seguido",
          });
        }
        return res.status(200).send({
          status: "succes",
          message: "Follow eliminado correctamente",
          identity: req.user,
          followStored,
        });
      })
      .catch((error) => {
        return res.status(500).send({
          status: "error",
          message: "No lo haz seguido",
        });
      });
  });
};

//Action of people that i follow

const following = (req, res) => {
  findUserByEmail(req.user.email, res).then((user) => {
    // Sacar el id del usuario
    let userId = req.user.id;

    // Comprobar si me llega el id por parámetro en la URL
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no, la página es 1
    let page = 1;

    if (req.params.page) page = req.params.page;

    // Usuarios por página que quiero mostrar
    const itemsPerPage = 5;

    // Obtener el recuento total de documentos
    Follow.countDocuments({ user: userId })
      .then((totalDocs) => {
        // Encontrar los follows, popular datos de los usuarios y paginar con Mongoose paginate
        Follow.find({ user: userId })
          .populate("user followed", "-password -role -__v -email")
          .paginate(page, itemsPerPage)
          .then(async (follows) => {
            //Sacar usuarios que me siguen
            let followUsersIds = await followService.followUserIds(req.user.id);
            return res.status(200).send({
              status: "success",
              message: "Followed Info",
              follows,
              totalDocs,
              pages: Math.ceil(totalDocs / itemsPerPage),
              users_following: followUsersIds.following,
              user_follow_me: followUsersIds.followers,
              hola: followUsersIds,
            });
          })
          .catch((error) => {
            return res.status(500).send({
              status: "error",
              message: "An error occurred while fetching follows",
              error,
            });
          });
      })
      .catch((error) => {
        return res.status(404).send({
          status: "error",
          message: "User Do not exist",
        });
      });
  });
};

const followers = (req, res) => {
  findUserByEmail(req.user.email, res).then((user) => {
    let userId = req.user.id;

    // Comprobar si me llega el id por parámetro en la URL
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no, la página es 1
    let page = 1;

    if (req.params.page) page = req.params.page;

    // Usuarios por página que quiero mostrar
    const itemsPerPage = 5;

    Follow.countDocuments({ user: userId }).then((totalDocs) => {
      // Encontrar los follows, popular datos de los usuarios y paginar con Mongoose paginate
      Follow.find({ followed: userId })
        .populate("user", "-password -role -__v -email")
        .paginate(page, itemsPerPage)
        .then(async (follows) => {
          //Sacar usuarios que me siguen
          let followUsersIds = await followService.followUserIds(req.user.id);
          return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que me siguen",
            follows,
            totalDocs,
            pages: Math.ceil(totalDocs / itemsPerPage),
            users_following: followUsersIds.followingClean,
            user_follow_me: followUsersIds.followersClean,
          });
        })
        .catch((error) => {
          return res.status(500).send({
            status: "error",
            message: "An error occurred while fetching follows",
            error,
          });
        });
    });
  });
};

//Action list of user that they follow me

module.exports = {
  testFollow,
  save,
  unfollow,
  following,
  followers,
};

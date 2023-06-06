const Follow = require("../models/Follow");

const followUserIds = async (identityUserId) => {
  //Usuarios  que el usuario identificado sigue

  try {
    //Sacar info seguimiento
    let following = await Follow.find({ user: identityUserId }).select({
      followed: 1,
      _id: 0,
    });

    let followers = await Follow.find({ followed: identityUserId }).select({
      user: 1,
      _id: 0,
    });

    //Procesar array
    let followingClean = [];
    following.forEach((follow) => {
      followingClean.push(follow.followed);
    });

    let followersClean = [];
    followers.forEach((follow) => {
      followersClean.push(follow.user);
    });
    return {
      followingClean,
      followersClean,
    };
  } catch (error) {
    return {};
  }
};
//si un usuario me sigue y si yo lo sigo
const followThisUser = async (identityUserId, profileUserId) => {
  let following = await Follow.findOne({
    user: identityUserId,
    followed: profileUserId,
  });

  let followers = await Follow.find({
    user: profileUserId,
    followed: identityUserId,
  });

  return {
    following,
    followers,
  };
};

module.exports = {
  followUserIds,
  followThisUser,
};

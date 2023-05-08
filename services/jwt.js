const jwt = require("jwt-simple");
const moment = require("moment");

const secret = "EL_BIYO_ES_MUY_MALO_MESSI_ES_MEJOR_SUUPAPI";

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    iat: moment().unix(), //fecha de escrita de forma rara
    exp: moment().add(1, "hour").unix(),
  };

  //Devolver JWT
  return jwt.encode(payload, secret);
};

module.exports = {
  secret,
  createToken,
};

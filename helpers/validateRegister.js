const validator = require("validator");

const validate = (params) => {
  let errors = {};

  let name =
    !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 3, max: undefined }) &&
    validator.isAlpha(params.name, "es-ES");

  let surname =
    !validator.isEmpty(params.surname) &&
    validator.isLength(params.surname, { min: 3, max: undefined }) &&
    validator.isAlpha(params.surname, "es-ES");

  let nick =
    !validator.isEmpty(params.nick) &&
    validator.isLength(params.nick, { min: 2, max: undefined });

  let email =
    !validator.isEmpty(params.email) && validator.isEmail(params.email);

  let password = !validator.isEmpty(params.password);

  if (params.bio) {
    let bio = validator.isLength(params.name, { min: undefined, max: 255 });

    if (!bio) {
      errors.bio = "La descripción no cumple con los requisitos";
    }
  }

  if (!name) {
    errors.name = "El nombre no cumple con los requisitos";
  }

  if (!surname) {
    errors.surname = "El apellido no cumple con los requisitos";
  }

  if (!nick) {
    errors.nick = "El nick no cumple con los requisitos";
  }

  if (!email) {
    errors.email = "El email no cumple con los requisitos";
  }

  if (!password) {
    errors.password = "La contraseña no cumple con los requisitos";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors,
  };
};

module.exports = {
  validate,
};

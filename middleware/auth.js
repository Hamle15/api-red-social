//Import Modules
const jwt = require("jwt-simple");
const moment = require("moment");

//Import Secret Password
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

//Funcion of auth
exports.auth = (req, res, next) => {

    
    //Check if the header get of auth
    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            menssage: "The peticion do not have de header of the autentificacion"
        })
    }

    //Clean the token
    let token = req.headers.authorization.replace(/['"]+/g, '');

    //Defodificar Token
    try {
        let payload = jwt.decode(token, secret);
        //Comprobar expiracion

        console.log(payload);
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                status: "error",
                menssage: "Token expirado",
            })
        }
        //Agregar datos de usuario a request
        req.user = payload;

        
    } catch (error) {
        return res.status(404).send({
            status: "error",
            menssage: "Token Invalid",
            error
        })
    }

    
    //Pasar ejecucion
    next();

}

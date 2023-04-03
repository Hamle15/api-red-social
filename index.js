//Imporrt Dependencies
const { connection }= require('./database/connection');
const express = require('express');
const cors = require('cors');

//Mesaje Wellcome
console.log("API NODE for SOCIAL NETWORK started!!");

//Conection to DB
connection();

//Create server Node
const app = express();
const port = 3900;

//Configure Cors
app.use(cors()) //se va ejecuta ante que cualquier cosa

// Trasmofor Data of the body to a object js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Carge conf rutes
const UserRouters = require("./routers/user");
const PublicationRouters = require("./routers/publication");
const FollowRouters = require("./routers/follow");

app.use("/api/user", UserRouters);
app.use("/api/publication", PublicationRouters);
app.use("/api/follow", FollowRouters);

//Test Rute
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            "id": 1,
            "nombre" : "Hamlet",
            "Apellido": "Pirazan",
        }
    );
})

// Put the server to hear peticion http
app.listen(port, () => {
    console.log("Server of node running in the port: ",port);
});

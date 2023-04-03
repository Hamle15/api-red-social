const mongoose = require("mongoose");

const connection = async () => {
  try {

    await mongoose.connect("mongodb://127.0.0.1:27017/my_socialnetwork");
    console.log("Successfully connected to DB: my_socialnetwork");

  } catch (error) {
    
    console.log(error);
    throw new Error("!! Could not connect to db !!");
  }
};

module.exports = {
  connection
}

const { Schema, model } = require("mongoose");

const UserSchema = Schema({
    name: {
        type: String,
        require: true,
    },
    surname: String,
    nick: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    role: {
        type: String,
        default: "role_user",
    },
    avatar: {
        type: String,
        default: "avatar.png",
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});

module.exports = model("User", UserSchema, "users")

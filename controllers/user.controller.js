const userRouter = require('express').Router();
const UserModel = require("../models/user.model");

userRouter.post("/api/user/update/:data", (req, res) => {

    const userId = req.body.id;

})

module.exports = userRouter
const userRouter = require('express').Router();
const UserModel = require("../models/user.model");

userRouter.post("/api/user/update/profile", (req, res) => {

    const { id, username, firstName, lastName, email } = req.body;

    UserModel.findOneAndUpdate({_id: id}, { $set: { username, firstName, lastName, email  } }).then((response) => {
        
        const user = {
            id: response._id,
            username: response.username,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
            bio: response.bio,
            image: response.image
        }
        
        res.send(user)
    })

})

module.exports = userRouter
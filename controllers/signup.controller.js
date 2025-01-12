const bcrypt = require("bcrypt")
const SignupRouter = require('express').Router();
const User = require("../models/user.model")
const UserInfo = require("../models/user.info.model")


SignupRouter.post("/api/signup", (req, res) => {
    const { username, firstName, lastName, email, password } = req.body
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    User.create({
        username,
        firstName,
        lastName,
        email,
        password: hashedPassword
    }).then((response) => {
        const userId = response._id.toString();


        UserInfo.create({ user_id: userId, })
        return res.send({ acknowledged: true, msg: "Signup Successful" })

    }).catch((error) => {
        if (error.code == 11000) {
            let keyPattern = Object.keys(error.keyPattern)[0]

            if (keyPattern == "username")
                return res.status(409).send({ acknowledged: false, msg: "Username is already in use" })
            else if (keyPattern == "email")
                return res.status(409).send({ acknowledged: false, msg: "Email address has already been used" })
        }

        console.log(error)
    })

})

module.exports = {
    SignupRouter
}
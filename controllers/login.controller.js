const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/user.model");
const loginRouter = require('express').Router();
const userInfo = require("../models/user.info.model")

loginRouter.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email }).then((response) => {
        if (response) {
            bcrypt.compare(password, response.password, (err, data) => {
                if (err) return res.status(500).send({ acknowledged: false, msg: "Internal Server Error"})

                if (data) {
                    userInfo.findOne({ user_id: response._id }).then((info) => {

                        console.log(info)

                        const User = {
                            id: response._id,
                            username: response.username,
                            firstName: response.firstName,
                            lastName: response.lastName,
                            email: response.email,
                            image: info.image,
                            bio: info.bio
                        }

                        const token = jwt.sign(User, process.env.SECRET_KEY, { expiresIn: "1d" });
                        return res.send({ acknowledged: true, user: User, token: token });

                    })
                } else {
                    return res.status(401).send({ acknowledged: false, msg: "Incorrect email or password"})
                }

            })
        } else {
            return res.status(401).send({ acknowledged: false, msg: "Incorrect email or password"})
        }
    })
})

module.exports = loginRouter
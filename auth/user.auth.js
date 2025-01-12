const jwt = require("jsonwebtoken")
const authRouter = require("express").Router();

authRouter.post("/api/auth", (req, res) => {
    const token = req.headers.authorization.split(" ")[1]

    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
        if (err) {
            return res.status(401).send({ acknowledged: false, msg: "Session invalid or expired" })
        }
        return res.send({ acknowledged: true, data: data })
    })
})

module.exports = authRouter
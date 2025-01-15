const cors = require('cors')
const path = require("path")
const dotenv = require('dotenv')
const express = require('express')
const socket = require('socket.io')

const conn = require("./config/db.config")
const authRouter = require("./auth/user.auth")
const loginRouter = require('./controllers/login.controller')
const { SignupRouter } = require("./controllers/signup.controller")
const communityRouter = require("./controllers/community.controller")
const eventRouter = require('./controllers/event.controller')
const postRouter = require('./controllers/post.controller')
const userRouter = require('./controllers/user.controller')

dotenv.config();
const app = express();
const PORT = 3303 || process.env.PORT;

conn();
app.use(cors({
    origin: "*",
    credentials: true
}))
app.use(express.json({ limit: '50mb' }))

app.get("/assets/*", (req, res) => {
    let image = path.join("assets", req.params[0]);
    res.sendFile(image, { root: __dirname });
})

app.post("/api/auth", authRouter)
app.post("/api/login", loginRouter)
app.post("/api/signup", SignupRouter)

app.post("/api/event", eventRouter)
app.get("/api/events", eventRouter)
app.get("/api/event/:id", eventRouter)

app.get("/api/community/fetch", communityRouter)
app.get("/api/community/fetch/:id", communityRouter)
app.post("/api/community/join", communityRouter)
app.post("/api/community/leave", communityRouter)
app.post("/api/community/create", communityRouter)

app.post("/api/post/", postRouter)
app.post("/api/posts/", postRouter)
app.get("/api/post/:id", postRouter)
app.post("/api/post/like", postRouter)
app.post("/api/post/dislike", postRouter)

app.post("/api/post/comment", postRouter)
app.get("/api/post/comment/:id", postRouter)

app.post("/api/post/reply", postRouter)

app.post("/api/user/update/profile", userRouter);

app.use((req, res) => {
    res.type('text/plain')
    res.status(404).send("404 | Not Found")
})

const server = app.listen(PORT, err => {
    err ? console.error(err) : console.log(`Server running on port localhost:${PORT}`)
})


const io = socket(server, {
    cors: {
        origin: "*",
        credentials: true
    }
})


io.on('connection', (socket) => {
    
    socket.on('add', (user) => {
        socket.emit('event-uploaded')
        console.log(user)
    })

})
const sharp = require("sharp")
const multer = require("multer")
const jwt = require("jsonwebtoken")
const eventRouter = require("express").Router()
const eventModel = require("../models/event.model")

const upload = multer({ dest: "assets/event_covers/" })

eventRouter.post("/api/event", upload.single("image"), (req, res) => {
    const { admin, title, date, description, location, category, image, tags, website, contact } = req.body

    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
        if (err) {
            return res.status(401).send({ acknowledged: false, msg: "Session expired or invalid" })
        }
    
        let bufferImage, imageName;

        if (image) {
            bufferImage = Buffer.from(image.split(",")[1], "base64")
            imageName = `${title.replace(/\s/g, "_")}_${Date.now()}.jpg`
        }

        eventModel.create({
            admin,
            title,
            date,
            description,
            location,
            category,
            poster: image ? `assets/event_covers/${imageName}` : "",
            tags,
            website,
            contact
        }).then(() => {
            if (image) {

                (async () => {
                    try {
                        await sharp(bufferImage)
                        .jpeg({ quality: 80 })
                        .resize(400).toFile(`assets/event_covers/${imageName}`)
    
                        res.status(201).json({ acknowledged: true, message: "Event created successfully" })
                    } catch (err) {
                        console.log(err)
                        res.status(500).json({ acknowledged: false, message: "Failed to upload image" })
                    }
                })()


                // require("fs").writeFile(`assets/event_covers/${imageName}`, bufferImage, "base64", err => {
                //     if (err) {
                //         res.status(500).json({ acknowledged: false, message: "Failed to upload image" })
                //     } else {
                //         res.status(201).json({ acknowledged: true, message: "Event created successfully" })
                //     }
                // })
            } else {
                return res.status(201).json({ acknowledged: true, message: "Event created successfully" })
            }
        }).catch(err => {
            res.status(500).json({ message: "Failed to create event", error: err })
        })
    })

})


eventRouter.get("/api/events", (req, res) => {
    eventModel.find().then(events => {
        return res.status(200).json(events)
    }).catch(err => {
        res.status(500).json({ message: "Failed to fetch events", error: err })
    })
})


eventRouter.get("/api/event/:id", (req, res) => {

    // const tmp = req.originalUrl.split("/")
    // const admin_id = tmp[tmp.length - 1]
    const admin_id = req.params.id;


    eventModel.find({ admin: admin_id }).then((response) => {
        return res.status(200).json(response)
    }).catch(err => {
        res.status(500).json({ message: "Failed to fetch events", error: err })
    })

})


module.exports = eventRouter
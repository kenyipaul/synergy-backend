const sharp = require("sharp")
const EventModel = require("../models/event.model");

module.exports = (socket) => {

    // POST EVENTS 

    socket.on("/create/event", (event) => {

        const { admin, title, date, description, location, category, image, tags, website, contact } = event

        let bufferImage, imageName;

        if (image) {
            bufferImage = Buffer.from(image.split(",")[1], "base64")
            imageName = `${title.replace(/\s/g, "_")}_${Date.now()}.jpg`
        }

        EventModel.create({ admin, title, date, description, location, category, poster: image ? `assets/event_covers/${imageName}` : "", tags, website, contact }).then((response) => {
            if (image) {

                (async () => {
                    try {
                        await sharp(bufferImage)
                        .jpeg({ quality: 80 })
                        .resize(400).toFile(`assets/event_covers/${imageName}`)
    
                        return socket.emit("/create/event/response", {error: false, data: response, msg: "Event posted successfully"});
                    } catch (err) {
                        return socket.emit("/create/event/response", {error: true, msg: "Failed to post event"});
                    }
                })()
                
            } else {
                return socket.emit("/create/event/response", {error: false, data: response, msg: "Event posted successfully"});
            }
        }).catch(err => {
            return socket.emit("/create/event/response", {error: true, data: response, msg: "Failed to post event"});
        })

    })


    // FETCHING EVENTS 

    socket.on("/fetch/events", () => {
        EventModel.find().then(events => {
            socket.emit("/fetch/events/response", { error: false, data: events })
        }).catch((err) => {
            socket.emit("/fetch/events/response", { error: true, msg: "Failed to fetch events" })
        })
    })


    socket.on("/delete/event", id => {
        EventModel.deleteOne({_id: id}).then((response) => {
            if (response.acknowledged) {
                EventModel.find().then(events => {
                    return socket.emit("/delete/event/response", { error: false, data: events, msg: "Event deleted successfully" })
                })
            } else {
                return socket.emit("/delete/event/response", { error: true, msg: "Failed to delete event." })
            }
        }).catch(() => {
            return socket.emit("/delete/event/response", { error: true, msg: "Failed to delete event." })
        })
    })

}
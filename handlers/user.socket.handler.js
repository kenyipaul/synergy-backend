const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const userModel = require("../models/user.model")
const EventModel = require("../models/event.model")
const nodemailer = require("nodemailer")
const { v4: uuidv4 } = require('uuid')
const postModel = require("../models/post.model")

module.exports = (socket) => {

    // AUTHENTICATE USER

    socket.on("auth/user", token => {
        jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
            if (err) {
                return socket.emit("auth/user/response", { error: true,  msg: "Session invalid or expired" })
            }
    
            userModel.findOne({_id: data.id}).then((response) => {
                
                if (response) {
                    const User = {
                        id: data.id, 
                        username: response.username,
                        firstName: response.firstName,
                        lastName: response.lastName,
                        email: response.email,
                        image: response.image,
                        bio: response.bio
                    }
        
                    socket.emit("auth/user/response", {error: false, data: User})
                } else {
                    return socket.emit("auth/user/response", { error: true,  msg: "Something went wrong when authenticating." })
                }
        
            })
    
        })
    })

    // UPDATE BIOGRAPHY

    socket.on("user/update/bio", data => {

        userModel.updateOne({_id: data.userId}, { $set: { bio: data.bio }}).then((response) => {
            if (response.acknowledged) {
                userModel.findOne({ _id: data.userId }).then((response) => {
                    socket.emit("user/update/bio/response", {error: false, data: response, msg: "Bio updated successfully"})
                })
            } else {
                socket.emit("user/update/bio/response", {error: true, msg: "Failed to update bio"})
            } 

        }).catch((err) => {
            socket.emit("user/update/bio/response", {error: true, msg: "Failed to update bio"})
        })

    })

    // UPDATE PROFILE DETAILS

    socket.on("user/update/profile", data => {
        userModel.updateOne({_id: data.id}, { $set: { username: data.username, firstName: data.firstName, lastName: data.lastName, email: data.email } }).then((response) => {
            if (response.acknowledged) {
                userModel.findOne({ _id: data.userId }).then((response) => {
                    socket.emit("user/update/profile/response", {error: false, data: response, msg: "Profile updated successfully"})
                })
            } else {
                socket.emit("user/update/profile/response", {error: true, msg: "Failed to update profile"})
            }
        })
    })

    // CHANGE PASSWORD

    socket.on("user/update/password", data => {
        userModel.findOne({email: data.email}).then(user => {
            if (user) {
                bcrypt.compare(data.currentPassword, user.password, (err, result) => {
                    err && socket.emit("user/update/password/response", { error: true, msg: "Incorrect current password" })
                    
                     bcrypt.hash(data.newPassword, 10).then((result) => {
                        userModel.findOneAndUpdate({_id: user._id}, { password: result }).then((response) => {
                            return socket.emit("user/update/password/response", { error: false, msg: "Password changed successfully" })
                        }).catch(() => {
                            return socket.emit("user/update/password/response", { error: true, msg: "Something went wrong when changing password" })
                        })
                     }).catch(() => {
                        return socket.emit("user/update/password/response", { error: true, msg: "Something went wrong when changing password" })
                     })
                })
            }
        })

    })

    // DELETE ACCOUNT

    socket.on("user/delete/account", data => {
        userModel.deleteOne({_id: data.id}).then((response) => {
            console.log(response)
            if (response.acknowledged) {
                return socket.emit("user/delete/account/response", { error: false, msg: "Account deleted successfully" })
            } else {
                return socket.emit("user/delete/account/response", { error: true, msg: "Something went wrong when trying to delete your account" })
            }
        }).catch(() => {
            return socket.emit("user/delete/account/response", { error: true, msg: "Something went wrong when trying to delete your account" })
        })
    })


    // USER'S POSTED EVENTS

    socket.on("user/event/posts", id => {
        EventModel.find({admin: id}).then((response) => {
            socket.emit("user/event/posts/response", { error: false, data: response })
        }).catch((err) => {
            socket.emit("user/event/posts/response", { error: true, msg: "Failed to fetch event posts" })
        })
    })

    // USER'S POSTED POSTS IN COMMUNITIES

    socket.on("user/community/posts", id => {
        postModel.find({admin_id: id}).then((posts) => {
            if (posts) {
                socket.emit("user/community/posts/response", { error: false, data: posts})
            }
        }).catch(e => {
            socket.emit("user/community/posts/response", { error: true, msg: "Failed to fetch community posts"})
        })
    })



    // RECOVER LOST PASSWORD 

    socket.on("user/recover/password", (email) => {

        const uniqueId = uuidv4();

        userModel.findOneAndUpdate({email: email}, { resetCode: uniqueId }).then((user) => {
            if (user) {
                (async () => {

                    const link = `http://localhost:3303/${user._id}/${uniqueId}`

                    let transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "kenyipaul69@gmail.com",
                            pass: "lgdv ajyt cijf wgbb"
                        }
                    })
            
                    let mailOptions = {
                        from: "kenyipaul69@gmail.com",
                        to: "kenyipaul69@tutanota.com",
                        subject: "Synergy Password Recovery",
                        html: `
                        <div>
                            <h3 style="font-weight: 900;" >Reset Password</h3>
                            <p style="margin: 1rem 0;">By clicking on the button below, you will be redirected to a reset form to change you password</p>
                            <a style="padding: 1rem; color: #fff; text-decoration: none; background: #27B032; display: grid; place-items: center; border-radius: .6rem;" href="${link}">Reset Password</a>
                        </div>`
                    }
        
                    try {
                        await transporter.sendMail(mailOptions)
                        socket.emit("user/recover/password/response", { error: false, msg: "Password reset link sent successfully, please check you inbox or spam"});
                    } catch (error) {
                        socket.emit("user/recover/password/response", { error: true, msg: "Failed to send email, please try again later" });
                    }
                })()

            } else {
                socket.emit("user/recover/password", { error: true, msg: "Email address not connected to any account" })
            }
        })

    })

}
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    }, 
    profileURL: {
        type: String,
        required: true
    },
    avatarURL: {
        type: String,
        required: true
    },
    steamID: {
        type: String,
        required: true
    }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
module.exports = User

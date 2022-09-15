const mongoose = require('mongoose')

const medicineSchema = new mongoose.Schema({
    medicinename: {
        type: String,
        required: true,
        trim: true
    },
    qty: {
        type: Number,
        default: 0
    },
    morning: {
        type: Boolean,
        default: false
    },
    afternoon: {
        type: Boolean,
        default: false
    },
    night: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps:true
})
const Task = mongoose.model('Medicine', medicineSchema)
module.exports = Task
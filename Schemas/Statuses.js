const mongoose = require("mongoose");

const StatusSchema = new mongoose.Schema({
    statusName: { type: String, required: true, unique: true },
    sortOrder: { type: Number, required: true },
});

module.exports = mongoose.model("Status", StatusSchema);
const mongoose = require("mongoose");

const RequestActionSchema = new mongoose.Schema({
    requestID: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RequestAction", RequestActionSchema);
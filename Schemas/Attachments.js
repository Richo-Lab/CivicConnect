const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
    requestID: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Attachment", AttachmentSchema);
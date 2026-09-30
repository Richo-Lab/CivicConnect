const mongoose = require("mongoose");
 
const RequestStatusHistorySchema = new mongoose.Schema({
    requestID: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fromStatus: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
    toStatus: { type: mongoose.Schema.Types.ObjectId, ref: "Status", required: true },
    comment: { type: String },
    changeAt: { type: Date, default: Date.now },
});
 
module.exports = mongoose.model("RequestStatusHistory", RequestStatusHistorySchema);

const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema({
    requesterID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    statusID: { type: mongoose.Schema.Types.ObjectId, ref: "Status", required: true },
    referenceNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    location: { type: String },
    priority: { type: String },
    description: { type: String },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    },
    { timestamps: true } // gives you createdAt + updatedAt automatically
);

module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema);
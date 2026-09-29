const mongoose = require("mongoose");
 
const UserSchema = new mongoose.Schema({
    roleID: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
});
 
module.exports = mongoose.model("User", UserSchema);

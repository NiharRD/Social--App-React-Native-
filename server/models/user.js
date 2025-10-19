const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true,
    max: 50,
  },
  emailId: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  phoneNo: {
    type: String,
    required: true,
    max: 10,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  dob: {
    type: String,
    max: 50,
    required: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  followers: {
    type: Array,
    default: [],
  },
  following: {
    type: Array,
    default: [],
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

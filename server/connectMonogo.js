const mongoose = require("mongoose");

function connect(url) {
  mongoose.connect(url).then(() => {
    console.log("Mongo DB has been connected");
  });
}

module.exports = { connect };

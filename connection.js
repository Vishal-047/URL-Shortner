const mongoose = require("mongoose");

async function connection(url, options) {
    return mongoose.connect(url, options);
}

module.exports = connection;
const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
    {
        username: {type: String, required: true, unique: true, trim: true},
        numCorrect: {type: Number, default: 0},
        questionsAnswered: {type: Number, default: 0}
    },
    {timestamps: true}
);

module.exports = mongoose.model("Score", scoreSchema);
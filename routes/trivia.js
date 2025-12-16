const express = require("express");
const Score = require("../models/Score");

const router = express.Router();

function normalizeAnswer(s) {
    return String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

router.get("/", (request, response) => {
    response.render("home", {
        question: null,
        username: null,
        correctAnswer: null,
        message: null
    });
});

router.post("/question", async (request, response) => {
    try {

        const username = request.body.username;

        await Score.findOneAndUpdate(
            {username},
            {
                $setOnInsert: {
                    username,
                    numCorrect: 0,
                    questionsAnswered: 0
                }
            },
            {upsert: true}
        );

        const url = "https://the-trivia-api.com/v2/questions?limit=1";
        const resp = await fetch(url);
        const [q] = await resp.json();

        const questionText = q.question?.text || q.question || "No questions available";
        const correctAnswer = q.correctAnswer || "";

        response.render("home", {
            username,
            question: questionText,
            correctAnswer,
            message: null
        });

    } catch (e) {
        console.error(e);
    }
});

router.post("/submit", async (request, response) => {
    try {
        const username = request.body.username;
        const answer = request.body.answer;
        const correctAnswer = request.body.correctAnswer;

        const isCorrect = normalizeAnswer(answer) === normalizeAnswer(correctAnswer);

        await Score.findOneAndUpdate(
            {username},
            {
                $inc: {
                    questionsAnswered: 1,
                    numCorrect: isCorrect ? 1 : 0
                }
            },
            {upsert: true}
        );

        response.render("home", {
            username, 
            question: null,
            correctAnswer: null,
            message: isCorrect ? "Correct!" : `Incorrect! Correct answer: ${correctAnswer}`
        });

    } catch (e) {
        console.error(e);
    }
});

router.get("/leaderboard", async (request, response) => {
    try {

        const rawScores = await Score.find({})
          .sort({numCorrect: -1, questionsAnswered: 1, updatedAt: 1})
          .limit(10);

        const scores = rawScores.map((s, index) => ({
            username: s.username,
            correct: s.numCorrect,
            answered: s.questionsAnswered
        }));

        response.render("leaderboard", {scores});

    } catch (e) {
        console.error(e);
    }
});

module.exports = router; 
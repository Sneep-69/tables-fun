const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const validateBtn = document.getElementById('validate');

const successSound = document.getElementById('successSound');
const failSound = document.getElementById('failSound');

let score = 0;
let a, b;

function newQuestion() {
    a = Math.floor(Math.random() * 10);
    b = Math.floor(Math.random() * 10);
    questionEl.textContent = `Combien font ${a} + ${b} ?`;
    answerEl.value = '';
    feedbackEl.textContent = '';
}
validateBtn.addEventListener('click', () => {
    const answer = parseInt(answerEl.value);
    if (answer === a + b) {
        feedbackEl.textContent = 'Bravo ! 🎉';
        feedbackEl.style.color = '#00ff88';
        successSound.play();
        score++;
        scoreEl.textContent = score;
        newQuestion();
    } else {
        feedbackEl.textContent = 'Essaie encore 😅';
        feedbackEl.style.color = '#ff4444';
        failSound.play();
    }
});
newQuestion();

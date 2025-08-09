const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

const BASE_URL = "https://to-do-list-production-b872.up.railway.app";

async function fetchTodos() {
    const res = await fetch(`${BASE_URL}/api/todos`);
    const todos = await res.json();

    list.innerHTML = "";
    let completedCount = 0;

    todos.forEach((todo) => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.done;
        if (todo.done) completedCount++;

        checkbox.addEventListener("change", async () => {
            await fetch(`${BASE_URL}/api/todos/${todo._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ done: checkbox.checked }),
            });
            triggerThemeConfetti();
            fetchTodos();
        });

        li.appendChild(checkbox);

        const span = document.createElement("span");
        span.textContent = todo.text;
        if (todo.done) span.style.textDecoration = "line-through";
        span.style.marginLeft = "10px";
        li.appendChild(span);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.marginLeft = "10px";
        editBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const newText = prompt("Edit your task:", todo.text);
            if (newText !== null && newText.trim() !== "") {
                await fetch(`${BASE_URL}/api/todos/${todo._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: newText }),
                });
                fetchTodos();
            }
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.marginLeft = "10px";
        delBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            await fetch(`${BASE_URL}/api/todos/${todo._id}`, {
                method: "DELETE"
            });
            fetchTodos();
        });

        li.appendChild(editBtn);
        li.appendChild(delBtn);
        list.appendChild(li);
    });

    const percentage = todos.length > 0
        ? ((completedCount / todos.length) * 100).toFixed(1)
        : 0;

    document.getElementById("task-progress").textContent =
        `You've completed ${percentage}% of your tasks!`;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    await fetch(`${BASE_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    input.value = "";
    fetchTodos();
});

fetchTodos();

let timerInterval;
let timeLeft = 25 * 60;
let isWorkTime = true;
let pomodorosCompleted = 0;
let cycleCount = 0;

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("start-timer");
const resetBtn = document.getElementById("reset-timer");
const completedCount = document.getElementById("completed-count");

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            if (isWorkTime) {
                pomodorosCompleted++;
                completedCount.textContent = pomodorosCompleted;
                cycleCount++;

                alert("Time's up! Take a break.");

                if (cycleCount % 4 === 0) {
                    timeLeft = 15 * 60;
                    alert("Long Break (15 minutes)");
                } else {
                    timeLeft = 5 * 60;
                    alert("Short break (5 minutes)");
                }
            } else {
                alert("Break over! Back to work.");
                timeLeft = 25 * 60;
            }

            isWorkTime = !isWorkTime;
            updateTimerDisplay();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isWorkTime = true;
    timeLeft = 25 * 60;
    updateTimerDisplay();
}

startBtn.addEventListener("click", startTimer);
resetBtn.addEventListener("click", resetTimer);

updateTimerDisplay();

const themeSelector = document.getElementById('theme-selector');

themeSelector.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    document.body.className = `theme-${selectedTheme}`;
    localStorage.setItem('selectedTheme', selectedTheme);
});

const savedTheme = localStorage.getItem('selectedTheme') || 'green';
document.body.className = `theme-${savedTheme}`;
themeSelector.value = savedTheme;

function triggerThemeConfetti() {
    const theme = document.body.className;

    let colors = ['#ffffff'];

    if (theme.includes('green')) {
        colors = ['#42a816', '#6fdc6f', '#93e29b'];
    } else if (theme.includes('sky')) {
        colors = ['#4ca9df', '#3a7ca5', '#b3e6ff'];
    } else if (theme.includes('pastel')) {
        colors = ['#ffaad5', '#ffcce6', '#ffdff0', '#ff6bb5'];
    } else if (theme.includes('lava')) {
        colors = ['#ff4d00', '#ff9900', '#cc3300', '#800000'];
    } else if (theme.includes('sunny')) {
        colors = ['#ffd700', '#ffa500', '#ffcc33', '#fff176'];
    }

    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors
    });
}

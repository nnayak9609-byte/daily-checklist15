// 1. Configuration: Shift Definitions & Daily Quotes
const shiftData = [
    { id: "M1", name: "Morning D1", color: "#FF6384", tasks: [{n:"Office (3hrs)", h:3}, {n:"Study 1", h:3}, {n:"Study 2", h:1.5}] },
    { id: "M2", name: "Morning D2", color: "#36A2EB", tasks: [{n:"Office (3hrs)", h:3}, {n:"Study 1", h:3}, {n:"Study 2", h:1.5}] },
    { id: "E3", name: "Evening D3", color: "#FFCE56", tasks: [{n:"Study 1", h:2.5}, {n:"Study 2", h:3.5}, {n:"Office (3hrs)", h:3}] },
    { id: "E4", name: "Evening D4", color: "#4BC0C0", tasks: [{n:"Study 1", h:2.5}, {n:"Study 2", h:3.5}, {n:"Office (3hrs)", h:3}] },
    { id: "N1", name: "Night 1st", color: "#9966FF", tasks: [{n:"Study 1", h:2.5}, {n:"Study 2", h:4.5}, {n:"Office (3hrs)", h:3}] },
    { id: "N2", name: "Night 2nd", color: "#FF9F40", tasks: [{n:"Study 1", h:3}, {n:"Study 2", h:2.5}, {n:"Office (3hrs)", h:3}] },
    { id: "OD", name: "Off Day", color: "#95a5a6", tasks: [{n:"Study 1", h:3}, {n:"Study 2", h:2.5}] },
    { id: "GS", name: "General", color: "#27ae60", tasks: [{n:"Study 1", h:3}, {n:"Study 2", h:3.5}] }
];

const quotes = [
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Success is the sum of small efforts repeated daily.",
    "Action is the foundational key to all success.",
    "Don't stop until you're proud.",
    "Focus on being productive instead of busy.",
    "Your future self will thank you for what you do today."
];

// 2. Global Variables
let pChart, tChart, swInterval, swSec = 0, alarmInt;

// 3. Initialization
window.onload = () => {
    // Set the Anchor Date if it doesn't exist (Sets it to Midnight today)
    if(!localStorage.getItem('rota_anchor_date')) {
        let today = new Date();
        today.setHours(0,0,0,0);
        localStorage.setItem('rota_anchor_date', today.toISOString());
    }

    document.getElementById('daily-quote').innerText = `"${quotes[new Date().getDay() % quotes.length]}"`;
    document.getElementById('date-display').innerText = new Date().toDateString();
    
    renderUI();
    initCharts();
    loadAllData();
};

// 4. Core UI Functions (Now with Auto-Cycle/Day Logic)
function renderUI() {
    // CALCULATION LOGIC
    const anchor = new Date(localStorage.getItem('rota_anchor_date'));
    const now = new Date();
    
    // Normalize to UTC Midnight to ensure accurate calendar day counting
    const d1 = Date.UTC(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
    const d2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    
    const totalDaysPassed = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    
    const currentCycle = Math.floor(totalDaysPassed / 8) + 1;
    const currentDayIdx = (totalDaysPassed % 8); 

    // Update Header Title
    document.getElementById('rota-display-title').innerText = `Cycle ${currentCycle} | Day ${currentDayIdx + 1}: Active`;

    const container = document.getElementById('schedule-container');
    container.innerHTML = shiftData.map((s, idx) => {
        const isToday = (idx === currentDayIdx);
        return `
            <div class="shift-card ${isToday ? 'active-day' : ''}" style="border-top-color: ${s.color}">
                ${isToday ? '<span class="today-badge">TODAY</span>' : ''}
                <h3 style="color: ${s.color}; margin-top:0">${s.name}</h3>
                <table>
                    ${s.tasks.map(t => `
                        <tr>
                            <td>${t.n}</td>
                            <td>${t.h}h</td>
                            <td style="text-align:right">
                                <input type="checkbox" class="t-check" data-shift="${idx}" data-hrs="${t.h}" onchange="updateCharts()">
                            </td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
    }).join('');
}

function initCharts() {
    const opt = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    pChart = new Chart(document.getElementById('progressChart'), {
        type: 'line', 
        data: { labels: shiftData.map(s => s.name), datasets: [{ label: '% Done', data: [], borderColor: '#0984e3', fill: true }] },
        options: opt
    });
    tChart = new Chart(document.getElementById('timeChart'), {
        type: 'bar', 
        data: { labels: shiftData.map(s => s.name), datasets: [{ data: [], backgroundColor: shiftData.map(s => s.color) }] },
        options: opt
    });
}

function updateCharts() {
    let totalHrs = 0;
    const pData = []; const tData = [];
    shiftData.forEach((s, idx) => {
        const total = document.querySelectorAll(`.t-check[data-shift="${idx}"]`);
        const done = document.querySelectorAll(`.t-check[data-shift="${idx}"]:checked`);
        let h = 0; done.forEach(c => h += parseFloat(c.dataset.hrs));
        pData.push(total.length ? (done.length / total.length) * 100 : 0);
        tData.push(h); totalHrs += h;
    });
    pChart.data.datasets[0].data = pData; tChart.data.datasets[0].data = tData;
    pChart.update(); tChart.update();
    document.getElementById('weekly-total').innerText = totalHrs.toFixed(1);
}

// 5. Stopwatch Logic
function toggleStopwatch() {
    const btn = document.getElementById('sw-btn');
    if (swInterval) {
        clearInterval(swInterval); swInterval = null; btn.innerText = "Start Focus";
    } else {
        swInterval = setInterval(() => {
            swSec++;
            let h = Math.floor(swSec/3600), m = Math.floor((swSec%3600)/60), s = swSec%60;
            document.getElementById('stopwatch').innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }, 1000);
        btn.innerText = "Stop";
    }
}

function resetStopwatch() {
    clearInterval(swInterval); swInterval = null; swSec = 0;
    document.getElementById('stopwatch').innerText = "00:00:00";
    document.getElementById('sw-btn').innerText = "Start Focus";
}

// 6. Alarm Logic
function setAlarm() {
    const time = document.getElementById('alarm-time').value;
    if(!time) return;
    if(alarmInt) clearInterval(alarmInt);
    alert("Alarm set for " + time);
    alarmInt = setInterval(() => {
        const now = new Date();
        const cur = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        if(cur === time) {
            document.getElementById('alarm-sound').play();
            document.getElementById('stop-alarm-btn').style.display = "inline-block";
        }
    }, 1000);
}

function stopAlarmSound() {
    const audio = document.getElementById('alarm-sound');
    audio.pause(); audio.currentTime = 0;
    document.getElementById('stop-alarm-btn').style.display = "none";
}

function resetAlarm() {
    clearInterval(alarmInt); 
    document.getElementById('alarm-time').value = ""; 
    stopAlarmSound();
}

// 7. Next Day Targets
function addTarget() {
    const inp = document.getElementById('target-text'); if(!inp.value) return;
    const tgs = JSON.parse(localStorage.getItem('next_day_targets') || '[]');
    tgs.push({ id: Date.now(), txt: inp.value, done: false });
    localStorage.setItem('next_day_targets', JSON.stringify(tgs));
    inp.value = ''; renderTargets();
}

function renderTargets() {
    const tgs = JSON.parse(localStorage.getItem('next_day_targets') || '[]');
    document.getElementById('target-list').innerHTML = tgs.map(t => `
        <li>
            <input type="checkbox" ${t.done?'checked':''} onchange="toggleT(${t.id})">
            <span style="${t.done?'text-decoration:line-through;opacity:0.5':''}">${t.txt}</span>
            <button onclick="delT(${t.id})" style="background:none;color:red;margin-left:auto">✕</button>
        </li>`).join('');
}

function toggleT(id) {
    let tgs = JSON.parse(localStorage.getItem('next_day_targets'));
    tgs = tgs.map(t => t.id === id ? {...t, done: !t.done} : t);
    localStorage.setItem('next_day_targets', JSON.stringify(tgs)); renderTargets();
}

function delT(id) {
    let tgs = JSON.parse(localStorage.getItem('next_day_targets'));
    localStorage.setItem('next_day_targets', JSON.stringify(tgs.filter(t => t.id !== id))); renderTargets();
}

// 8. Data Management
function saveData() {
    const progress = Array.from(document.querySelectorAll('.t-check')).map(c => c.checked);
    localStorage.setItem('rota_progress_data', JSON.stringify(progress));
    alert("Success: All progress saved!");
}

function loadAllData() {
    if(localStorage.getItem('theme_pref') === 'dark') document.body.classList.add('dark-theme');
    const saved = JSON.parse(localStorage.getItem('rota_progress_data'));
    if(saved) {
        const checks = document.querySelectorAll('.t-check');
        checks.forEach((c, i) => { if(saved[i]) c.checked = true; });
    }
    renderTargets(); updateCharts();
}

function exportCSV() {
    let csv = "Shift,Hours Completed\n";
    shiftData.forEach((s, idx) => {
        const checked = document.querySelectorAll(`.t-check[data-shift="${idx}"]:checked`);
        let h = 0; checked.forEach(c => h += parseFloat(c.dataset.hrs));
        csv += `${s.name},${h}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `Study_Report_Export.csv`;
    a.click();
}

function startNewRota() {
    if(confirm("Start new cycle? This clears checks for a fresh Rota cycle.")) {
        let today = new Date();
        today.setHours(0,0,0,0);
        localStorage.setItem('rota_anchor_date', today.toISOString());
        localStorage.removeItem('rota_progress_data');
        location.reload();
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme_pref', isDark ? 'dark' : 'light');
}

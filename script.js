// 1. Список стран
let countries = [
    { id: 'cyprus', name: "Кипр", points: 0, flag: "https://flagcdn.com/w80/cy.png", vJury: false },
    { id: 'croatia', name: "Хорватия", points: 0, flag: "https://flagcdn.com/w80/hr.png", vJury: false },
    { id: 'venezuela', name: "Венесуэла", points: 0, flag: "https://flagcdn.com/w80/ve.png", vJury: false }
];

// 2. Очередь (по 2 голоса за каждую страну)
const friendlyQueue = [
    { from: "Хорватия", to: "Кипр" },
    { from: "Венесуэла", to: "Кипр" },
    { from: "Кипр", to: "Хорватия" },
    { from: "Венесуэла", to: "Хорватия" },
    { from: "Кипр", to: "Венесуэла" },
    { from: "Хорватия", to: "Венесуэла" }
];

let currentQueueIndex = 0;
let currentStage = 'START'; 
let selectedCountryId = null;

// Элементы интерфейса
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const scoreInput = document.getElementById('score-input');
const inputModal = document.getElementById('input-modal');

// Эффект следования света за мышкой на фоне
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.body.style.setProperty('--x', x + '%');
    document.body.style.setProperty('--y', y + '%');
});
function render() {
    const container = document.getElementById('chart-container');
    const sorted = [...countries].sort((a, b) => b.points - a.points);
    const maxPoints = Math.max(...countries.map(c => c.points), 100);

    container.innerHTML = '';

    let targetCountryId = "";
    if (currentStage === 'FRIENDLY' && currentQueueIndex < friendlyQueue.length) {
        const targetName = friendlyQueue[currentQueueIndex].to;
        targetCountryId = countries.find(c => c.name === targetName).id;
        document.getElementById('turn-indicator').innerText = `ОЧЕРЕДЬ: ${friendlyQueue[currentQueueIndex].from} голосует за ${friendlyQueue[currentQueueIndex].to}`;
    }

    sorted.forEach((c) => {
        const widthPercent = (c.points / (maxPoints * 1.1)) * 100;
        const line = document.createElement('div');
        line.className = 'country-line';
        
        // Логика активности полосок
        if (currentStage === 'FRIENDLY') {
            if (c.id === targetCountryId) {
                line.classList.add('active-turn');
                line.onclick = () => openVoteModal(c.id);
            } else {
                line.classList.add('disabled');
            }
        } else if (currentStage === 'JURY') {
            if (!c.vJury) {
                line.onclick = () => openVoteModal(c.id);
            } else {
                line.classList.add('disabled');
            }
            document.getElementById('turn-indicator').innerText = "ЭТАП: ГОЛОСОВАНИЕ ЖЮРИ";
        }

        line.innerHTML = `
            <div class="country-label"><img src="${c.flag}" class="flag"><span>${c.name}</span></div>
            <div class="bar-wrapper"><div class="bar-fill" style="width: ${widthPercent}%"><span class="score-text">${c.points}</span></div></div>
        `;
        container.appendChild(line);
    });
}
function openVoteModal(id) {
    const country = countries.find(c => c.id === id);
    selectedCountryId = id;
    
    // Прячем логотип внизу, чтобы не мешал
    document.body.classList.add('modal-open');

    if (currentStage === 'FRIENDLY') {
        const voteInfo = friendlyQueue[currentQueueIndex];
        document.getElementById('modal-who-votes').innerText = `ГОЛОС ОТ: ${voteInfo.from.toUpperCase()}`;
    } else {
        document.getElementById('modal-who-votes').innerText = `ГОЛОС ОТ ЖЮРИ`;
    }

    document.getElementById('modal-country-name').innerText = country.name;
    scoreInput.value = '';
    inputModal.style.display = 'flex';
    setTimeout(() => scoreInput.focus(), 100);
}

function submitVote() {
    const val = parseInt(scoreInput.value);
    const country = countries.find(c => c.id === selectedCountryId);

    if (currentStage === 'FRIENDLY') {
        if (val === 15 || val === 25) {
            country.points += val;
            currentQueueIndex++;
            finishVote();
        } else { alert("Введите 15 или 25 баллов!"); }
    } else if (currentStage === 'JURY') {
        if (!isNaN(val) && val >= 0 && val <= 528) {
            country.points += val;
            country.vJury = true;
            finishVote();
        } else { alert("Введите число от 0 до 528!"); }
    }
}

function finishVote() {
    closeModal();
    render();
    checkProgress();
}

function closeModal() {
    inputModal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

scoreInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') submitVote(); });
function checkProgress() {
    if (currentStage === 'FRIENDLY' && currentQueueIndex >= friendlyQueue.length) {
        setTimeout(triggerStageSwitch, 1200);
    } else if (currentStage === 'JURY' && countries.every(c => c.vJury)) {
        setTimeout(showFinal, 1200);
    }
}

function triggerStageSwitch() {
    const overlay = document.getElementById('stage-overlay');
    overlay.classList.add('flash-animation');
    setTimeout(() => {
        currentStage = 'JURY';
        document.getElementById('main-title').innerText = "Голосование Жюри";
        render();
    }, 400);
    setTimeout(() => overlay.classList.remove('flash-animation'), 800);
}

function showFinal() {
    // Взрыв конфетти
    confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 }, colors: ['#ff6600', '#ffffff', '#ffec00'] });

    const modal = document.getElementById('final-modal');
    const podium = document.getElementById('podium');
    countries.sort((a, b) => b.points - a.points);

    podium.innerHTML = countries.map((c, i) => `
        <div class="result-item" style="${i === 0 ? 'font-size: 1.8rem; background: #fff8e1; border: 2px solid #000;' : ''}">
            <b>${i + 1} МЕСТО:</b> ${c.name} — ${c.points} б.
        </div>`).join('');
    
    modal.style.display = 'flex';
}

startBtn.onclick = () => {
    startScreen.style.opacity = '0';
    setTimeout(() => {
        startScreen.style.display = 'none';
        document.getElementById('main-header').style.display = 'block';
        document.getElementById('chart-container').style.display = 'flex';
        currentStage = 'FRIENDLY';
        render();
    }, 1000);
};

// Первый запуск для инициализации
render();

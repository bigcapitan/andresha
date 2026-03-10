let countries = [
    { id: 'cyprus', name: "Кипр", points: 0, flag: "https://flagcdn.com/w80/cy.png", vFriendly: false, vJury: false },
    { id: 'croatia', name: "Хорватия", points: 0, flag: "https://flagcdn.com/w80/hr.png", vFriendly: false, vJury: false },
    { id: 'venezuela', name: "Венесуэла", points: 0, flag: "https://flagcdn.com/w80/ve.png", vFriendly: false, vJury: false }
];

let currentStage = 'FRIENDLY';
let selectedCountryId = null;

function render() {
    const container = document.getElementById('chart-container');
    // Сортируем страны для визуального порядка (кто больше — тот выше)
    const sorted = [...countries].sort((a, b) => b.points - a.points);
    
    // Максимальное количество баллов для масштаба полоски (минимум 100)
    const maxPoints = Math.max(...countries.map(c => c.points), 100);

    container.innerHTML = '';
    sorted.forEach((c) => {
        const widthPercent = (c.points / (maxPoints * 1.1)) * 100;
        
        const line = document.createElement('div');
        line.className = 'country-line';
        line.onclick = () => openVoteModal(c.id);
        
        line.innerHTML = `
            <div class="country-label">
                <img src="${c.flag}" class="flag">
                <span>${c.name}</span>
            </div>
            <div class="bar-wrapper">
                <div class="bar-fill" style="width: ${widthPercent}%">
                    <span class="score-text">${c.points}</span>
                </div>
            </div>
        `;
        container.appendChild(line);
    });
}

function openVoteModal(id) {
    const country = countries.find(c => c.id === id);
    if ((currentStage === 'FRIENDLY' && country.vFriendly) || (currentStage === 'JURY' && country.vJury)) return;

    selectedCountryId = id;
    document.getElementById('modal-country-name').innerText = country.name;
    document.getElementById('score-input').value = '';
    document.getElementById('input-modal').style.display = 'flex';
}

function submitVote() {
    const val = parseInt(document.getElementById('score-input').value);
    const country = countries.find(c => c.id === selectedCountryId);

    if (currentStage === 'FRIENDLY') {
        if (val === 15 || val === 25) {
            country.points += val;
            country.vFriendly = true;
            next();
        } else { alert("Введите 15 или 25"); }
    } else {
        if (val >= 0 && val <= 528) {
            country.points += val;
            country.vJury = true;
            next();
        } else { alert("Введите от 0 до 528"); }
    }
}

function next() {
    document.getElementById('input-modal').style.display = 'none';
    render();
    
    // Проверка перехода этапа
    if (currentStage === 'FRIENDLY' && countries.every(c => c.vFriendly)) {
        triggerStageSwitch();
    } else if (currentStage === 'JURY' && countries.every(c => c.vJury)) {
        setTimeout(showFinal, 1000);
    }
}

function triggerStageSwitch() {
    const overlay = document.getElementById('stage-overlay');
    overlay.classList.add('flash-animation');
    
    setTimeout(() => {
        currentStage = 'JURY';
        document.getElementById('main-title').innerText = "Голосование Жюри(0-528)";
        document.getElementById('main-title').style.color = "#ffffff";
        document.body.style.background = "#2a1000"; // Меняем фон на более темный оранжевый
    }, 400);

    setTimeout(() => overlay.classList.remove('flash-animation'), 800);
}

function showFinal() {
    // Конфетти!
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff6600', '#ffffff', '#ffcc00'] });

    const modal = document.getElementById('final-modal');
    const podium = document.getElementById('podium');
    countries.sort((a, b) => b.points - a.points);
    
    podium.innerHTML = countries.map((c, i) => `
        <div style="margin: 10px; font-size: ${i===0?'2rem':'1.2rem'}">
            ${i+1} МЕСТО: ${c.name} (${c.points} б.)
        </div>
    `).join('');
    modal.style.display = 'flex';
}

function closeModal() { document.getElementById('input-modal').style.display = 'none'; }

render();

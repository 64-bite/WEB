const form = document.getElementById('analysisForm');
const messageDiv = document.getElementById('message');
const resultDiv = document.getElementById('result');
const historyDiv = document.getElementById('history');

let calculationHistory = [];

document.addEventListener('DOMContentLoaded', () => {
	loadHistory();
});

form.addEventListener('submit', (e) => {
	e.preventDefault();
	calculateLosses();
});

function calculateLosses() {
	const section = parseFloat(document.getElementById('section').value);
	const voltage = parseFloat(document.getElementById('voltage').value);
	const length = parseFloat(document.getElementById('length').value);
	const power = parseFloat(document.getElementById('power').value);


	if (!section || !voltage || !length || !power) {
		showMessage('error', 'Заповніть всі поля');
		return;
	}

	const resistance = (0.0175 * length * 2) / section;
	const current = power / (voltage * Math.sqrt(3));
	const losses = 3 * current * current * resistance;
	const lossesPercent = (losses / power) * 100;

	const calculation = {
		timestamp: new Date().toISOString(),
		section,
		voltage,
		length,
		power,
		resistance: resistance.toFixed(4),
		current: current.toFixed(2),
		losses: losses.toFixed(2),
		lossesPercent: lossesPercent.toFixed(2)
	};

	calculationHistory.unshift(calculation);
	if (calculationHistory.length > 20) {
		calculationHistory.pop();
	}

	saveHistory();
	displayResult(calculation);
	displayHistory();
	showMessage('success', 'Розрахунок виконано успішно');
}

function displayResult(data) {
	resultDiv.innerHTML = `
		<div class="result-card">
			<h3>Результати розрахунку</h3>
			<div class="result-grid">
				<div class="result-item">
					<span class="result-label">Переріз проводу</span>
					<span class="result-value">${data.section} мм²</span>
				</div>
				<div class="result-item">
					<span class="result-label">Напруга</span>
					<span class="result-value">${data.voltage} В</span>
				</div>
				<div class="result-item">
					<span class="result-label">Довжина лінії</span>
					<span class="result-value">${data.length} км</span>
				</div>
				<div class="result-item">
					<span class="result-label">Потужність</span>
					<span class="result-value">${data.power} кВт</span>
				</div>
			</div>
			<div class="result-divider"></div>
			<div class="result-grid">
				<div class="result-item">
					<span class="result-label">Опір лінії</span>
					<span class="result-value">${data.resistance} Ом</span>
				</div>
				<div class="result-item">
					<span class="result-label">Струм</span>
					<span class="result-value">${data.current} А</span>
				</div>
				<div class="result-item">
					<span class="result-label">Втрати потужності</span>
					<span class="result-value highlight">${data.losses} Вт</span>
				</div>
				<div class="result-item">
					<span class="result-label">Втрати у %</span>
					<span class="result-value highlight">${data.lossesPercent}%</span>
				</div>
			</div>
		</div>
	`;
}

function displayHistory() {
	if (calculationHistory.length === 0) {
		historyDiv.innerHTML =
			'<p style="color: #999; text-align: center;">Історія розрахунків порожня</p>';
		return;
	}

	historyDiv.innerHTML = `
		<h3>Історія розрахунків</h3>
		<div class="history-list">
			${calculationHistory
				.map(
					(calc, idx) => `
			<div class="history-item">
				<div class="history-header">
					<span class="history-date">${new Date(
						calc.timestamp
					).toLocaleString('uk-UA')}</span>
					<button class="btn btn-small" onclick="deleteCalculation(${idx})">Видалити</button>
				</div>
				<div class="history-content">
					<p><span>Переріз:</span> ${calc.section} мм² | <span>Напруга:</span> ${calc.voltage} В | <span>Довжина:</span> ${calc.length} км</p>
					<p><span>Потужність:</span> ${calc.power} кВт | <span>Втрати:</span> <strong>${calc.losses} Вт (${calc.lossesPercent}%)</strong></p>
				</div>
			</div>
			`
				)
				.join('')}
		</div>
	`;
}

function deleteCalculation(idx) {
	if (confirm('Видалити цей розрахунок?')) {
		calculationHistory.splice(idx, 1);
		saveHistory();
		displayHistory();
		showMessage('success', 'Розрахунок видалено');
	}
}

function showMessage(type, text) {
	messageDiv.className = `message ${type}`;
	messageDiv.textContent = text;
	messageDiv.style.display = 'block';
	setTimeout(() => {
		messageDiv.style.display = 'none';
	}, 4000);
}

function saveHistory() {
	localStorage.setItem(
		'energyLossesHistory',
		JSON.stringify(calculationHistory)
	);
}

function loadHistory() {
	const saved = localStorage.getItem('energyLossesHistory');
	if (saved) {
		calculationHistory = JSON.parse(saved);
		displayHistory();
	}
}
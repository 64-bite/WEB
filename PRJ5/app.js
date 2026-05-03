class MicrogridMonitor {
    constructor() {
        this.chart = null;
        this.dataHistory = [];
        this.initChart();
        this.connectWebSocket();
    }

    initChart() {
        const ctx = document.getElementById('powerChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Генерація (кВт)',
                        data: [],
                        borderColor: 'rgb(40, 167, 69)',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Споживання (кВт)',
                        data: [],
                        borderColor: 'rgb(220, 53, 69)',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Потужність (кВт)' }
                    },
                    x: {
                        title: { display: true, text: 'Час' }
                    }
                }
            }
        });
    }

    connectWebSocket() {
        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.onopen = () => {
            const statusEl = document.getElementById('status');
            statusEl.textContent = 'Онлайн';
            statusEl.className = 'status-online';
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateDisplay(data);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            const statusEl = document.getElementById('status');
            statusEl.textContent = 'Офлайн';
            statusEl.className = 'status-offline';
            setTimeout(() => this.connectWebSocket(), 5000); // Автоперепідключення
        };
    }

    updateDisplay(data) {
        document.getElementById('generation').textContent = `${data.generation.toFixed(2)} кВт`;
        document.getElementById('load').textContent = `${data.load.toFixed(2)} кВт`;
        document.getElementById('balance').textContent = `${data.balance.toFixed(2)} кВт`;
        
        const gridText = data.gridFlow > 0 ? `Експорт: ${data.gridFlow.toFixed(2)}` : `Імпорт: ${Math.abs(data.gridFlow).toFixed(2)}`;
        document.getElementById('grid').textContent = `${gridText} кВт`;

        const batteryBar = document.getElementById('batteryBar');
        batteryBar.style.width = `${data.battery}%`;
        
        if(data.battery < 20) batteryBar.style.backgroundColor = '#dc3545';
        else if(data.battery < 50) batteryBar.style.backgroundColor = '#ffc107';
        else batteryBar.style.backgroundColor = '#28a745';
        
        document.getElementById('batteryText').textContent = `${data.battery.toFixed(1)} %`;

        const time = new Date(data.timestamp).toLocaleTimeString('uk-UA');
        this.chart.data.labels.push(time);
        this.chart.data.datasets[0].data.push(data.generation);
        this.chart.data.datasets[1].data.push(data.load);

        if (this.chart.data.labels.length > 20) {
            this.chart.data.labels.shift();
            this.chart.data.datasets[0].data.shift();
            this.chart.data.datasets[1].data.shift();
        }
        this.chart.update();

        this.dataHistory.unshift(data);
        if (this.dataHistory.length > 15) {
            this.dataHistory.pop();
        }
        this.updateTable();
    }

    updateTable() {
        const tableDiv = document.getElementById('dataTable');
        const table = document.createElement('table');
        table.className = 'table table-striped table-hover mt-3';

        table.innerHTML = `
            <thead class="table-dark">
                <tr>
                    <th>Час</th>
                    <th>Генерація (кВт)</th>
                    <th>Навантаження (кВт)</th>
                    <th>Баланс (кВт)</th>
                    <th>Батарея (%)</th>
                    <th>Мережа (кВт)</th>
                </tr>
            </thead>
            <tbody>
                ${this.dataHistory.map(item => `
                    <tr>
                        <td>${new Date(item.timestamp).toLocaleTimeString('uk-UA')}</td>
                        <td>${item.generation.toFixed(2)}</td>
                        <td>${item.load.toFixed(2)}</td>
                        <td>${item.balance.toFixed(2)}</td>
                        <td>${item.battery.toFixed(1)}</td>
                        <td>${item.gridFlow.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        tableDiv.innerHTML = '';
        tableDiv.appendChild(table);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MicrogridMonitor();
});
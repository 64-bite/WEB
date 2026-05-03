const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket сервер мікрогріду запущено на порту 8080');

let currentBattery = 75;

function generateMicrogridData() {
    const generation = Math.max(0, 50 + (Math.random() - 0.5) * 40);
    const load = 40 + (Math.random() - 0.5) * 30;
    const balance = generation - load;
  
    let gridFlow = 0;
    
    if (balance > 0) {
        if (currentBattery < 100) {
            currentBattery += balance * 0.05;
            gridFlow = balance * 0.2;
        } else {
            currentBattery = 100;
            gridFlow = balance;
        }
    } else {
        if (currentBattery > 10) {
            currentBattery += balance * 0.05;
            gridFlow = balance * 0.2;
        } else {
            currentBattery = 10;
            gridFlow = balance;
        }
    }

    return {
        timestamp: Date.now(),
        generation: generation,
        load: load,
        balance: balance,
        battery: currentBattery,
        gridFlow: gridFlow
    };
}

wss.on('connection', (ws) => {
    console.log('Клієнт підключився до панелі моніторингу');

    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const data = generateMicrogridData();
            ws.send(JSON.stringify(data));
        }
    }, 2000);

    ws.on('close', () => {
        console.log('Клієнт відключився');
        clearInterval(interval);
    });

    ws.on('error', (error) => {
        console.error('Помилка WebSocket:', error);
        clearInterval(interval);
    });
});
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Дані диспетчерського центру
let dispatchCenter = {
  id: 1,
  name: "Центральний диспетчерський центр",
  monitoredObjects: 110,
  totalGeneration: 35,
  totalLoad: 10,
  frequency: 50,
  systemBalance: 25,
  alarmCount: 3,
  operatorCount: 5
};

let controlledObjects = [
  { id: 1, name: "Підстанція 1", type: "substation" },
  { id: 2, name: "Генератор 1", type: "generator" },
  { id: 3, name: "Лінія передач 1", type: "transmission_line" }
];

let alarms = [
  { id: 1, message: "Перевантаження на лінії 1", level: "warning", timestamp: "2023-10-01T10:00:00Z" },
  { id: 2, message: "Низька частота", level: "critical", timestamp: "2023-10-01T10:05:00Z" }
];

let commands = [];

// GET /api/dispatch-center - Отримати дані центру
app.get('/api/dispatch-center', (req, res) => {
  res.json(dispatchCenter);
});

// GET /api/dispatch-center/objects - Список всіх підконтрольних об'єктів
app.get('/api/dispatch-center/objects', (req, res) => {
  res.json(controlledObjects);
});

// GET /api/dispatch-center/alarms - Отримати активні тривоги
app.get('/api/dispatch-center/alarms', (req, res) => {
  res.json(alarms);
});

// GET /api/dispatch-center/balance - Баланс системи
app.get('/api/dispatch-center/balance', (req, res) => {
  res.json({ balance: dispatchCenter.systemBalance });
});

// POST /api/dispatch-center/commands - Відправити команду управління
app.post('/api/dispatch-center/commands', (req, res) => {
  const { command, target, parameters } = req.body;
  if (!command || !target) {
    return res.status(400).json({ error: 'Відсутні обов\'язкові поля: command, target' });
  }
  const newCommand = {
    id: commands.length + 1,
    command,
    target,
    parameters: parameters || {},
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  commands.push(newCommand);
  res.status(201).json(newCommand);
});

// PUT /api/dispatch-center - Оновити параметри центру
app.put('/api/dispatch-center', (req, res) => {
  Object.assign(dispatchCenter, req.body);
  res.json(dispatchCenter);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 REST API сервер запущено на http://localhost:${PORT}`);
  console.log(`📊 Доступні endpoints:`);
  console.log(` GET /api/dispatch-center`);
  console.log(` GET /api/dispatch-center/objects`);
  console.log(` GET /api/dispatch-center/alarms`);
  console.log(` GET /api/dispatch-center/balance`);
  console.log(` POST /api/dispatch-center/commands`);
  console.log(` PUT /api/dispatch-center`);
});
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Тестування REST API...\n');

  try {
    // 1. GET - дані центру
    console.log('1⃣GET /api/dispatch-center');
    let response = await fetch(`${BASE_URL}/dispatch-center`);
    let data = await response.json();
    console.log('Відповідь:', data);
    console.log('---\n');

    // 2. GET - підконтрольні об'єкти
    console.log('2⃣GET /api/dispatch-center/objects');
    response = await fetch(`${BASE_URL}/dispatch-center/objects`);
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('---\n');

    // 3. GET - активні тривоги
    console.log('3⃣GET /api/dispatch-center/alarms');
    response = await fetch(`${BASE_URL}/dispatch-center/alarms`);
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('---\n');

    // 4. GET - баланс системи
    console.log('4⃣GET /api/dispatch-center/balance');
    response = await fetch(`${BASE_URL}/dispatch-center/balance`);
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('---\n');

    // 5. POST - відправити команду
    console.log('5⃣POST /api/dispatch-center/commands');
    const newCommand = {
      command: "increase_generation",
      target: "generator_1",
      parameters: { amount: 5 }
    };
    response = await fetch(`${BASE_URL}/dispatch-center/commands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCommand)
    });
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('---\n');

    // 6. PUT - оновити параметри центру
    console.log('6⃣PUT /api/dispatch-center');
    response = await fetch(`${BASE_URL}/dispatch-center`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalLoad: 15, alarmCount: 4 })
    });
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('---\n');

    console.log('✅ Тестування завершено успішно!');
  } catch (error) {
    console.error('❌ Помилка:', error.message);
  }
}

testAPI();
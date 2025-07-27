import axios from 'axios';

const BASE_URL = 'http://localhost:4000/damage_logs';

async function sendDamageLog() {
  const damageLog = {
    steam_id: '76561198000000000', // 테스트용 Steam ID
    damage: 150.5, // 데미지 값
    server_id: 'test-server-001', // 서버 ID
  };

  try {
    const response = await axios.post(BASE_URL, damageLog, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('POST Response:', response.data);
  } catch (error) {
    console.error('POST Request Error:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
}

async function runTest() {
  console.log('Sending damage log...');
  await sendDamageLog();
}

runTest();

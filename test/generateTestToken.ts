import * as jwt from 'jsonwebtoken';
import axios, { AxiosError } from 'axios';

const secret = 'your-secret-key';
const payload = {
  id: 1,
  steam_id: '76561198267339203',
  username: 'qwas',
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' }); // 1시간 유효
console.log('Generated Test Token:', token);

// 테스트 요청 보내기
async function testGetItems(): Promise<void> {
  const apiUrl = 'http://localhost:4000/items'; // API 엔드포인트 URL

  try {
    console.log(`Sending request to ${apiUrl} with token...`);
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`, // 생성된 토큰을 Authorization 헤더에 추가
      },
    });
    console.log('Response:', response.data);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('Error Response:', error.response.data);
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Run the test and handle the promise properly
testGetItems()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Test failed:', err);
    process.exit(1);
  });

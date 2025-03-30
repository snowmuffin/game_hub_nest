import axios from 'axios';

async function testGetItems() {
  const apiUrl = 'http://localhost:4000/space-engineers/item'; // API 엔드포인트 URL (수정 필요)
  const steam_id = '76561198267339203'; // 테스트할 Steam ID (수정 필요)

  try {
    console.log(`Testing getItems API with Steam ID: ${steam_id}`);
    const response = await axios.get(`${apiUrl}?steam_id=${steam_id}`);
    console.log('Response:');
    console.log(JSON.stringify(response.data, null, 2)); // JSON 데이터를 포맷팅하여 출력
  } catch (error) {
    if (error.response) {
      console.error('Error Response:');
      console.error(JSON.stringify(error.response.data, null, 2)); // 에러 응답도 포맷팅하여 출력
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGetItems();
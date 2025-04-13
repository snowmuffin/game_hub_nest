const axios = require('axios');

const BASE_URL = 'http://localhost:4000/space-engineers/item/upload'; // API 엔드포인트
const STEAM_ID = '76561198267339203'; // 대상 유저의 Steam ID

async function addItems() {
  for (let i = 1; i <= 100; i++) {
    const identifier = `${i}`; // 아이템 이름 또는 ID
    const quantity = 10; // 추가할 수량

    try {
      console.log(`Sending request for identifier: ${identifier}`);
      const response = await axios.post(BASE_URL, {
        userId: STEAM_ID,
        itemName: identifier,
        quantity: quantity,
      });

      console.log(`Success: ${response.data.message}`);
    } catch (error) {
      console.error(`Error adding ${identifier}:`, error.response?.data || error.message);
    }
  }
}

addItems();
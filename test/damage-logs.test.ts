import axios from 'axios';

const BASE_URL = 'http://localhost:4000/damage_logs';

async function testGetRequest() {
  try {
    const response = await axios.get(BASE_URL, {
      params: { param1: 'value1', param2: 'value2' },
    });
    console.log('GET Response:', response.data);
  } catch (error) {
    console.error('GET Request Error:', error.message);
  }
}

async function testPostRequest() {
  try {
    const response = await axios.post(BASE_URL, {
      key1: 'value1',
      key2: 'value2',
    });
    console.log('POST Response:', response.data);
  } catch (error) {
    console.error('POST Request Error:', error.message);
  }
}

async function runTests() {
  console.log('Testing GET Request...');
  await testGetRequest();

  console.log('Testing POST Request...');
  await testPostRequest();
}

runTests();
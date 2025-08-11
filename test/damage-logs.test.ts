import axios, { AxiosError } from 'axios';

const BASE_URL = 'http://localhost:4000/damage_logs';

async function testGetRequest(): Promise<void> {
  try {
    const response = await axios.get(BASE_URL, {
      params: { param1: 'value1', param2: 'value2' },
    });
    console.log('GET Response:', response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('GET Request Error:', error.message);
    } else if (error instanceof Error) {
      console.error('GET Request Error:', error.message);
    } else {
      console.error('GET Request Error:', error);
    }
  }
}

async function testPostRequest(): Promise<void> {
  try {
    const response = await axios.post(BASE_URL, {
      key1: 'value1',
      key2: 'value2',
    });
    console.log('POST Response:', response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('POST Request Error:', error.message);
    } else if (error instanceof Error) {
      console.error('POST Request Error:', error.message);
    } else {
      console.error('POST Request Error:', error);
    }
  }
}

async function runTests(): Promise<void> {
  console.log('Testing GET Request...');
  await testGetRequest();

  console.log('Testing POST Request...');
  await testPostRequest();
}

// Run the tests and handle the promise properly
runTests()
  .then(() => {
    console.log('✅ All tests completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Tests failed:', err);
    process.exit(1);
  });

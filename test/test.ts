import { AppDataSource } from '../src/data-source';

async function testDataSource(): Promise<void> {
  try {
    console.log('Initializing data source...');
    await AppDataSource.initialize();
    console.log('✅ Data Source has been initialized successfully!');

    // Test database connection
    const result: unknown = await AppDataSource.query(
      'SELECT NOW() as current_time',
    );
    const typedResult = result as Array<{ current_time: Date }>;
    console.log(
      '✅ Database connection test successful:',
      typedResult[0]?.current_time,
    );
  } catch (err) {
    console.error('❌ Error during Data Source initialization:', err);
    throw err;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Data Source connection closed');
    }
  }
}

// Run the test
testDataSource()
  .then(() => {
    console.log('🎉 All tests completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Test execution failed:', err);
    process.exit(1);
  });

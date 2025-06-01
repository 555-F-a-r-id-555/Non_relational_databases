// npm init -y
// npm install mongodb


const { MongoClient } = require('mongodb');

async function runTransaction() {
  const uri = 'mongodb://localhost:27017'; // адрес MongoDB
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const session = client.startSession();

    // Получаем коллекции
    const usersCollection = client.db('testdb').collection('users');
    const logsCollection = client.db('testdb').collection('logs');

    const transactionResult = await session.withTransaction(async () => {
      // Операция 1: создаём пользователя
      await usersCollection.insertOne(
        { username: 'alice', balance: 100 },
        { session }
      );

      // Операция 2: записываем лог
      await logsCollection.insertOne(
        { message: 'User alice created', timestamp: new Date() },
        { session }
      );
    }, {
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary'
    });

    if (transactionResult) {
      console.log('Транзакция успешно выполнена');
    } else {
      console.log('Транзакция откатилась');
    }

  } catch (err) {
    console.error('Ошибка транзакции:', err);
  } finally {
    await client.close();
  }
}

runTransaction();

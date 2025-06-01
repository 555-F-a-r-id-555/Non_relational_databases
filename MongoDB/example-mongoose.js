const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/testdb');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const User = mongoose.model('User', new mongoose.Schema({ name: String }));
    const Log = mongoose.model('Log', new mongoose.Schema({ message: String }));

    await User.create([{ name: 'Bob' }], { session });
    await Log.create([{ message: 'User Bob created' }], { session });

    await session.commitTransaction();
    console.log('Mongoose: транзакция выполнена');
  } catch (err) {
    await session.abortTransaction();
    console.error('Mongoose: транзакция откатилась:', err);
  } finally {
    session.endSession();
    mongoose.disconnect();
  }
}

main();

const mongoose = require('mongoose');
const { USER, PASSWORD, HOST, NAME } = require('@config').db;

const DRIVER = 'mongodb+srv';
const DB = `${HOST}/${NAME}`;

let isFirstConnected = false;

mongoose.Promise = global.Promise;

function connectDB() {
  mongoose.connect(`${DRIVER}://${USER}:${PASSWORD}@${DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

mongoose.connection.on('connected', () => {
  console.log(`Mongoose default connection open ${DRIVER}://${DB}`);
  isFirstConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose default connection error: ' + err);
  if (!isFirstConnected) {
    setTimeout(connectDB, 1000);
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

require('./models/work');

connectDB();

// import dotenv from 'dotenv';
import 'dotenv/config';
import connectDB from './db';
import app from './app';

// dotenv.config();

const port = process.env.PORT || 8000;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('Mongo db connection failed !!', err);
  });

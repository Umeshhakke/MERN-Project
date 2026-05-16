const express =require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/' , (req,res)=>{
    res.send('meme api is running');
});

app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/memes' , require('./routes/memeRoutes'));

// Global error handler – temporarily for debugging
app.use((err, req, res, next) => {
  console.error('🚨 Global error caught:');
  console.error(err.stack || err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is Running on port ${PORT}`);
});
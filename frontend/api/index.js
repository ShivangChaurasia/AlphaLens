const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

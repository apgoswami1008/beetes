const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./models');
const { errorHandler } = require('./middlewares/error.middleware');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes will be added here
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require("./routes/category.routes");
const subCategoryRoutes = require("./routes/subcategory.routes");

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sub-categories', subCategoryRoutes);
app.use(errorHandler);
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

module.exports = app;
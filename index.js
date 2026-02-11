import express from 'express';
import levelRoutes from './api/levels/level_detail.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Sử dụng route từ file [id].js
app.use('/api/levels', levelRoutes);

// Route kiểm tra server
app.get('/ping', (req, res) => res.send('Server is alive!'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const pool = require('../config/db');

// Lấy toàn bộ dataset (dùng cho SignPredictor load về chạy KNN)
const getAllSamples = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT label, features FROM training_samples');
    const parsed = rows.map(r => ({
      label: r.label,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thêm nhiều mẫu cùng lúc (dùng khi upload cả dataset từ SignCanvas)
const bulkInsertSamples = async (req, res) => {
  const samples = req.body; // mảng [{label, features}, ...]

  if (!Array.isArray(samples) || samples.length === 0) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
  }

  try {
    const values = samples.map(s => [s.label, JSON.stringify(s.features)]);
    await pool.query(
      'INSERT INTO training_samples (label, features) VALUES ?',
      [values]
    );
    res.status(201).json({ message: `Đã lưu ${samples.length} mẫu lên server` });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa toàn bộ dataset (dùng khi muốn ghi đè lại từ đầu)
const clearAllSamples = async (req, res) => {
  try {
    await pool.query('DELETE FROM training_samples');
    res.json({ message: 'Đã xóa toàn bộ dataset trên server' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAllSamples, bulkInsertSamples, clearAllSamples };
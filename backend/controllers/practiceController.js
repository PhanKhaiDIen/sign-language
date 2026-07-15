const pool = require('../config/db');

const createPracticeResult = async (req, res) => {
  const userId = req.user.userId;
  const { targetLabel, predictedLabel, isCorrect, distance } = req.body;

  if (!targetLabel || !predictedLabel || typeof isCorrect !== 'boolean') {
    return res.status(400).json({ message: 'Dữ liệu luyện tập không hợp lệ' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO practice_results
        (user_id, target_label, predicted_label, is_correct, distance)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, targetLabel, predictedLabel, isCorrect ? 1 : 0, distance ?? null]
    );

    res.status(201).json({
      message: 'Đã lưu kết quả luyện tập',
      resultId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getPracticeStats = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [[summary]] = await pool.query(
      `SELECT
        COUNT(*) AS attempts,
        COALESCE(SUM(is_correct), 0) AS correct,
        ROUND(COALESCE(AVG(is_correct), 0) * 100) AS accuracy,
        ROUND(AVG(distance), 4) AS avgDistance
       FROM practice_results
       WHERE user_id = ?`,
      [userId]
    );

    const [byLabel] = await pool.query(
      `SELECT
        target_label AS targetLabel,
        COUNT(*) AS attempts,
        COALESCE(SUM(is_correct), 0) AS correct,
        ROUND(COALESCE(AVG(is_correct), 0) * 100) AS accuracy
       FROM practice_results
       WHERE user_id = ?
       GROUP BY target_label
       ORDER BY accuracy ASC, attempts DESC, target_label ASC`,
      [userId]
    );

    const [recent] = await pool.query(
      `SELECT
        target_label AS targetLabel,
        predicted_label AS predictedLabel,
        is_correct AS isCorrect,
        distance,
        created_at AS createdAt
       FROM practice_results
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 12`,
      [userId]
    );

    res.json({
      summary: {
        attempts: Number(summary.attempts),
        correct: Number(summary.correct),
        accuracy: Number(summary.accuracy),
        avgDistance: summary.avgDistance,
      },
      byLabel,
      recent: recent.map(item => ({
        ...item,
        isCorrect: Boolean(item.isCorrect),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { createPracticeResult, getPracticeStats };

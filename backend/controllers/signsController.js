const pool = require('../config/db');

const getAllSigns = async (req, res) => {
    try {
    const [signs] = await pool.query('SELECT * FROM signs ORDER BY label ASC');
    res.json(signs);
    } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

const getSignById = async (req, res) => {
    const { id } = req.params;
    try {
    const [signs] = await pool.query('SELECT * FROM signs WHERE id = ?', [id]);
    if (signs.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy ký hiệu' });
    }
    res.json(signs[0]);
    } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

const createSign = async (req, res) => {
    const { label, category, description } = req.body;

    if (!label || !category) {
    return res.status(400).json({ message: 'Vui lòng nhập label và category' });
    }

    try {
    const [result] = await pool.query(
        'INSERT INTO signs (label, category, description) VALUES (?, ?, ?)',
        [label, category, description || null]
    );
    res.status(201).json({ message: 'Thêm ký hiệu thành công', signId: result.insertId });
    } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ký hiệu này đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

const updateSign = async (req, res) => {
    const { id } = req.params;
    const { label, category, description } = req.body;

    try {
    const [result] = await pool.query(
        'UPDATE signs SET label = ?, category = ?, description = ? WHERE id = ?',
        [label, category, description, id]
    );
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy ký hiệu' });
    }
    res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

const deleteSign = async (req, res) => {
    const { id } = req.params;
    try {
    const [result] = await pool.query('DELETE FROM signs WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy ký hiệu' });
    }
    res.json({ message: 'Xóa thành công' });
    } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

module.exports = { getAllSigns, getSignById, createSign, updateSign, deleteSign };
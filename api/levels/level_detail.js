import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Khởi tạo Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Route lấy bản cập nhật mới nhất
// Bạn có thể gọi: https://.../api/levels/latest
router.get('/latest', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('game_update') // Tên bảng mới bạn vừa tạo
      .select('version, pck_url, created_at')
      .order('created_at', { ascending: false }) // Sắp xếp cái mới nhất lên đầu
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Chưa có bản cập nhật nào!' });
    }

    return res.json({
      success: true,
      version: data.version,
      url: data.pck_url,
      date: data.created_at
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
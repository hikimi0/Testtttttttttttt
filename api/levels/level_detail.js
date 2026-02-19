import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Khởi tạo Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ✅ THÊM: Health check riêng cho route này (optional)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'levels API OK' });
});

// Route lấy bản cập nhật mới nhất
router.get('/latest', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('game_update')
      .select('version, pck_url, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: error 
          ? 'Lỗi truy vấn dữ liệu cập nhật.' 
          : 'Không tìm thấy bản cập nhật mới nào.' 
      });
    }

    return res.json({
      success: true,
      version: data.version,
      url: data.pck_url,
      date: data.created_at
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Khởi tạo Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Route xử lý lấy level theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params; // Lấy ID từ URL

  try {
    const { data, error } = await supabase
      .from('levels') // Tên bảng trên Supabase của bạn
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Level không tồn tại!' });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
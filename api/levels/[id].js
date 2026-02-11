import { createClient } from '@supabase/supabase-js'

// Khởi tạo Supabase (Sử dụng biến môi trường để bảo mật)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { id } = req.query // Lấy ID từ URL (ví dụ: /api/levels/1)

  try {
    // Truy vấn Supabase: Lấy level có id tương ứng
    // Giả sử bảng của bạn tên là 'levels'
    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Không tìm thấy level này!' })
    }

    // Trả về dữ liệu cho Game
    return res.status(200).json(data)
    
  } catch (err) {
    return res.status(500).json({ error: 'Lỗi server: ' + err.message })
  }
}
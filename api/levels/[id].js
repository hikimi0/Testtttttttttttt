export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const levelId = parseInt(id);

  // Dữ liệu các special level
  const specialLevels = {
    51: {
      name: "Special Level 1",
      url: "https://github.com/hikimi0/Testtttttttttttt/releases/download/v1.0.0/special1.pck",
      fileSize: 5242880,
      checksum: "abc123def456"
    }
    ,
    // 52: {
    //   name: "Special Level 2",
    //   url: "https://github.com/hikimi0/Testtttttttttttt/releases/download/v1.0.0/special2.pck",
    //   fileSize: 1856,
    //   checksum: "def456ghi789"
    // }
  };

  // Kiểm tra level có tồn tại không
  if (!specialLevels[levelId]) {
    return res.status(404).json({
      error: "Level not found",
      levelId: levelId
    });
  }

  const levelData = specialLevels[levelId];
  const clientVersion = req.query.version || "0";

  res.status(200).json({
    levelId: levelId,
    name: levelData.name,
    difficulty: levelData.difficulty,
    hasUpdate: true,
    downloadUrl: levelData.url,
    fileSize: levelData.fileSize,
    checksum: levelData.checksum,
    version: "1.0"
  });
}
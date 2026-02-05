export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Dữ liệu level từ GitHub Releases
  const availableLevels = {
    51: {
      name: "Level 51: Tricky Pipe",
      difficulty: "hard",
      url: "https://github.com/hikimi0/Testtttttttttttt/releases/download/v1.0.0/level_51.pck",
      fileSize: 5242880,
      checksum: "abc123def456"
    }
  };

  const lastLevelId = parseInt(req.query.lastLevelId) || 0;

  const newLevels = {};
  for (const [levelId, data] of Object.entries(availableLevels)) {
    if (parseInt(levelId) > lastLevelId) {
      newLevels[levelId] = data;
    }
  }

  res.status(200).json({
    hasNewLevels: Object.keys(newLevels).length > 0,
    lastServerLevel: Math.max(...Object.keys(availableLevels).map(Number)),
    newLevels: newLevels,
    totalLevelsOnServer: Object.keys(availableLevels).length
  });
}
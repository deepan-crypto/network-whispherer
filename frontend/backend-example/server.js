// Example Backend Server for NetWhisper
// This is a reference implementation - customize as needed

const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Store packets in memory (use database in production)
const packetLogs = [];

// POST /api/analyze - Receive packet data from mobile app
app.post('/api/analyze', (req, res) => {
  try {
    const { packets, timestamp } = req.body;

    if (!packets || !Array.isArray(packets)) {
      return res.status(400).json({ error: 'Invalid packet data' });
    }

    console.log(`\n📦 Received ${packets.length} packets at ${new Date(timestamp).toISOString()}`);

    // Process each packet
    packets.forEach((packet, index) => {
      console.log(`  ${index + 1}. ${packet.sourceIp} → ${packet.destIp} (${packet.size} bytes)`);
    });

    // Store packets
    packetLogs.push({
      id: Date.now(),
      packets,
      timestamp,
      receivedAt: new Date().toISOString(),
    });

    // Simple analysis
    const totalBytes = packets.reduce((sum, p) => sum + p.size, 0);
    const uniqueDestinations = new Set(packets.map(p => p.destIp)).size;

    const analysis = {
      success: true,
      summary: {
        totalPackets: packets.length,
        totalBytes,
        uniqueDestinations,
        receivedAt: new Date().toISOString(),
      },
    };

    console.log(`\n✅ Analysis complete: ${totalBytes} bytes, ${uniqueDestinations} unique destinations\n`);

    res.json(analysis);
  } catch (error) {
    console.error('❌ Error processing packets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/logs - Retrieve stored packet logs
app.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const recentLogs = packetLogs.slice(-limit);

  res.json({
    total: packetLogs.length,
    logs: recentLogs,
  });
});

// GET /api/stats - Get aggregated statistics
app.get('/api/stats', (req, res) => {
  const allPackets = packetLogs.flatMap(log => log.packets);

  const stats = {
    totalLogs: packetLogs.length,
    totalPackets: allPackets.length,
    totalBytes: allPackets.reduce((sum, p) => sum + p.size, 0),
    uniqueIPs: new Set(allPackets.map(p => p.destIp)).size,
    topDestinations: getTopDestinations(allPackets, 10),
  };

  res.json(stats);
});

// Helper function to get top destinations
function getTopDestinations(packets, limit) {
  const ipCounts = {};

  packets.forEach(packet => {
    ipCounts[packet.destIp] = (ipCounts[packet.destIp] || 0) + 1;
  });

  return Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ip, count]) => ({ ip, count }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   NetWhisper Backend Server                   ║
║   Listening on http://localhost:${PORT}        ║
║                                               ║
║   Endpoints:                                  ║
║   POST /api/analyze  - Receive packets        ║
║   GET  /api/logs     - View packet logs       ║
║   GET  /api/stats    - Get statistics         ║
║   GET  /health       - Health check           ║
╚═══════════════════════════════════════════════╝
  `);
});

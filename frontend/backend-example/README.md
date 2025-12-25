# NetWhisper Backend Example

A simple Express.js server to receive and analyze packet data from the NetWhisper mobile app.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. Server will start on `http://localhost:8080`

## API Endpoints

### POST /api/analyze
Receive packet data from mobile app.

**Request Body:**
```json
{
  "packets": [
    {
      "sourceIp": "192.168.1.100",
      "destIp": "142.250.185.206",
      "size": 1024,
      "timestamp": 1704067200000
    }
  ],
  "timestamp": 1704067200000
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalPackets": 1,
    "totalBytes": 1024,
    "uniqueDestinations": 1,
    "receivedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/logs?limit=10
Retrieve stored packet logs.

**Response:**
```json
{
  "total": 5,
  "logs": [...]
}
```

### GET /api/stats
Get aggregated statistics.

**Response:**
```json
{
  "totalLogs": 10,
  "totalPackets": 150,
  "totalBytes": 153600,
  "uniqueIPs": 25,
  "topDestinations": [
    { "ip": "142.250.185.206", "count": 30 }
  ]
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "uptime": 3600
}
```

## Testing

You can test the API using curl:

```bash
curl -X POST http://localhost:8080/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "packets": [
      {
        "sourceIp": "192.168.1.100",
        "destIp": "8.8.8.8",
        "size": 512,
        "timestamp": 1704067200000
      }
    ],
    "timestamp": 1704067200000
  }'
```

## Production Considerations

This is a basic example. For production:

1. **Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Authentication**: Add API keys or JWT authentication
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **HTTPS**: Use SSL/TLS certificates
5. **Logging**: Add proper logging (Winston, Pino)
6. **Monitoring**: Add APM (New Relic, Datadog)
7. **Error Handling**: Improve error handling and validation
8. **Scalability**: Consider using Redis for caching
9. **Data Retention**: Implement data retention policies
10. **Privacy**: Ensure GDPR/CCPA compliance

## License

MIT

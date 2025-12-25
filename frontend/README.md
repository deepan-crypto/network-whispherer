# NetWhisper - Network Monitoring App

A professional network traffic monitoring application for Android built with React Native and Expo.

## 🚨 Critical Information

**This app requires custom native Android code (VpnService) which is NOT supported in Expo's managed workflow.**

The React Native UI is fully functional and ready to use, but you must export to bare workflow to add the native module.

## 📱 Features

- Real-time network packet monitoring
- Clean, professional UI
- Packet capture with IP address tracking
- Data size monitoring
- Backend API integration
- Batch sync to external server

## 🏗️ Architecture

### Frontend (React Native + TypeScript)
- Tab-based navigation with Monitor and Setup screens
- Real-time packet display with DeviceEventEmitter
- Professional UI with stats dashboard
- API client for backend integration

### Native Layer (Java/Android)
- Custom VpnService implementation
- IP header parser (Source IP, Dest IP, Size only)
- React Native bridge module
- Event emitter to JavaScript layer

## 🚀 Quick Start

### Option 1: View UI Only (Current Setup)
The app is currently viewable in Expo with a setup guide screen:

```bash
npm install
npm run dev
```

The Monitor tab will show the UI but native features won't work until you add native code.

### Option 2: Full Implementation (Requires Native Code)

1. **Export to Bare Workflow**
   ```bash
   npx expo prebuild
   ```

2. **Add Native Modules**
   Follow the complete guide in `NATIVE_SETUP.md`:
   - Create TrafficMonitorModule.java
   - Create TrafficVpnService.java
   - Create TrafficMonitorPackage.java
   - Update AndroidManifest.xml
   - Register package in MainApplication.java

3. **Build and Run**
   ```bash
   npx react-native run-android
   ```

## 📂 Project Structure

```
.
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation
│   │   ├── index.tsx             # Monitor screen
│   │   └── logs.tsx              # Setup guide screen
│   └── _layout.tsx               # Root layout
├── services/
│   ├── trafficMonitor.ts         # Native module wrapper
│   └── api.ts                    # Backend API client
├── types/
│   └── traffic.ts                # TypeScript interfaces
├── NATIVE_SETUP.md               # Complete native setup guide
└── README.md                     # This file
```

## 🔧 Technology Stack

- **React Native** - Cross-platform mobile framework
- **Expo Router** - File-based navigation
- **TypeScript** - Type-safe development
- **Lucide Icons** - Modern icon library
- **Android VpnService** - Native packet interception

## 🌐 Backend Integration

The app sends captured packets to:
```
POST http://10.0.2.2:8080/api/analyze
```

**Note:** `10.0.2.2` is Android emulator's localhost alias.

### Expected Payload
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

## 📱 Screenshots & UI

### Monitor Screen
- Start/Stop monitoring button
- Real-time packet list
- Statistics dashboard (packet count, status)
- Sync button to send data to backend

### Setup Screen
- Step-by-step native setup instructions
- Visual guide with numbered steps
- Important notices and warnings

## 🔐 Permissions Required

Add to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.BIND_VPN_SERVICE" />
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Android Studio
- Android SDK
- Physical Android device or emulator

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Type Check
```bash
npm run typecheck
```

### Build Web Version
```bash
npm run build:web
```

## 📊 How It Works

1. User taps "Start Monitoring"
2. Native module requests VPN permission from Android
3. VpnService intercepts ALL network traffic
4. Parser extracts only IP headers (Source, Destination, Size)
5. Events emitted to React Native via DeviceEventEmitter
6. UI displays packets in real-time
7. User taps "Sync" to send batch to backend API

## ⚠️ Important Notes

### Performance
- Only IP headers are parsed (not packet body) to avoid lag
- Packet list limited to 100 most recent items
- Batch API calls instead of sending each packet individually

### Privacy & Security
- No packet content is captured (headers only)
- User must explicitly grant VPN permission
- Clear disclosure of data collection required
- HTTPS recommended for production API

### Legal Considerations
- Clearly state what data you collect
- Obtain user consent
- Comply with GDPR, CCPA, and local laws
- Do not collect sensitive information without authorization
- Consult legal counsel before production deployment

## 🐛 Troubleshooting

### "TrafficMonitor native module not available"
- You haven't added native code yet
- Follow `NATIVE_SETUP.md` to add native modules
- Rebuild after adding native code

### VPN Permission Denied
- User must manually grant VPN permission
- Android shows system dialog on first run
- Check AndroidManifest.xml has correct permissions

### No Packets Captured
- Ensure VPN is active (VPN icon in status bar)
- Try opening browser or making network requests
- Check Android logs: `adb logcat | grep NetWhisper`

### Backend Connection Failed
- Ensure backend server is running on port 8080
- Use `10.0.2.2` for emulator (not `localhost`)
- Check network connectivity
- Verify API endpoint is correct

## 📦 Dependencies

Core:
- react-native: 0.81.4
- react: 19.1.0
- expo: ^54.0.10
- expo-router: ~6.0.8

UI:
- lucide-react-native: ^0.544.0
- react-native-svg: 15.12.1

Utilities:
- @supabase/supabase-js: ^2.58.0
- typescript: ~5.9.2

## 🚀 Production Deployment

Before deploying to production:

1. Replace `10.0.2.2:8080` with production API URL
2. Implement API authentication
3. Use HTTPS for all API calls
4. Add rate limiting on backend
5. Implement proper error tracking
6. Add analytics
7. Create privacy policy
8. Submit to Google Play Store

## 📄 License

This is a development template. Add appropriate license before distribution.

## 🤝 Contributing

This is a starter template. Customize as needed for your use case.

## 📞 Support

For native module setup issues, refer to:
- `NATIVE_SETUP.md` - Complete implementation guide
- React Native documentation
- Android VpnService documentation

---

**Built with React Native, Expo, and TypeScript**

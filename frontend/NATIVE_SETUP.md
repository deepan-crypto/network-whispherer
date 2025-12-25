# NetWhisper - Native Module Setup Guide

## ⚠️ Important Notice

This app requires **custom native Android code** to access `VpnService`. Expo's managed workflow **does not support** custom native modules. You must export to bare workflow or use React Native CLI.

---

## Setup Steps

### Step 1: Export to Bare Workflow

```bash
npx expo prebuild
```

This will generate the `android/` and `ios/` directories with native code.

---

### Step 2: Create Native Module Files

#### 2.1 Create `TrafficMonitorModule.java`

**Path:** `android/app/src/main/java/com/[yourappname]/TrafficMonitorModule.java`

```java
package com.yourapp;

import android.content.Intent;
import android.net.VpnService;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class TrafficMonitorModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    TrafficMonitorModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "TrafficMonitor";
    }

    @ReactMethod
    public void startVpn() {
        Intent intent = VpnService.prepare(getCurrentActivity());
        if (intent != null) {
            getCurrentActivity().startActivityForResult(intent, 0);
        } else {
            startVpnService();
        }
    }

    @ReactMethod
    public void stopVpn() {
        Intent intent = new Intent(getReactApplicationContext(), TrafficVpnService.class);
        getReactApplicationContext().stopService(intent);
    }

    private void startVpnService() {
        Intent intent = new Intent(getReactApplicationContext(), TrafficVpnService.class);
        getReactApplicationContext().startService(intent);
    }

    public static void sendPacketEvent(String sourceIp, String destIp, int size) {
        WritableMap params = Arguments.createMap();
        params.putString("sourceIp", sourceIp);
        params.putString("destIp", destIp);
        params.putInt("size", size);
        params.putDouble("timestamp", System.currentTimeMillis());

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("PacketCaptured", params);
    }
}
```

#### 2.2 Create `TrafficVpnService.java`

**Path:** `android/app/src/main/java/com/[yourappname]/TrafficVpnService.java`

```java
package com.yourapp;

import android.content.Intent;
import android.net.VpnService;
import android.os.ParcelFileDescriptor;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.ByteBuffer;

public class TrafficVpnService extends VpnService {
    private Thread vpnThread;
    private ParcelFileDescriptor vpnInterface;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        vpnThread = new Thread(this::runVpn);
        vpnThread.start();
        return START_STICKY;
    }

    private void runVpn() {
        try {
            vpnInterface = new Builder()
                .addAddress("10.0.0.2", 32)
                .addRoute("0.0.0.0", 0)
                .setSession("NetWhisper")
                .establish();

            FileInputStream in = new FileInputStream(vpnInterface.getFileDescriptor());
            ByteBuffer packet = ByteBuffer.allocate(32767);

            while (true) {
                int length = in.read(packet.array());
                if (length > 0) {
                    packet.limit(length);
                    parsePacket(packet);
                    packet.clear();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void parsePacket(ByteBuffer packet) {
        try {
            if (packet.remaining() < 20) return;

            int version = (packet.get(0) >> 4) & 0xF;
            if (version != 4) return;

            String sourceIp = String.format("%d.%d.%d.%d",
                packet.get(12) & 0xFF,
                packet.get(13) & 0xFF,
                packet.get(14) & 0xFF,
                packet.get(15) & 0xFF
            );

            String destIp = String.format("%d.%d.%d.%d",
                packet.get(16) & 0xFF,
                packet.get(17) & 0xFF,
                packet.get(18) & 0xFF,
                packet.get(19) & 0xFF
            );

            int packetSize = packet.remaining();

            TrafficMonitorModule.sendPacketEvent(sourceIp, destIp, packetSize);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (vpnThread != null) {
            vpnThread.interrupt();
        }
        if (vpnInterface != null) {
            try {
                vpnInterface.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

#### 2.3 Create `TrafficMonitorPackage.java`

**Path:** `android/app/src/main/java/com/[yourappname]/TrafficMonitorPackage.java`

```java
package com.yourapp;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class TrafficMonitorPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new TrafficMonitorModule(reactContext));
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
```

---

### Step 3: Update AndroidManifest.xml

**Path:** `android/app/src/main/AndroidManifest.xml`

Add these permissions before the `<application>` tag:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.BIND_VPN_SERVICE" />
```

Inside the `<application>` tag, add the VPN service:

```xml
<service
    android:name=".TrafficVpnService"
    android:permission="android.permission.BIND_VPN_SERVICE">
    <intent-filter>
        <action android:name="android.net.VpnService" />
    </intent-filter>
</service>
```

---

### Step 4: Register the Package

**Path:** `android/app/src/main/java/com/[yourappname]/MainApplication.java`

Add the import:

```java
import com.yourapp.TrafficMonitorPackage;
```

In the `getPackages()` method, add:

```java
@Override
protected List<ReactPackage> getPackages() {
    List<ReactPackage> packages = new PackageList(this).getPackages();
    packages.add(new TrafficMonitorPackage());
    return packages;
}
```

---

### Step 5: Build and Run

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## Backend API

The app sends captured packets to: `http://10.0.2.2:8080/api/analyze`

**Note:** `10.0.2.2` is the Android emulator's alias for `localhost` on your development machine.

### Expected API Endpoint

```javascript
// POST /api/analyze
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

---

## Architecture Overview

### Native Layer (Java)
- **TrafficMonitorModule**: React Native bridge
- **TrafficVpnService**: VpnService implementation that intercepts packets
- **Packet Parser**: Extracts IP headers only (Source IP, Dest IP, Size)

### React Native Layer (TypeScript)
- **trafficMonitor.ts**: Service wrapper for native module
- **api.ts**: Backend API client
- **MonitorScreen**: Main UI with start/stop controls
- **LogsScreen**: Setup instructions

### Data Flow
1. User taps "Start Monitoring"
2. Native module requests VPN permission
3. VpnService intercepts network packets
4. Parser extracts IP headers
5. Events sent to React Native via DeviceEventEmitter
6. UI displays packets in real-time
7. "Sync" button sends batch to backend API

---

## Troubleshooting

### Native Module Not Found
- Ensure you've run `npx expo prebuild`
- Check that package is registered in MainApplication.java
- Rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`

### VPN Permission Denied
- User must explicitly grant VPN permission
- Check AndroidManifest.xml has `BIND_VPN_SERVICE`

### No Packets Captured
- VPN must be active (user sees VPN icon in status bar)
- Try opening a browser or making network requests
- Check logcat: `adb logcat | grep NetWhisper`

---

## Security Considerations

1. **Header-Only Parsing**: Only IP headers are extracted, not packet body content
2. **Local Processing**: No sensitive data is stored on device
3. **User Consent**: VPN permission dialog informs users
4. **API Security**: Use HTTPS in production (not HTTP)

---

## Production Considerations

1. Change API URL from `10.0.2.2:8080` to production URL
2. Implement authentication for API endpoint
3. Add rate limiting on backend
4. Consider batching packets before sending
5. Add user settings for monitoring intervals
6. Implement data retention policies

---

## License & Legal

Network monitoring apps must:
- Clearly state data collection practices
- Obtain user consent
- Comply with local laws (GDPR, CCPA, etc.)
- Not collect sensitive information without authorization

This is a development template. Consult legal counsel before deploying.

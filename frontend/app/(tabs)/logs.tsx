import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AlertCircle, Info } from 'lucide-react-native';

export default function LogsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Setup Required</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <AlertCircle size={24} color="#f59e0b" />
          <Text style={styles.infoTitle}>Native Module Not Available</Text>
          <Text style={styles.infoText}>
            NetWhisper requires custom native Android code to access VpnService.
            This cannot run in Expo's managed workflow.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To Enable Full Functionality:</Text>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Export Your Project</Text>
              <Text style={styles.stepText}>
                Run: npx expo prebuild
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Add Native Modules</Text>
              <Text style={styles.stepText}>
                Add TrafficMonitorModule.java, TrafficVpnService.java, and TrafficMonitorPackage.java to android/app/src/main/java/
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Update AndroidManifest.xml</Text>
              <Text style={styles.stepText}>
                Add BIND_VPN_SERVICE permission and register the VPN service
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Register Package</Text>
              <Text style={styles.stepText}>
                Add TrafficMonitorPackage to MainApplication.java
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Info size={20} color="#2563eb" />
          <Text style={styles.noteText}>
            All native code templates and instructions have been provided. Check your development console for the complete implementation guide.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 24,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#78350f',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
});

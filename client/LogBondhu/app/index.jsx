import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const Index = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LogBondhu</Text>
              <View style={styles.logoAccent} />
            </View>
            <Text style={styles.heroTitle}>Welcome to LogBondhu</Text>

            <Text style={styles.heroSubtitle}>
              Social App made in MERN stack by NihaR_RD
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.navigate("/LogIn")}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.navigate("/SignUp")}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "space-between",
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  logoAccent: {
    width: 60,
    height: 4,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#475569",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
});

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

const SignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName: "",
    emailId: "",
    phoneNo: "",
    password: "",
    gender: "",
    dob: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const API_BASE_URL = "http://10.0.2.2:8080";

  const handleSubmit = async () => {
    // Basic validation
    if (
      !formData.userName ||
      !formData.emailId ||
      !formData.phoneNo ||
      !formData.password ||
      !formData.gender ||
      !formData.dob
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Here you would typically make an API call to register the user
    console.log("Form Data:", formData);
    const response = await axios.post(
      "http://10.0.2.2:8080/api/auth/register",
      {
        userName: formData.userName,
        emailId: formData.emailId,
        phoneNo: formData.phoneNo,
        password: formData.password,
        gender: formData.gender,
        dob: formData.dob,
      }
    );
    if (response.status === 201) {
      Alert.alert("Success", "Account created successfully!");
      router.navigate("/LogIn");
    } else {
      Alert.alert("Error", response.data.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155"]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              Join LogBondhu and start connecting
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#64748b"
                value={formData.userName}
                onChangeText={(value) => handleInputChange("userName", value)}
                autoCapitalize="none"
              />
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#64748b"
                value={formData.emailId}
                onChangeText={(value) => handleInputChange("emailId", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Number Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#64748b"
                value={formData.phoneNo}
                onChangeText={(value) => handleInputChange("phoneNo", value)}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#64748b"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                secureTextEntry
              />
            </View>

            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    formData.gender === "male" && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleInputChange("gender", "male")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      formData.gender === "male" && styles.genderTextSelected,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    formData.gender === "female" && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleInputChange("gender", "female")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      formData.gender === "female" && styles.genderTextSelected,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date of Birth Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#64748b"
                value={formData.dob}
                onChangeText={(value) => handleInputChange("dob", value)}
                keyboardType="numeric"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.navigate("/LogIn")}>
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#94a3b8",
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#ffffff",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderOption: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  genderOptionSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  genderText: {
    fontSize: 16,
    color: "#94a3b8",
    fontWeight: "500",
  },
  genderTextSelected: {
    color: "#ffffff",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  loginLinkText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
});

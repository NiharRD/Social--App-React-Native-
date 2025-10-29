import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

const Upload = () => {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setCaption("");
              setSelectedImage(null);
            }}
          >
            <Text style={styles.backButtonText}>Clear</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AddPost</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Caption Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Type Caption here...."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={caption}
              onChangeText={setCaption}
            />
          </View>

          {/* Open Camera Button */}
          <TouchableOpacity style={styles.optionButton}>
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Feather name="camera" size={24} color="#64748b" />
              </View>
              <Text style={styles.optionText}>Open Camera</Text>
            </View>
          </TouchableOpacity>

          {/* Open Gallery Button */}
          <TouchableOpacity style={styles.optionButton}>
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Feather name="image" size={24} color="#64748b" />
              </View>
              <Text style={styles.optionText}>Open Gallery</Text>
            </View>
          </TouchableOpacity>

          {/* Selected Image Preview Placeholder */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.previewText}>Image Preview</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Upload;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backButton: {
    paddingVertical: 4,
  },
  backButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  captionInput: {
    color: "#ffffff",
    fontSize: 16,
    padding: 16,
    minHeight: 120,
    maxHeight: 200,
  },
  optionButton: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  previewText: {
    color: "#64748b",
    fontSize: 14,
  },
});

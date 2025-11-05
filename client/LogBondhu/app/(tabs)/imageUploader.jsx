import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import Slider from "@react-native-community/slider";
import { File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import axios from "axios";
import { globalUrl } from "../../globalUrl";
const imageUploader = () => {
  const localUrl = "http://10.0.2.2:8080";
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState("instagram");
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [quality, setQuality] = useState(80);
  const [downloadUrls, setDownloadUrls] = useState([]);
  const [jsonData, setJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const presets = [
    { value: "instagram", label: "Instagram", dimensions: "1080x1080" },
    { value: "story", label: "Story", dimensions: "1080x1920" },
    { value: "twitter", label: "Twitter", dimensions: "1200x675" },
  ];

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages(result.assets);
    }
  };

  const clearAll = () => {
    setSelectedImages([]);
    setSelectedPreset("instagram");
    setQuality(80);
    setJsonData(null);
  };

  const uploadImages = async () => {
    setIsLoading(true);
    setLoadingMessage("Uploading and processing images...");

    try {
      // Create FormData
      const formData = new FormData();

      // Append preset and quality
      formData.append("preset", selectedPreset);
      formData.append("quality", quality);

      // Append each image
      selectedImages.forEach((image, index) => {
        // Extract filename from URI
        const filename = image.uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("images", {
          uri: image.uri,
          name: filename || `image-${index}.jpg`,
          type: type,
        });
      });

      // Send request
      const response = await axios.post(
        `${localUrl}/api/images/process`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Store the response data
        setJsonData(response.data);

        // Extract URLs for download
        const urls = response.data.images.map((img) => img.url);
        setDownloadUrls(urls);
        console.log("downloadUrls", urls);

        console.log("Upload successful:", response.data);
      }
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      alert("Upload failed: " + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const downloadAsZip = async () => {
    setIsLoading(true);
    setLoadingMessage("Creating ZIP file...");

    try {
      if (!downloadUrls || downloadUrls.length === 0) {
        alert("No images to download");
        setIsLoading(false);
        return;
      }

      console.log("Downloading ZIP file...");

      // Create a unique filename
      const filename = `processed-images-${Date.now()}.zip`;

      // Create file reference in document directory (permanent storage)
      const file = new File(Paths.document, filename);

      // Make POST request to server to get ZIP
      const response = await fetch(`${localUrl}/api/images/download-zip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: downloadUrls }),
      });

      if (!response.ok) {
        throw new Error("Failed to download ZIP file from server");
      }

      // Get response as base64 string (expo-file-system needs base64 or string)
      const reader = new FileReader();
      const blob = await response.blob();

      const base64String = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1]; // Remove data:application/zip;base64, prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Create the file and write base64 data
      await file.create();
      await file.write(base64String, { encoding: "base64" });

      console.log("ZIP file saved to:", file.uri);

      // Share/Save the file - this will allow saving to Downloads
      if (await Sharing.isAvailableAsync()) {
        const result = await Sharing.shareAsync(file.uri, {
          mimeType: "application/zip",
          dialogTitle: "Save ZIP to Downloads",
          UTI: "public.zip-archive",
        });

        console.log("File shared successfully", result);

        // On Android, suggest saving to Downloads
        if (Platform.OS === "android") {
          alert(
            "To save to Downloads: Select 'Save to Files' and choose Downloads folder"
          );
        } else {
          alert("ZIP file saved! Use 'Save to Files' to save to Downloads.");
        }
      } else {
        alert("ZIP file saved to: " + file.uri);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download ZIP: " + error.message);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const getPresetLabel = () => {
    return (
      presets.find((p) => p.value === selectedPreset)?.label || "Instagram"
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Image Uploader</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Select Multiple Images Button */}
          <TouchableOpacity style={styles.primaryButton} onPress={pickImages}>
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Feather name="image" size={24} color="#3b82f6" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>Select Multiple Images</Text>
                {selectedImages.length > 0 && (
                  <Text style={styles.buttonSubText}>
                    {selectedImages.length} image(s) selected
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <View style={styles.previewContainer}>
              <Text style={styles.sectionLabel}>Selected Images</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}
              >
                {selectedImages.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img.uri }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Preset Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Preset</Text>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setShowPresetMenu(!showPresetMenu)}
            >
              <View style={styles.presetContent}>
                <Feather name="grid" size={20} color="#3b82f6" />
                <Text style={styles.presetText}>{getPresetLabel()}</Text>
                <Text style={styles.presetDimensions}>
                  {presets.find((p) => p.value === selectedPreset)?.dimensions}
                </Text>
              </View>
              <Feather
                name={showPresetMenu ? "chevron-up" : "chevron-down"}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>

            {/* Preset Menu */}
            {showPresetMenu && (
              <View style={styles.presetMenu}>
                {presets.map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    style={[
                      styles.presetMenuItem,
                      selectedPreset === preset.value &&
                        styles.presetMenuItemActive,
                    ]}
                    onPress={() => {
                      setSelectedPreset(preset.value);
                      setShowPresetMenu(false);
                    }}
                  >
                    <View style={styles.presetMenuItemContent}>
                      <Text
                        style={[
                          styles.presetMenuItemText,
                          selectedPreset === preset.value &&
                            styles.presetMenuItemTextActive,
                        ]}
                      >
                        {preset.label}
                      </Text>
                      <Text style={styles.presetMenuItemDimensions}>
                        {preset.dimensions}
                      </Text>
                    </View>
                    {selectedPreset === preset.value && (
                      <Feather name="check" size={20} color="#3b82f6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quality Slider */}
          <View style={styles.section}>
            <View style={styles.qualityHeader}>
              <Text style={styles.sectionLabel}>Image Quality</Text>
              <Text style={styles.qualityValue}>{quality}%</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>60%</Text>
              <Slider
                style={styles.slider}
                minimumValue={60}
                maximumValue={100}
                step={5}
                value={quality}
                onValueChange={setQuality}
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor="#334155"
                thumbTintColor="#3b82f6"
              />
              <Text style={styles.sliderLabel}>100%</Text>
            </View>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[
              styles.uploadButton,
              selectedImages.length === 0 && styles.uploadButtonDisabled,
            ]}
            onPress={uploadImages}
            disabled={selectedImages.length === 0}
          >
            <Feather
              name="upload"
              size={20}
              color={selectedImages.length === 0 ? "#64748b" : "#ffffff"}
            />
            <Text
              style={[
                styles.uploadButtonText,
                selectedImages.length === 0 && styles.uploadButtonTextDisabled,
              ]}
            >
              Upload Images
            </Text>
          </TouchableOpacity>

          {/* Download as ZIP Button */}
          <TouchableOpacity
            style={[
              styles.downloadButton,
              !jsonData && styles.downloadButtonDisabled,
            ]}
            onPress={downloadAsZip}
            disabled={!jsonData}
          >
            <Feather
              name="download"
              size={20}
              color={!jsonData ? "#64748b" : "#ffffff"}
            />
            <Text
              style={[
                styles.downloadButtonText,
                !jsonData && styles.downloadButtonTextDisabled,
              ]}
            >
              Download as ZIP
            </Text>
          </TouchableOpacity>

          {/* Clear All Button */}
          <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
            <Feather name="x-circle" size={20} color="#ef4444" />
            <Text style={styles.clearButtonText}>Clear All State</Text>
          </TouchableOpacity>

          {/* JSON Data Display */}
          {jsonData && (
            <View style={styles.jsonContainer}>
              <Text style={styles.jsonLabel}>Response Data</Text>
              <ScrollView
                style={styles.jsonScrollView}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.jsonText}>
                  {JSON.stringify(jsonData, null, 2)}
                </Text>
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Loading Overlay */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default imageUploader;

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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSubText: {
    color: "#3b82f6",
    fontSize: 14,
    marginTop: 4,
  },
  previewContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  imageScrollView: {
    flexDirection: "row",
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#0f172a",
  },
  section: {
    marginBottom: 24,
  },
  presetButton: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#334155",
  },
  presetContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  presetText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  presetDimensions: {
    color: "#64748b",
    fontSize: 14,
    marginLeft: 8,
  },
  presetMenu: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  presetMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  presetMenuItemActive: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  presetMenuItemContent: {
    flex: 1,
  },
  presetMenuItemText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  presetMenuItemTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  presetMenuItemDimensions: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 2,
  },
  uploadButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  uploadButtonTextDisabled: {
    color: "#64748b",
  },
  downloadButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  downloadButtonDisabled: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  downloadButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  downloadButtonTextDisabled: {
    color: "#64748b",
  },
  clearButton: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 24,
  },
  clearButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  jsonContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    minHeight: 200,
  },
  jsonLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  jsonScrollView: {
    maxHeight: 400,
  },
  jsonText: {
    color: "#10b981",
    fontSize: 12,
    fontFamily: "monospace",
    lineHeight: 18,
  },
  qualityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  qualityValue: {
    color: "#3b82f6",
    fontSize: 18,
    fontWeight: "700",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  sliderLabel: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    minWidth: 200,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
});

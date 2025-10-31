import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useAuth } from "../../utils/authContext";
const Upload = () => {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const uploadPost = async () => {
    if (caption && selectedImage) {
      try {
        setLoading(true);
        // Create FormData
        const formData = new FormData();
        formData.append("caption", caption);

        // Extract filename from URI and create file object
        const filename = selectedImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("imageUrl", {
          uri: selectedImage,
          name: filename,
          type: type,
        });

        const response = await axios.post(
          "http://10.0.2.2:8080/api/posts/add",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setLoading(false);

        if (response.data.status) {
          Alert.alert("Success", "Post uploaded successfully!");
          setCaption("");
          setSelectedImage(null);
        } else {
          Alert.alert("Error", response.data.message);
        }
      } catch (error) {
        setLoading(false);
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to upload post"
        );
      }
    } else {
      Alert.alert("Error", "Please fill all the fields");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };
  const PickImageCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false, // set true to allow simple crop UI
      quality: 1, // 0..1 compression (iOS/Android)
      mediaTypes: ["images"], // or ImagePicker.MediaTypeOptions.Images
    });
    console.log(result); // file in results.uri
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
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
          <TouchableOpacity style={styles.postButton} onPress={uploadPost}>
            {loading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.optionButton}
            onPress={PickImageCamera}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Feather name="camera" size={24} color="#64748b" />
              </View>
              <Text style={styles.optionText}>Open Camera</Text>
            </View>
          </TouchableOpacity>

          {/* Open Gallery Button */}
          <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                <Feather name="image" size={24} color="#64748b" />
              </View>
              <Text style={styles.optionText}>Open Gallery</Text>
            </View>
          </TouchableOpacity>

          {/* Selected Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.previewLabel}>Selected Image</Text>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
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
  postButton: {
    paddingVertical: 4,
  },
  postButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
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
  },
  previewLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
});

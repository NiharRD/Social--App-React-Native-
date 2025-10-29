import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import axios from "axios";

const PostDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");

  const fetchPost = async () => {
    const response = await axios.get(
      `http://10.0.2.2:8080/api/posts/getPost/${id}`
    );
    setPost(response.data.data);
  };

  useEffect(() => {
    fetchPost();
  }, []);

  // Format time
  const formatTime = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInMs = now - postDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return postDate.toLocaleDateString();
  };

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const hasImage = post.imageUrl && post.imageUrl.trim() !== "";

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
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Feather name="more-vertical" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Post Card */}
          <View style={styles.postCard}>
            {/* User Info */}
            <View style={styles.userSection}>
              <View style={styles.avatar}>
                <Feather name="user" size={24} color="#64748b" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.postTime}>
                  {post.createdAt ? formatTime(post.createdAt) : "Recently"}
                </Text>
              </View>
            </View>

            {/* Caption */}
            {post.caption && <Text style={styles.caption}>{post.caption}</Text>}

            {/* Image */}
            {hasImage && (
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: `http://10.0.2.2:8080/${post.imageUrl.replace(
                      /\\/g,
                      "/"
                    )}`,
                  }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Feather name="heart" size={20} color="#64748b" />
                <Text style={styles.statText}>
                  {post.likes?.length || 0}{" "}
                  {post.likes?.length === 1 ? "like" : "likes"}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="message-circle" size={20} color="#64748b" />
                <Text style={styles.statText}>
                  {post.comments?.length || 0}{" "}
                  {post.comments?.length === 1 ? "comment" : "comments"}
                </Text>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>
              Comments ({post.comments?.length || 0})
            </Text>

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <View style={styles.commentAvatar}>
                <Feather name="user" size={16} color="#64748b" />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor="#64748b"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity style={styles.sendButton}>
                  <Feather name="send" size={20} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Comments List */}
            {post.comments && post.comments.length > 0 ? (
              <View style={styles.commentsList}>
                {post.comments.map((comment, index) => (
                  <View key={index} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Feather name="user" size={14} color="#64748b" />
                    </View>
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>
                          {comment.userName || "User"}
                        </Text>
                        <Text style={styles.commentTime}>2h ago</Text>
                      </View>
                      <Text style={styles.commentText}>
                        {comment.text || "Comment text"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noComments}>
                <Feather name="message-circle" size={48} color="#334155" />
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>
                  Be the first to comment!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  postTime: {
    fontSize: 13,
    color: "#64748b",
  },
  caption: {
    fontSize: 15,
    color: "#e2e8f0",
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#0f172a",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  commentsSection: {
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    gap: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  commentInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    padding: 4,
    marginLeft: 8,
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    flexDirection: "row",
    gap: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  commentTime: {
    fontSize: 12,
    color: "#64748b",
  },
  commentText: {
    fontSize: 14,
    color: "#e2e8f0",
    lineHeight: 20,
  },
  noComments: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 4,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: "#64748b",
  },
});

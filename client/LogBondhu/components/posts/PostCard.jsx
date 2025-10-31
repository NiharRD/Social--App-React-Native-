import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
const PostCard = ({ post }) => {
  const router = useRouter();
  // Format time function
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

  // Check if image exists
  const hasImage = post.imageUrl && post.imageUrl.trim() !== "";

  const handlePostPress = () => {
    router.push(`/${post._id}`);
  };

  return (
    <Pressable style={styles.card} onPress={handlePostPress}>
      {/* Post Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Feather name="user" size={20} color="#64748b" />
          </View>
          <View>
            <Text style={styles.userName}>{post.userName || "Unknown"}</Text>
            <Text style={styles.timeText}>
              {post.createdAt ? formatTime(post.createdAt) : "Recently"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-horizontal" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Post Caption */}
      {post.caption && (
        <Text style={styles.caption} numberOfLines={4}>
          {post.caption}
        </Text>
      )}

      {/* Post Image */}
      {hasImage && (
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: post.imageUrl, // Cloudinary URL is already complete
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Post Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Feather name="heart" size={18} color="#64748b" />
          <Text style={styles.statText}>
            {post.likes?.length || 0}{" "}
            {post.likes?.length === 1 ? "likes" : "likes"}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Feather name="message-circle" size={18} color="#64748b" />
          <Text style={styles.statText}>
            {post.comments?.length || 0}{" "}
            {post.comments?.length === 1 ? "comments" : "comments"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  timeText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  caption: {
    fontSize: 15,
    color: "#e2e8f0",
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    paddingVertical: 12,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
});

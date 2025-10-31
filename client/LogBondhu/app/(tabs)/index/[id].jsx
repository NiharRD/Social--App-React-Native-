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
import { useAuth } from "../../../utils/authContext";
const PostDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [postUser, setPostUser] = useState(null);

  const fetchPost = async () => {
    const response = await axios.get(
      `http://10.0.2.2:8080/api/posts/getPost/${id}`
    );
    setPost(response.data.data);
  };
  const fetchComments = async () => {
    const response = await axios.get(
      `http://10.0.2.2:8080/api/posts/comments/getByPost/${id}`
    );
    setComments(response.data.data);
  };

  const addComment = async () => {
    try {
      const response = await axios.post(
        `http://10.0.2.2:8080/api/posts/comments/add/${id}`,
        {
          comment: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.message === "Comment added successfully") {
        console.log("Comment added successfully");
        fetchComments();
        setCommentText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPostUser = async (userId) => {
    const response = await axios
      .get(`http://10.0.2.2:8080/api/users/getUser/${userId} `)
      .then((res) => {
        setPostUser(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  async function getFollowingStatus(userId) {
    await axios
      .get(`http://10.0.2.2:8080/api/users/isFollowing/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setIsFollowing(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const likePost = async () => {
    try {
      const response = await axios
        .put(
          `http://10.0.2.2:8080/api/posts/like/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          if (res.data.message === "Post liked successfully") {
            console.log("Post liked successfully");
          }
        });
    } catch (error) {
      console.log("Error liking post:", error);
    }
  };

  const followUser = async (userId) => {
    try {
      const response = await axios.put(
        `http://10.0.2.2:8080/api/users/follow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        // Toggle the following state
        setIsFollowing(!isFollowing);
        // Refresh user data to get updated follower count
        fetchPostUser(userId);
      }
    } catch (err) {
      console.log("Error following/unfollowing user:", err);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id, likePost]);

  useEffect(() => {
    if (post && post.userId) {
      fetchPostUser(post.userId);
    }
  }, [post, likePost]);

  useEffect(() => {
    if (postUser && postUser._id && token) {
      getFollowingStatus(postUser._id);
    }
  }, [postUser, token, likePost]);

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
          <TouchableOpacity style={styles.moreButton}></TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Follow/Unfollow Section */}
          {postUser && (
            <View style={styles.followSection}>
              <View style={styles.followUserInfo}>
                <View style={styles.followAvatar}>
                  <Feather name="user" size={32} color="#64748b" />
                </View>
                <View style={styles.followUserDetails}>
                  <Text style={styles.followUserName}>
                    {postUser.userName || "User"}
                  </Text>
                  <View style={styles.followStats}>
                    <View style={styles.followStatItem}>
                      <Text style={styles.followStatNumber}>
                        {postUser.followers?.length || 0}
                      </Text>
                      <Text style={styles.followStatLabel}>Followers</Text>
                    </View>
                    <View style={styles.followStatDivider} />
                    <View style={styles.followStatItem}>
                      <Text style={styles.followStatNumber}>
                        {postUser.following?.length || 0}
                      </Text>
                      <Text style={styles.followStatLabel}>Following</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Follow/Unfollow Button */}
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.unfollowButton,
                ]}
                onPress={() => followUser(postUser._id)}
              >
                <Feather
                  name={isFollowing ? "user-check" : "user-plus"}
                  size={18}
                  color={isFollowing ? "#94a3b8" : "#ffffff"}
                />
                <Text
                  style={[
                    styles.followButtonText,
                    isFollowing && styles.unfollowButtonText,
                  ]}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
              <TouchableOpacity style={styles.statItem} onPress={likePost}>
                <Feather name="heart" size={20} color="#64748b" />
                <Text style={styles.statText}>
                  {post.likes?.length || 0}{" "}
                  {post.likes?.length === 1 ? "like" : "likes"}
                </Text>
              </TouchableOpacity>
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
              Comments ({comments.length || 0})
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
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={addComment}
                >
                  <Feather name="send" size={20} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Comments List */}
            {comments && comments.length > 0 ? (
              <View style={styles.commentsList}>
                {comments.map((comment, index) => (
                  <View key={comment._id || index} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Feather name="user" size={14} color="#64748b" />
                    </View>
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>
                          {comment.userName || "User"}
                        </Text>
                        <Text style={styles.commentTime}>
                          {comment.createdAt
                            ? formatTime(comment.createdAt)
                            : "Recently"}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>
                        {comment.comment || "Comment text"}
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
  // Follow/Unfollow Section Styles
  followSection: {
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  followUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  followAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
    marginRight: 16,
  },
  followUserDetails: {
    flex: 1,
  },
  followUserName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 10,
  },
  followStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  followStatItem: {
    alignItems: "center",
  },
  followStatNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  followStatLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  followStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#334155",
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  unfollowButton: {
    backgroundColor: "#0f172a",
    borderWidth: 1.5,
    borderColor: "#334155",
    shadowColor: "transparent",
  },
  unfollowButtonText: {
    color: "#94a3b8",
  },
});

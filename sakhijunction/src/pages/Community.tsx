"use client"

import React, { useState, useEffect, useRef } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FilterIcon,
  PlusIcon,
  SendIcon,
  HashIcon,
  UserIcon,
  MessageCircleIcon,
  XIcon,
  HeartIcon,
  SettingsIcon,
  Trash2Icon,
  MoreHorizontalIcon,
  EditIcon,
  RepeatIcon
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Mock current user data - replace with actual auth
const CURRENT_USER = {
  id: "user_123",
  name: "You",
  email: "user@example.com"
}

// Enhanced Discussion Card Component
function DiscussionCard({
  id,
  author,
  authorId,
  timeAgo,
  content,
  likes,
  replies,
  topic,
  tags = [],
  isLiked = false,
  isAnonymous = false,
  onLike,
  onReply,
  onDelete,
  onEdit
}) {
  const canDelete = authorId === CURRENT_USER.id
  const canEdit = authorId === CURRENT_USER.id

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-border/30 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
              {isAnonymous ? <UserIcon className="h-5 w-5" /> : author?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{author || "Anonymous Sister"}</p>
                {isAnonymous && (
                  <Badge variant="secondary" className="text-xs">
                    Anonymous
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800"
            >
              {topic}
            </Badge>

            {/* More options menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    <EditIcon className="h-4 w-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem onClick={() => onDelete(id)} className="text-red-600 hover:text-red-700">
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <RepeatIcon className="h-4 w-4 mr-2" />
                  Share Post
                </DropdownMenuItem>
                <DropdownMenuItem>Report Post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                <HashIcon className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-border/20">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 text-muted-foreground hover:text-foreground",
              isLiked && "text-pink-600 hover:text-pink-700",
            )}
            onClick={() => onLike(id)}
          >
            <HeartIcon className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span className="text-sm">{likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => onReply(id)}
          >
            <MessageCircleIcon className="h-4 w-4" />
            <span className="text-sm">{replies}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Chat Message Component
function ChatMessage({ message, isCurrentUser, showAvatar }) {
  return (
    <div className={`group hover:bg-muted/20 -mx-4 px-4 py-1 ${showAvatar ? "mt-4" : "mt-0"}`}>
      {showAvatar ? (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
            {message.author.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-medium text-sm">{message.author}</span>
              {message.isAnonymous && (
                <Badge variant="secondary" className="text-xs">
                  Anonymous
                </Badge>
              )}
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">
                  You
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="w-10 flex-shrink-0 flex justify-center">
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Community() {
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Post creation state
  const [postContent, setPostContent] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("General Discussion")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [anonymousName, setAnonymousName] = useState("Anonymous Sister")
  const [postTags, setPostTags] = useState([])
  const [currentTag, setCurrentTag] = useState("")

  // Edit state
  const [editingPost, setEditingPost] = useState(null)
  const [editContent, setEditContent] = useState("")

  // Posts state
  const [discussions, setDiscussions] = useState([
    {
      id: "1",
      authorId: CURRENT_USER.id,
      author: CURRENT_USER.name,
      content: "Just wanted to share my PCOS journey with everyone. It's been challenging but this community has helped so much! 💪",
      topic: "PCOS",
      tags: ["pcos", "support", "journey"],
      likes: 12,
      replies: 5,
      isLiked: false,
      isAnonymous: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      authorId: "user_456",
      author: "Anonymous Sister",
      content: "Does anyone have recommendations for managing period pain naturally? I've tried heat pads but looking for other options.",
      topic: "Menstrual Health",
      tags: ["periods", "natural", "pain-relief"],
      likes: 8,
      replies: 12,
      isLiked: true,
      isAnonymous: true,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "3",
      authorId: "user_789",
      author: "Dr. Priya",
      content: "Remember ladies, regular check-ups are important for early detection. Don't postpone your health screenings! Here's a helpful checklist I've compiled.",
      topic: "General Discussion",
      tags: ["health", "prevention", "checkup"],
      likes: 25,
      replies: 3,
      isLiked: false,
      isAnonymous: false,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    }
  ])

  const [filteredTopic, setFilteredTopic] = useState("All Topics")
  const [sortBy, setSortBy] = useState("newest")

  // Comment state
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [commentContent, setCommentContent] = useState("")
  const [isCommentAnonymous, setIsCommentAnonymous] = useState(false)
  const [postComments, setPostComments] = useState({})

  // Chat state
  const [activeChannelId, setActiveChannelId] = useState("general")
  const [chatMessages, setChatMessages] = useState({
    general: [
      {
        id: "1",
        author: "Priya S.",
        content: "Hi everyone! Hope you're all having a good day 😊",
        timestamp: new Date(Date.now() - 300000),
        isAnonymous: false,
        userId: "user_456"
      },
      {
        id: "2",
        author: "Anonymous Sister",
        content: "Thank you for creating such a supportive space. It means a lot to have somewhere to talk openly.",
        timestamp: new Date(Date.now() - 240000),
        isAnonymous: true,
        userId: "user_789"
      }
    ],
    pcos: [],
    menstrual: [],
    mental: [],
    nutrition: []
  })
  const [currentMessage, setCurrentMessage] = useState("")
  const [isChatAnonymous, setIsChatAnonymous] = useState(false)
  const [chatAnonymousName, setChatAnonymousName] = useState("Anonymous Sister")

  // Refs
  const chatEndRef = useRef(null)
  const tagInputRef = useRef(null)

  const topics = [
    "All Topics",
    "PCOS",
    "Cancer",
    "Menstrual Health",
    "Reproductive Health",
    "Mental Health",
    "Nutrition",
    "Fitness",
    "Self-Defense",
    "General Discussion",
    "Support",
    "Question",
    "Experience Sharing",
  ]

  // Chat channels organized by category
  const chatChannels = {
    "General": [
      { id: "general", name: "general-discussion", displayName: "General Discussion", description: "Open discussion for all topics" },
      { id: "introductions", name: "introductions", displayName: "Introductions", description: "Introduce yourself to the community" },
      { id: "daily", name: "daily-check-in", displayName: "Daily Check-in", description: "Share your daily thoughts and feelings" }
    ],
    "Health Topics": [
      { id: "pcos", name: "pcos-support", displayName: "PCOS Support", description: "Support and discussion about PCOS" },
      { id: "menstrual", name: "menstrual-health", displayName: "Menstrual Health", description: "Discussion about menstrual health and cycles" },
      { id: "mental", name: "mental-wellness", displayName: "Mental Wellness", description: "Mental health support and resources" },
      { id: "nutrition", name: "nutrition-diet", displayName: "Nutrition & Diet", description: "Healthy eating and nutrition tips" }
    ],
    "Support Groups": [
      { id: "pregnancy", name: "pregnancy-support", displayName: "Pregnancy Support", description: "Support for expecting mothers" },
      { id: "cancer", name: "cancer-support", displayName: "Cancer Support", description: "Support for cancer patients and survivors" },
      { id: "fitness", name: "fitness", displayName: "Fitness & Motivation", description: "Workout tips and fitness motivation" }
    ]
  }

  // Initialize missing chat channels
  useEffect(() => {
    const allChannelIds = Object.values(chatChannels).flat().map(ch => ch.id)
    setChatMessages(prev => {
      const newMessages = { ...prev }
      allChannelIds.forEach(id => {
        if (!newMessages[id]) {
          newMessages[id] = []
        }
      })
      return newMessages
    })
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, activeChannelId])

  // Filter discussions based on topic
  const filteredDiscussions = discussions.filter(discussion => 
    filteredTopic === "All Topics" || discussion.topic === filteredTopic
  ).sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.timestamp) - new Date(b.timestamp)
      case "popular":
        return (b.likes + b.replies) - (a.likes + a.replies)
      default:
        return new Date(b.timestamp) - new Date(a.timestamp)
    }
  })

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - new Date(timestamp)
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  const handlePostSubmit = async () => {
    if (!postContent.trim()) {
      toast.error("Please write something before posting")
      return
    }

    setIsSaving(true)

    try {
      const newPost = {
        id: Date.now().toString(),
        authorId: CURRENT_USER.id,
        author: isAnonymous ? anonymousName : CURRENT_USER.name,
        content: postContent,
        topic: selectedTopic,
        tags: postTags,
        likes: 0,
        replies: 0,
        isLiked: false,
        isAnonymous,
        timestamp: new Date(),
      }

      setDiscussions(prev => [newPost, ...prev])

      // Reset form
      setPostContent("")
      setPostTags([])
      setCurrentTag("")
      setIsAnonymous(false)
      setAnonymousName("Anonymous Sister")
      setSelectedTopic("General Discussion")

      toast.success("Your post has been submitted successfully!")
    } catch (error) {
      toast.error("Failed to create post")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditPost = (postId) => {
    const post = discussions.find(p => p.id === postId)
    if (post) {
      setEditingPost(post)
      setEditContent(post.content)
    }
  }

  const handleUpdatePost = () => {
    if (!editContent.trim()) {
      toast.error("Post content cannot be empty")
      return
    }

    setDiscussions(prev => prev.map(post => 
      post.id === editingPost.id 
        ? { ...post, content: editContent, isEdited: true }
        : post
    ))

    setEditingPost(null)
    setEditContent("")
    toast.success("Post updated successfully!")
  }

  const handleDeletePost = (postId) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setDiscussions(prev => prev.filter(post => post.id !== postId))
      toast.success("Post deleted successfully")
    }
  }

  const handleLikePost = (postId) => {
    setDiscussions(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ))
  }

  const handleOpenComments = (postId) => {
    const post = discussions.find(p => p.id === postId)
    setSelectedPost(post)
    setCommentDialogOpen(true)
  }

  const handleCommentSubmit = () => {
    if (!commentContent.trim() || !selectedPost) {
      return
    }

    const newComment = {
      id: Date.now().toString(),
      authorId: CURRENT_USER.id,
      author: isCommentAnonymous ? "Anonymous Sister" : CURRENT_USER.name,
      content: commentContent,
      timestamp: new Date(),
      isAnonymous: isCommentAnonymous
    }

    // Update post comments
    setPostComments(prev => ({
      ...prev,
      [selectedPost.id]: [...(prev[selectedPost.id] || []), newComment]
    }))

    // Update reply count
    setDiscussions(prev => prev.map(post => 
      post.id === selectedPost.id 
        ? { ...post, replies: post.replies + 1 }
        : post
    ))

    setCommentContent("")
    setIsCommentAnonymous(false)
    setCommentDialogOpen(false)
    setSelectedPost(null)
    toast.success("Comment added successfully!")
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim()) {
      return
    }

    const newMessage = {
      id: Date.now().toString(),
      author: isChatAnonymous ? chatAnonymousName : CURRENT_USER.name,
      content: currentMessage,
      timestamp: new Date(),
      isAnonymous: isChatAnonymous,
      userId: CURRENT_USER.id
    }

    setChatMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage]
    }))

    setCurrentMessage("")
    toast.success("Message sent!")
  }

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim().toLowerCase()
    if (trimmedTag && !postTags.includes(trimmedTag) && postTags.length < 5) {
      setPostTags(prev => [...prev, trimmedTag])
      setCurrentTag("")
      tagInputRef.current?.focus()
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setPostTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const getActiveChannel = () => {
    return Object.values(chatChannels).flat().find(ch => ch.id === activeChannelId)
  }

  const currentChatMessages = chatMessages[activeChannelId] || []

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {/* Save indicator */}
        {isSaving && (
          <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded-md text-sm">Saving...</div>
        )}

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Sakhi Junction Community
            </h1>
            <p className="text-xl text-muted-foreground">Connect, share, and support each other in our safe space</p>
          </div>

          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
              <TabsTrigger value="feed">Community Feed</TabsTrigger>
              <TabsTrigger value="chat">Chat Channels</TabsTrigger>
            </TabsList>

            <TabsContent value="feed">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Sidebar - Topics */}
                <div className="md:col-span-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-border/30 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FilterIcon className="h-4 w-4" />
                      Filter by Topic
                    </h3>

                    <div className="space-y-2">
                      {topics.map((topic) => (
                        <Button
                          key={topic}
                          variant={topic === filteredTopic ? "default" : "ghost"}
                          className={
                            topic === filteredTopic
                              ? "w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                              : "w-full justify-start"
                          }
                          onClick={() => setFilteredTopic(topic)}
                        >
                          {topic}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/30">
                      <Label className="text-sm font-medium mb-2 block">Sort Posts</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-6">
                  {/* Create Post */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-border/30">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <PlusIcon className="h-5 w-5" />
                      Share Your Thoughts
                    </h3>

                    <div className="space-y-4">
                      {/* Anonymous Toggle */}
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <Label htmlFor="anonymous-post">Post Anonymously</Label>
                        </div>
                        <Switch id="anonymous-post" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                      </div>

                      {/* Anonymous Name Input */}
                      {isAnonymous && (
                        <div>
                          <Label htmlFor="anonymous-name">Anonymous Name</Label>
                          <Input
                            id="anonymous-name"
                            value={anonymousName}
                            onChange={(e) => setAnonymousName(e.target.value)}
                            placeholder="Anonymous Sister"
                            className="mt-1"
                          />
                        </div>
                      )}

                      {/* Topic Selection */}
                      <div>
                        <Label htmlFor="post-topic">Topic</Label>
                        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {topics
                              .filter((t) => t !== "All Topics")
                              .map((topic) => (
                                <SelectItem key={topic} value={topic}>
                                  {topic}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tags */}
                      <div>
                        <Label htmlFor="post-tags">Tags (Optional)</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            ref={tagInputRef}
                            id="post-tags"
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            placeholder="Add a tag..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddTag()
                              }
                            }}
                            disabled={postTags.length >= 5}
                          />
                          <Button
                            type="button"
                            onClick={handleAddTag}
                            disabled={!currentTag.trim() || postTags.length >= 5}
                            size="sm"
                          >
                            <HashIcon className="h-4 w-4" />
                          </Button>
                        </div>

                        {postTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {postTags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                #{tag}
                                <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-500">
                                  <XIcon className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{postTags.length}/5 tags used</p>
                      </div>

                      {/* Content */}
                      <div>
                        <Label htmlFor="post-content">Your Message</Label>
                        <Textarea
                          id="post-content"
                          placeholder="Share your thoughts, ask questions, or offer support..."
                          className="resize-none min-h-[120px] mt-1"
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          maxLength={2000}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">{postContent.length}/2000 characters</p>
                          <p className="text-xs text-muted-foreground">
                            Posting as {isAnonymous ? anonymousName : CURRENT_USER.name}
                          </p>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                        onClick={handlePostSubmit}
                        disabled={isSaving || !postContent.trim()}
                      >
                        {isSaving ? "Posting..." : "Share Post"}
                      </Button>
                    </div>
                  </div>

                  {/* Posts Feed */}
                  <div className="space-y-4">
                    {filteredDiscussions.length > 0 ? (
                      filteredDiscussions.map((discussion) => (
                        <DiscussionCard
                          key={discussion.id}
                          id={discussion.id}
                          author={discussion.author}
                          authorId={discussion.authorId}
                          timeAgo={formatTimeAgo(discussion.timestamp)}
                          content={discussion.content}
                          likes={discussion.likes}
                          replies={discussion.replies}
                          topic={discussion.topic}
                          tags={discussion.tags}
                          isLiked={discussion.isLiked}
                          isAnonymous={discussion.isAnonymous}
                          onLike={handleLikePost}
                          onReply={handleOpenComments}
                          onDelete={handleDeletePost}
                          onEdit={handleEditPost}
                        />
                      ))
                    ) : (
                      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-border/30">
                        <MessageCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">No posts found</p>
                        <p className="text-sm text-muted-foreground">
                          {filteredTopic !== "All Topics"
                            ? `No posts in ${filteredTopic} yet. Be the first to share!`
                            : "Be the first to start a conversation!"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sidebar - Stats */}
                <div className="md:col-span-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-border/30 mb-6">
                    <h3 className="font-semibold mb-4">Community Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Posts</span>
                        <Badge variant="outline">{discussions.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Topics</span>
                        <Badge variant="outline">{topics.length - 1}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Chat Channels</span>
                        <Badge variant="outline">
                          {Object.values(chatChannels).reduce((acc, channels) => acc + channels.length, 0)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-border/30">
                    <h3 className="font-semibold mb-4">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {["support", "pcos", "mentalhealth", "nutrition", "fitness", "selfcare", "periods", "wellness"].map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-pink-100 dark:hover:bg-pink-900/30" 
                          onClick={() => setCurrentTag(tag)}>
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <div className="flex h-[700px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border/30 overflow-hidden">
                {/* Channel Sidebar */}
                <div className="w-64 bg-muted/20 border-r border-border/30 flex flex-col">
                  {/* Server Header */}
                  <div className="p-4 border-b border-border/30 bg-gradient-to-r from-pink-500 to-purple-600">
                    <h3 className="font-semibold text-white">Sakhi Junction</h3>
                    <p className="text-xs text-pink-100">Community Chat Channels</p>
                  </div>

                  {/* Channel Categories */}
                  <ScrollArea className="flex-1 p-2">
                    {Object.entries(chatChannels).map(([category, channels]) => (
                      <div key={category} className="mb-4">
                        <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <MessageCircleIcon className="h-3 w-3" />
                          {category}
                        </div>
                        <div className="space-y-1">
                          {channels.map((channel) => (
                            <Button
                              key={channel.id}
                              variant="ghost"
                              className={`w-full justify-start text-left h-8 px-2 ${
                                channel.id === activeChannelId
                                  ? "bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-700 dark:text-pink-300"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => setActiveChannelId(channel.id)}
                            >
                              <HashIcon className="h-3 w-3 mr-2" />
                              <span className="text-sm truncate">{channel.displayName}</span>
                              {chatMessages[channel.id] && chatMessages[channel.id].length > 0 && (
                                <div className="ml-auto w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>

                  {/* User Panel */}
                  <div className="p-3 bg-muted/20 border-t border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {isChatAnonymous ? "A" : CURRENT_USER.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isChatAnonymous ? chatAnonymousName : CURRENT_USER.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Online</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <SettingsIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border/30 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HashIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">
                            {getActiveChannel()?.displayName || "General Discussion"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {getActiveChannel()?.description || "Welcome! Share your thoughts and connect with others."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Online indicator */}
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white"
                              >
                                {i}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">12+ online</span>
                        </div>

                        {/* Anonymous Toggle */}
                        <div className="flex items-center gap-2">
                          <Label htmlFor="chat-anonymous" className="text-sm">
                            Anonymous
                          </Label>
                          <Switch id="chat-anonymous" checked={isChatAnonymous} onCheckedChange={setIsChatAnonymous} />
                        </div>
                      </div>
                    </div>

                    {/* Anonymous Name for Chat */}
                    {isChatAnonymous && (
                      <div className="mt-3">
                        <Input
                          value={chatAnonymousName}
                          onChange={(e) => setChatAnonymousName(e.target.value)}
                          placeholder="Anonymous Sister"
                          className="text-sm max-w-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                      {currentChatMessages.length > 0 ? (
                        currentChatMessages.map((message, index) => {
                          const prevMessage = currentChatMessages[index - 1]
                          const showAvatar =
                            !prevMessage ||
                            prevMessage.author !== message.author ||
                            new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000

                          const isCurrentUser = message.userId === CURRENT_USER.id

                          return (
                            <ChatMessage
                              key={message.id}
                              message={message}
                              isCurrentUser={isCurrentUser}
                              showAvatar={showAvatar}
                            />
                          )
                        })
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <MessageCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-2">
                              Welcome to #{getActiveChannel()?.name || "general-discussion"}!
                            </p>
                            <p className="text-sm text-muted-foreground">This is the start of your conversation.</p>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border/30">
                    <div className="relative">
                      <Textarea
                        placeholder={`Message #${getActiveChannel()?.name || "general-discussion"}`}
                        className="resize-none min-h-[60px] pr-12 border-0 bg-muted/30 focus:bg-muted/50"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        maxLength={1000}
                      />
                      <Button
                        className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim()}
                      >
                        <SendIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">
                        {currentMessage.length}/1000 • Press Enter to send, Shift+Enter for new line
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Typing as {isChatAnonymous ? chatAnonymousName : CURRENT_USER.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Comment Dialog */}
        <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Comments - {selectedPost?.topic}</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col h-full max-h-[60vh]">
              {/* Original Post */}
              {selectedPost && (
                <div className="bg-muted/20 p-4 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                      {selectedPost.isAnonymous ? <UserIcon className="h-4 w-4" /> : selectedPost.author?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{selectedPost.author}</span>
                        {selectedPost.isAnonymous && <Badge variant="secondary" className="text-xs">Anonymous</Badge>}
                      </div>
                      <p className="text-sm leading-relaxed">{selectedPost.content}</p>
                      {selectedPost.tags && selectedPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedPost.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-3">
                  {selectedPost && postComments[selectedPost.id] && postComments[selectedPost.id].length > 0 ? (
                    postComments[selectedPost.id].map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-green-500 flex items-center justify-center text-white font-medium">
                          {comment.isAnonymous ? <UserIcon className="h-4 w-4" /> : comment.author?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            {comment.isAnonymous && <Badge variant="secondary" className="text-xs">Anonymous</Badge>}
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.timestamp)}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircleIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Add Comment */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="comment-anonymous">Comment Anonymously</Label>
                  <Switch id="comment-anonymous" checked={isCommentAnonymous} onCheckedChange={setIsCommentAnonymous} />
                </div>
                <Textarea
                  placeholder="Write your comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-[80px]"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {commentContent.length}/1000 characters • Commenting as {isCommentAnonymous ? "Anonymous Sister" : CURRENT_USER.name}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCommentSubmit} disabled={!commentContent.trim()}>
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Post Dialog */}
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[120px]"
                maxLength={2000}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">{editContent.length}/2000 characters</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingPost(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePost} disabled={!editContent.trim()}>
                    Update Post
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function Chatbot() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const flatListRef = useRef(null);
  const router = useRouter();

  // Load chat history from the backend
  const fetchChatHistory = async () => {
    try {
      const res = await axios.get('http://192.168.1.42:8000/api/chat/');
      // Map API fields (role, message) to the UI structure
      const formatted = res.data.map((msg, index) => ({
        id: msg.id || index.toString(),
        role: msg.role,
        text: msg.message,
      }));
      setMessages(formatted);
    } catch (err) {
      console.error('Error fetching chat history', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMsgText = message;
    setMessage('');

    // Append user message to UI immediately
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: userMsgText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await axios.post('http://192.168.1.42:8000/api/chat/', {
        message: userMsgText,
      });

      // Append bot message to UI
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: res.data.assistant.message,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error sending chatbot message', err);
      // Append fallback error message
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I am having trouble connecting to the server. Please verify your connection.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.botWrapper]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>AI</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>AI Assistant</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineIndicator} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* MESSAGES LIST */}
        {initialLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>Connecting to Assistant...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Text style={styles.emptyIcon}>🤖</Text>
                </View>
                <Text style={styles.emptyTitle}>Chat with AI Helper</Text>
                <Text style={styles.emptySubtitle}>
                  Ask me anything about your courses, upcoming exams, or study topics! I'm here to assist you.
                </Text>
              </View>
            }
          />
        )}

        {/* TYPING INDICATOR */}
        {loading && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color="#4f46e5" style={styles.typingSpinner} />
            <Text style={styles.typingText}>AI is thinking...</Text>
          </View>
        )}

        {/* INPUT PANEL */}
        <View style={styles.inputPanel}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your question..."
            placeholderTextColor="#94a3b8"
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!message.trim() || loading}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
  },
  backBtnText: {
    fontSize: 22,
    color: '#1e293b',
    fontWeight: '800',
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  botWrapper: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  botAvatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4f46e5',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 4,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 1,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#1e293b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  typingSpinner: {
    marginRight: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  inputPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    maxHeight: 100,
  },
  sendBtn: {
    marginLeft: 12,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
});

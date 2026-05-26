import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
// 🔗 Import your custom configured API instance
import api from '../services/api'; 

// Define typescript type for our chat messages
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function ChatbotMobile() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am your Exam Portal Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newMsgId = Date.now().toString();
    
    // 1. Immediately append the user's message locally
    setMessages((prev) => [...prev, { id: newMsgId, sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Fire request directly to your Django endpoint using your api instance
      // This automatically prepends http://192.168.18.38:8000/api/ and adds your auth token!
      const response = await api.post('chat/', {
        message: userMessage
      });

      setMessages((prev) => [
        ...prev, 
        { id: (Date.now() + 1).toString(), sender: 'ai', text: response.data.reply }
      ]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.reply || err.response?.data?.error || "Connection to portal assistant failed.";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: `Error: ${errorMsg}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
    >
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.statusDot} />
        <Text style={styles.headerTitle}>Portal Assistant</Text>
      </View>

      {/* Messages Stream */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4338ca" />
        </View>
      )}

      {/* Input Action Bar */}
      <View style={styles.inputTray}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor="#94a3b8"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !input.trim() && styles.disabledButton]} 
          onPress={handleSendMessage}
          disabled={!input.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>➔</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#4338ca',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statusDot: { width: 10, height: 10, backgroundColor: '#4ade80', borderRadius: 5 },
  headerTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  chatArea: { padding: 16, paddingBottom: 24 },
  messageRow: { flexDirection: 'row', marginVertical: 6, width: '100%' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: '#4338ca', borderBottomRightRadius: 0 },
  aiBubble: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9', borderBottomLeftRadius: 0 },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#ffffff' },
  aiText: { color: '#1e293b' },
  loadingContainer: { paddingHorizontal: 20, paddingVertical: 8, alignItems: 'flex-start' },
  inputTray: { flexDirection: 'row', padding: 12, backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', gap: 8 },
  input: { flex: 1, height: 44, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, color: '#1e293b', fontSize: 14 },
  sendButton: { backgroundColor: '#4338ca', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { opacity: 0.5 },
  sendButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
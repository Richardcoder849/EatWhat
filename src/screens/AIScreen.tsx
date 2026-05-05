import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { askAI } from '../services/aiService';
import { getAllRecipes } from '../services/recipeService';
import { theme } from '../theme';
import AppBackground from '../components/AppBackground';

interface Message { role: 'user' | 'assistant'; content: string }

export default function AIScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '告诉我家里有什么食材，我会用 DeepSeek 帮你配一顿不无聊的菜。' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const recipes = await getAllRecipes();
      const ctx = recipes.length ? `\n我的菜谱：${recipes.map(r => r.name).join('、')}` : '';
      const reply = await askAI(text, `你是一个热情、实用的 AI 家庭厨师，优先推荐菜谱库里的菜。用中文回答，给出简洁可执行的建议。${ctx}`);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `出错了：${e.message || '请求失败'}` }]);
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppBackground>
        <ScrollView style={styles.chatArea} contentContainerStyle={[styles.chatContent, { paddingBottom: tabBarHeight + 18 }]}>
          {messages.map((msg, i) => (
            <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>{msg.content}</Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.bubbleText, { marginLeft: 8 }]}>思考中...</Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: tabBarHeight + 10 }]}>
          <TextInput
            style={styles.chatInput}
            placeholder="输入食材，例如：鸡蛋、番茄、米饭..."
            placeholderTextColor={theme.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.5 }]} onPress={handleSend} disabled={!input.trim() || loading}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </AppBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingTop: 58, paddingBottom: 16 },
  bubble: { maxWidth: '86%', padding: 14, borderRadius: 18, marginBottom: 10 },
  userBubble: { backgroundColor: theme.primary, alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  assistantBubble: { backgroundColor: theme.glass, alignSelf: 'flex-start', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: theme.glassBorder },
  loadingBubble: { flexDirection: 'row', alignItems: 'center' },
  bubbleText: { fontSize: 15, color: theme.text, lineHeight: 22, flexShrink: 1 },
  userBubbleText: { color: '#fff', fontWeight: '600' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    backgroundColor: theme.glass,
    borderTopWidth: 1,
    borderTopColor: theme.glassBorder,
  },
  chatInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.58)', borderRadius: 23, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: theme.text, maxHeight: 100, borderWidth: 1, borderColor: theme.glassBorder },
  sendBtn: { backgroundColor: theme.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

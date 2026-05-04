import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { askAI } from '../services/aiService';
import { getAllRecipes } from '../services/recipeService';
import { theme } from '../theme';

const bgGrad = Platform.OS === 'web'
  ? { background: 'linear-gradient(180deg, #F2F5EE 0%, #EAF0E4 50%, #E5EDDC 100%)' }
  : { backgroundColor: theme.background };

interface Message { role: 'user' | 'assistant'; content: string }

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 告诉我你家里有哪些食材，我来推荐一道好菜！' },
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
      const reply = await askAI(text, `你是一个热情的 AI 家庭厨师，推荐菜品。优先推荐菜谱库中的。用中文，亲切。${ctx}`);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) { setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${e.message || '请求失败'}` }]); }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, bgGrad]}>
        <View style={[styles.blob, { width: 220, height: 220, top: -60, right: -50, backgroundColor: '#A8D86B' }]} />
        <View style={[styles.blob, { width: 160, height: 160, bottom: 80, left: -40, backgroundColor: '#86C84B' }]} />

        <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 16 }}>
          {messages.map((msg, i) => (
            <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>{msg.content}</Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, styles.assistantBubble, { flexDirection: 'row', alignItems: 'center' }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.bubbleText, { marginLeft: 8 }]}> 思考中...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput style={styles.chatInput} placeholder="输入食材，如：鸡蛋、番茄..." placeholderTextColor={theme.textMuted} value={input} onChangeText={setInput} multiline maxLength={500} />
          <TouchableOpacity style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.5 }]} onPress={handleSend} disabled={!input.trim() || loading}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 200, opacity: 0.3 },
  chatArea: { flex: 1 },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 16, marginBottom: 10 },
  userBubble: { backgroundColor: theme.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: 'rgba(255,255,255,0.65)', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)' },
  bubbleText: { fontSize: 15, color: theme.text, lineHeight: 22, flexShrink: 1 },
  userBubbleText: { color: '#fff' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 8,
    backgroundColor: 'rgba(255,255,255,0.65)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.85)',
  },
  chatInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: theme.text, maxHeight: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)' },
  sendBtn: { backgroundColor: theme.primary, width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
});

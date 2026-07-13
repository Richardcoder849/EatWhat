import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { askAI, getAIConfig } from '../services/aiService';
import { getAllRecipes } from '../services/recipeService';
import { theme } from '../theme';

interface Message { role: 'user' | 'assistant'; content: string }

const QUICK_PROMPTS = ['用现有食材想一道', '把这道菜改清淡', '推荐15分钟快手菜'];

export default function AIScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '告诉我现有食材、口味或做饭时间，我会结合你的菜谱推荐。' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(useCallback(() => {
    getAIConfig().then(config => setConfigured(Boolean(config.apiKey))).catch(() => setConfigured(false));
  }, []));

  function scrollToBottom() {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }

  async function handleSend(value = input) {
    const text = value.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(previous => [...previous, { role: 'user', content: text }]);
    setLoading(true);
    scrollToBottom();
    try {
      const recipes = await getAllRecipes();
      const names = recipes.slice(0, 30).map(recipe => recipe.name).join('、');
      const context = names ? `\n用户的本地菜谱包括：${names}` : '';
      const reply = await askAI(
        text,
        `你是家庭点菜助手。优先从用户的本地菜谱中推荐；回答简洁，说明推荐理由，必要时给出替代菜。使用中文。${context}`
      );
      setMessages(previous => [...previous, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      setMessages(previous => [...previous, { role: 'assistant', content: error.message || '请求失败，请稍后重试。' }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>灵感助手</Text>
        <Text style={styles.subtitle}>缺食材、想换口味时再问它</Text>
      </View>

      {!configured && (
        <View style={styles.configBanner}>
          <View style={styles.configTextWrap}>
            <Text style={styles.configTitle}>AI 服务尚未配置</Text>
            <Text style={styles.configText}>本地菜谱仍可正常使用</Text>
          </View>
          <TouchableOpacity style={styles.configButton} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.configButtonText}>去设置</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((message, index) => (
          <View key={`${message.role}-${index}`} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            {message.role === 'assistant' && <Text style={styles.assistantLabel}>点菜助手</Text>}
            <Text style={[styles.bubbleText, message.role === 'user' && styles.userBubbleText]}>{message.content}</Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={styles.loadingText}>正在想菜单…</Text>
          </View>
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroller} contentContainerStyle={styles.promptContent} keyboardShouldPersistTaps="handled">
        {QUICK_PROMPTS.map(prompt => (
          <TouchableOpacity key={prompt} style={styles.promptChip} onPress={() => handleSend(prompt)} disabled={loading || !configured}>
            <Text style={styles.promptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.chatInput}
          placeholder="输入食材、口味或用餐人数"
          placeholderTextColor={theme.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity style={[styles.sendButton, (!input.trim() || loading || !configured) && styles.sendButtonDisabled]} onPress={() => handleSend()} disabled={!input.trim() || loading || !configured} accessibilityLabel="发送">
          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 27, fontWeight: '800', color: theme.text },
  subtitle: { marginTop: 4, fontSize: 13, color: theme.textSecondary },
  configBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, padding: 12, borderRadius: 8, backgroundColor: theme.accentBg },
  configTextWrap: { flex: 1 },
  configTitle: { color: '#7A5012', fontSize: 14, fontWeight: '700' },
  configText: { marginTop: 2, color: '#806B4B', fontSize: 12 },
  configButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 7, backgroundColor: '#FFFFFF' },
  configButtonText: { color: '#7A5012', fontSize: 13, fontWeight: '700' },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingTop: 8 },
  bubble: { maxWidth: '88%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 8, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: theme.primary },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  assistantLabel: { marginBottom: 4, color: theme.primary, fontSize: 11, fontWeight: '800' },
  bubbleText: { color: theme.text, fontSize: 15, lineHeight: 22 },
  userBubbleText: { color: '#FFFFFF' },
  loadingBubble: { flexDirection: 'row', alignItems: 'center' },
  loadingText: { marginLeft: 8, color: theme.textSecondary, fontSize: 14 },
  promptScroller: { flexGrow: 0, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface },
  promptContent: { paddingHorizontal: 12, paddingVertical: 9 },
  promptChip: { justifyContent: 'center', paddingHorizontal: 12, height: 34, marginRight: 8, borderRadius: 8, backgroundColor: theme.primaryBg },
  promptText: { color: theme.primaryDark, fontSize: 13, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface },
  chatInput: { flex: 1, minHeight: 44, maxHeight: 104, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background, color: theme.text, fontSize: 15 },
  sendButton: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary },
  sendButtonDisabled: { backgroundColor: theme.textMuted },
});

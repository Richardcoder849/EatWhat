import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { askAI } from '../services/aiService';
import { getAllRecipes } from '../services/recipeService';
import { theme } from '../theme';
import AppBackground from '../components/AppBackground';
import GlassCard from '../components/GlassCard';

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  { emoji: '🥚', text: '鸡蛋、番茄、米饭', label: '番茄炒蛋' },
  { emoji: '🥩', text: '五花肉、冰糖、八角', label: '红烧肉' },
  { emoji: '🍗', text: '鸡翅、可乐、姜片', label: '可乐鸡翅' },
  { emoji: '🥦', text: '西兰花、大蒜、蚝油', label: '蒜蓉西兰花' },
  { emoji: '🐟', text: '三文鱼、味噌、清酒', label: '味噌三文鱼' },
  { emoji: '🍝', text: '意面、蘑菇、淡奶油', label: '奶油蘑菇意面' },
];

export default function AIScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '告诉我家里有什么食材，我会用 DeepSeek 帮你配一顿不无聊的菜。也可以点下面的示例试试 👇' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Speech recognition events
  useSpeechRecognitionEvent('result', (ev) => {
    const text = ev.results.map(r => r.transcript).join('');
    setTranscript(text);
    setInput(text);
  });

  useSpeechRecognitionEvent('error', (ev) => {
    setIsListening(false);
    if (ev.error !== 'aborted' && ev.error !== 'no-speech') {
      setMessages(prev => [...prev, {
        role: 'assistant', content: `🎤 语音识别出错了：${ev.message}`
      }]);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    if (transcript) setInput(transcript);
  });

  async function toggleVoice() {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
      return;
    }

    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '需要麦克风权限才能使用语音输入，请在系统设置中开启。'
        }]);
        return;
      }

      setTranscript('');
      ExpoSpeechRecognitionModule.start({
        lang: 'zh-CN',
        interimResults: true,
        continuous: false,
        addsPunctuation: true,
      });
      setIsListening(true);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `启动语音识别失败：${e.message}`
      }]);
    }
  }

  async function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setTranscript('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const recipes = await getAllRecipes();
      const ctx = recipes.length ? `\n我的菜谱：${recipes.map(r => r.name).join('、')}` : '';
      const reply = await askAI(msg, `你是一个热情、实用的 AI 家庭厨师，优先推荐菜谱库里的菜。用中文回答，给出简洁可执行的建议。${ctx}`);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `出错了：${e.message || '请求失败'}` }]);
    }
    setLoading(false);
  }

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppBackground>
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={[styles.chatContent, { paddingBottom: tabBarHeight + 18 }]}
        >
          {/* Quick suggestions */}
          {messages.length === 1 && !loading && (
            <View style={styles.suggestionsWrap}>
              <Text style={styles.suggestionsTitle}>🥘 试试这些示例</Text>
              <View style={styles.suggestionsGrid}>
                {SUGGESTIONS.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionChip}
                    onPress={() => handleSend(s.text)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionEmoji}>{s.emoji}</Text>
                    <View style={styles.suggestionTextWrap}>
                      <Text style={styles.suggestionLabel} numberOfLines={1}>{s.label}</Text>
                      <Text style={styles.suggestionDesc} numberOfLines={1}>{s.text}</Text>
                    </View>
                    <Ionicons name="send" size={12} color={theme.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Chat bubbles */}
          {messages.map((msg, i) => (
            <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              {msg.role === 'assistant' && (
                <Text style={styles.bubbleRole}>🍳 AI 厨师</Text>
              )}
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

        {/* Input bar with voice */}
        <View style={[styles.inputBar, { paddingBottom: tabBarHeight + 10 }]}>
          {/* Voice toggle */}
          <TouchableOpacity
            style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
            onPress={toggleVoice}
          >
            <Ionicons
              name={isListening ? 'mic' : 'mic-outline'}
              size={20}
              color={isListening ? '#fff' : theme.primary}
            />
          </TouchableOpacity>

          <TextInput
            style={[styles.chatInput, isListening && styles.chatInputListening]}
            placeholder={isListening ? '🎤 正在聆听...' : '输入食材，例如：鸡蛋、番茄、米饭...'}
            placeholderTextColor={isListening ? theme.primary : theme.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!isListening}
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.5 }]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
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
  bubble: { maxWidth: '90%', padding: 14, borderRadius: 18, marginBottom: 10 },
  userBubble: { backgroundColor: theme.primary, alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  assistantBubble: {
    backgroundColor: theme.glass, alignSelf: 'flex-start', borderBottomLeftRadius: 5,
    borderWidth: 1, borderColor: theme.glassBorder,
  },
  loadingBubble: { flexDirection: 'row', alignItems: 'center' },
  bubbleRole: { fontSize: 11, fontWeight: '800', color: theme.primaryDark, marginBottom: 4 },
  bubbleText: { fontSize: 15, color: theme.text, lineHeight: 22, flexShrink: 1 },
  userBubbleText: { color: '#fff', fontWeight: '600' },
  // Suggestions
  suggestionsWrap: { marginBottom: 16 },
  suggestionsTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 10 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.glass,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    gap: 6,
    width: '48%',
  },
  suggestionEmoji: { fontSize: 20 },
  suggestionTextWrap: { flex: 1 },
  suggestionLabel: { fontSize: 13, fontWeight: '700', color: theme.text },
  suggestionDesc: { fontSize: 11, color: theme.textMuted, marginTop: 1 },
  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    backgroundColor: theme.glass,
    borderTopWidth: 1,
    borderTopColor: theme.glassBorder,
  },
  voiceBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.primaryBg,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  voiceBtnActive: {
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  chatInputListening: {
    borderColor: theme.primary,
    borderWidth: 1.5,
  },
  sendBtn: {
    backgroundColor: theme.primary,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

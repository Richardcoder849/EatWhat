import React, { useState, useEffect } from 'react';
import {
  Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BUILTIN_API_KEY, DEFAULT_AI_CONFIG, getAIConfig, saveAIConfig } from '../services/aiService';
import { theme } from '../theme';
import GlassCard from '../components/GlassCard';
import AppBackground from '../components/AppBackground';

export default function SettingsScreen() {
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    try {
      const c = await getAIConfig();
      setBaseUrl(c.baseUrl);
      setModel(c.model);
    } catch {}
  }

  function fillDeepSeekDefaults() {
    setBaseUrl(DEFAULT_AI_CONFIG.baseUrl);
    setModel(DEFAULT_AI_CONFIG.model);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveAIConfig({
        baseUrl: baseUrl.trim() || DEFAULT_AI_CONFIG.baseUrl,
        model: model.trim() || DEFAULT_AI_CONFIG.model,
      });
      Alert.alert('保存成功', 'DeepSeek 配置已更新');
    } catch {
      Alert.alert('保存失败', '请重试');
    }
    setSaving(false);
  }

  return (
    <AppBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <GlassCard style={styles.card}>
          <Text style={styles.kicker}>AI 厨房助手</Text>
          <Text style={styles.title}>DeepSeek 配置</Text>
          <Text style={styles.desc}>API Key 已内置，开箱即用。你也可以在此自定义接口地址和模型。</Text>

          <TouchableOpacity style={styles.quickBtn} onPress={fillDeepSeekDefaults}>
            <Ionicons name="flash" size={17} color={theme.primary} />
            <Text style={styles.quickBtnText}>恢复 DeepSeek 默认配置</Text>
          </TouchableOpacity>

          <Text style={styles.label}>API Base URL</Text>
          <TextInput style={styles.input} placeholder={DEFAULT_AI_CONFIG.baseUrl} placeholderTextColor={theme.textMuted} value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" keyboardType="url" />

          <Text style={styles.label}>模型名称</Text>
          <TextInput style={styles.input} placeholder={DEFAULT_AI_CONFIG.model} placeholderTextColor={theme.textMuted} value={model} onChangeText={setModel} autoCapitalize="none" />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="save" size={18} color="#fff" /><Text style={styles.saveBtnText}> 保存配置</Text></>}
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.title}>关于</Text>
          <Text style={styles.aboutText}>吃什么？v1.0 是一个家庭菜谱和 AI 点菜应用，内置 DeepSeek API Key，打开即可使用 AI 推荐菜谱功能。</Text>
        </GlassCard>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 58, paddingBottom: 92 },
  card: { padding: 20, marginBottom: 16 },
  kicker: { fontSize: 12, color: theme.primaryDark, fontWeight: '900', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '900', color: theme.text },
  desc: { fontSize: 13, color: theme.textSecondary, lineHeight: 20, marginTop: 8, marginBottom: 14 },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: theme.primaryBg,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.28)',
  },
  quickBtnText: { color: theme.primary, fontSize: 14, fontWeight: '800' },
  label: { fontSize: 14, fontWeight: '800', color: theme.textSecondary, marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.58)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.glassBorder },
  saveBtn: { flexDirection: 'row', justifyContent: 'center', backgroundColor: theme.primary, paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  aboutText: { fontSize: 14, color: theme.textSecondary, lineHeight: 22, marginTop: 8 },
});

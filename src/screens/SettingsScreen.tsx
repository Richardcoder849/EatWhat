import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAIConfig, saveAIConfig } from '../services/aiService';
import { theme } from '../theme';
import GlassCard from '../components/GlassCard';

const bgGrad = Platform.OS === 'web'
  ? { background: 'linear-gradient(180deg, #F2F5EE 0%, #EAF0E4 50%, #E5EDDC 100%)' }
  : { backgroundColor: theme.background };

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() { try { const c = await getAIConfig(); setApiKey(c.apiKey); setBaseUrl(c.baseUrl); setModel(c.model); } catch {} }

  async function handleSave() {
    if (!apiKey.trim()) { Alert.alert('提示', '请输入 API Key'); return; }
    setSaving(true);
    try {
      await saveAIConfig({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim() || 'https://api.openai.com/v1', model: model.trim() || 'gpt-3.5-turbo' });
      Alert.alert('保存成功', '');
    } catch { Alert.alert('保存失败', '请重试'); }
    setSaving(false);
  }

  return (
    <ScrollView style={[styles.container, bgGrad]} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View style={[styles.blob, { width: 200, height: 200, top: -50, right: -50, backgroundColor: '#A8D86B' }]} />
      <View style={[styles.blob, { width: 150, height: 150, bottom: 60, left: -40, backgroundColor: '#86C84B' }]} />

      <GlassCard style={{ padding: 20 }}>
        <View style={styles.titleRow}><Ionicons name="sparkles" size={20} color={theme.primary} /><Text style={styles.title}> AI 配置</Text></View>
        <Text style={styles.desc}>支持 OpenAI 兼容接口</Text>

        <Text style={styles.label}>API Key *</Text>
        <TextInput style={styles.input} placeholder="sk-..." placeholderTextColor={theme.textMuted} value={apiKey} onChangeText={setApiKey} secureTextEntry autoCapitalize="none" />

        <Text style={styles.label}>API Base URL</Text>
        <TextInput style={styles.input} placeholder="https://api.openai.com/v1" placeholderTextColor={theme.textMuted} value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" keyboardType="url" />

        <Text style={styles.label}>模型名称</Text>
        <TextInput style={styles.input} placeholder="gpt-3.5-turbo" placeholderTextColor={theme.textMuted} value={model} onChangeText={setModel} autoCapitalize="none" />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="save" size={18} color="#fff" /><Text style={styles.saveBtnText}> 保存配置</Text></>}
        </TouchableOpacity>
      </GlassCard>

      <GlassCard style={{ padding: 20, marginTop: 16 }}>
        <View style={styles.titleRow}><Ionicons name="information-circle" size={20} color={theme.primary} /><Text style={styles.title}> 关于</Text></View>
        <Text style={styles.aboutText}>吃什么？v1.0 — 草绿色毛玻璃风格家庭菜谱应用，帮你解决每天"吃什么"的难题。</Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 200, opacity: 0.3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '600', color: theme.text },
  desc: { fontSize: 13, color: theme.textSecondary, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: theme.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)' },
  saveBtn: { flexDirection: 'row', justifyContent: 'center', backgroundColor: theme.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  aboutText: { fontSize: 14, color: theme.textSecondary, lineHeight: 22, marginTop: 8 },
});

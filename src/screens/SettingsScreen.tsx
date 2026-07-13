import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAIConfig, saveAIConfig } from '../services/aiService';
import { getRecipeCount } from '../services/recipeService';
import { theme } from '../theme';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [recipeCount, setRecipeCount] = useState(0);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    try {
      const [config, count] = await Promise.all([getAIConfig(), getRecipeCount()]);
      setApiKey(config.apiKey);
      setBaseUrl(config.baseUrl);
      setModel(config.model);
      setRecipeCount(count);
    } catch {
      Alert.alert('加载失败', '暂时无法读取设置');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadConfig(); }, [loadConfig]));

  async function handleSave() {
    const normalizedUrl = baseUrl.trim() || 'https://api.openai.com/v1';
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      Alert.alert('地址格式不正确', 'API Base URL 应以 http:// 或 https:// 开头');
      return;
    }

    setSaving(true);
    try {
      await saveAIConfig({
        apiKey: apiKey.trim(),
        baseUrl: normalizedUrl.replace(/\/+$/, ''),
        model: model.trim() || 'gpt-3.5-turbo',
      });
      Alert.alert('已保存', apiKey.trim() ? 'AI 点菜现在可以使用了' : 'API Key 已清空');
    } catch {
      Alert.alert('保存失败', '请稍后重试');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>设置</Text>
        <Text style={styles.subtitle}>管理 AI 服务与应用信息</Text>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statIcon}><Ionicons name="book-outline" size={22} color={theme.primary} /></View>
        <View style={styles.statText}>
          <Text style={styles.statTitle}>本地菜谱</Text>
          <Text style={styles.statDescription}>数据仅保存在这台设备</Text>
        </View>
        <Text style={styles.statValue}>{recipeCount} 道</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>AI 服务</Text>
        <Text style={styles.optionalLabel}>可选</Text>
      </View>
      <Text style={styles.sectionDescription}>支持 OpenAI 兼容接口；不配置也能使用菜谱和随机点菜。</Text>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={styles.loading} />
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>API Key</Text>
          <View style={styles.secureInputWrap}>
            <TextInput
              style={styles.secureInput}
              placeholder="sk-..."
              placeholderTextColor={theme.textMuted}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowApiKey(value => !value)} accessibilityLabel={showApiKey ? '隐藏 API Key' : '显示 API Key'}>
              <Ionicons name={showApiKey ? 'eye-off-outline' : 'eye-outline'} size={21} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>API Base URL</Text>
          <TextInput style={styles.input} placeholder="https://api.openai.com/v1" placeholderTextColor={theme.textMuted} value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" />

          <Text style={styles.label}>模型名称</Text>
          <TextInput style={styles.input} placeholder="gpt-3.5-turbo" placeholderTextColor={theme.textMuted} value={model} onChangeText={setModel} autoCapitalize="none" autoCorrect={false} />

          <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="save-outline" size={19} color="#FFFFFF" />}
            <Text style={styles.saveButtonText}>{saving ? '正在保存…' : '保存 AI 配置'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.aboutRow}>
        <View>
          <Text style={styles.aboutTitle}>吃什么？</Text>
          <Text style={styles.aboutText}>先做决定，再安心做饭</Text>
        </View>
        <Text style={styles.version}>v2.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 32 },
  header: { marginBottom: 22 },
  title: { fontSize: 27, fontWeight: '800', color: theme.text },
  subtitle: { marginTop: 4, fontSize: 13, color: theme.textSecondary },
  statRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface },
  statIcon: { width: 42, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryBg },
  statText: { flex: 1, marginLeft: 12 },
  statTitle: { color: theme.text, fontSize: 15, fontWeight: '700' },
  statDescription: { marginTop: 2, color: theme.textSecondary, fontSize: 12 },
  statValue: { color: theme.primary, fontSize: 17, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 26 },
  sectionTitle: { color: theme.text, fontSize: 19, fontWeight: '800' },
  optionalLabel: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, color: '#7A5012', backgroundColor: theme.accentBg, fontSize: 11, fontWeight: '700' },
  sectionDescription: { marginTop: 6, color: theme.textSecondary, fontSize: 13, lineHeight: 20 },
  loading: { marginVertical: 40 },
  form: { marginTop: 4 },
  label: { marginTop: 16, marginBottom: 7, color: theme.textSecondary, fontSize: 13, fontWeight: '700' },
  input: { minHeight: 46, paddingHorizontal: 13, borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface, color: theme.text, fontSize: 15 },
  secureInputWrap: { minHeight: 46, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface },
  secureInput: { flex: 1, paddingHorizontal: 13, paddingVertical: 10, color: theme.text, fontSize: 15 },
  eyeButton: { width: 46, height: 44, alignItems: 'center', justifyContent: 'center' },
  saveButton: { minHeight: 50, marginTop: 22, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: theme.primary },
  saveButtonDisabled: { opacity: 0.65 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  divider: { height: 1, marginTop: 30, backgroundColor: theme.border },
  aboutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20 },
  aboutTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  aboutText: { marginTop: 3, color: theme.textSecondary, fontSize: 12 },
  version: { color: theme.textMuted, fontSize: 13, fontWeight: '600' },
});

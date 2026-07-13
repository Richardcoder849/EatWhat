import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getRecipeById, addRecipe, updateRecipe } from '../services/recipeService';
import { theme } from '../theme';
import { parseRecipeList } from '../utils/recipe';

const CATEGORIES = ['中餐', '西餐', '日料', '甜点', '汤羹', '早餐', '小吃', '饮品', '其他'];

export default function AddEditRecipeScreen({ route, navigation }: any) {
  const recipeId = route.params?.recipeId;
  const isEdit = recipeId != null;
  const [name, setName] = useState('');
  const [category, setCategory] = useState('中餐');
  const [cookTime, setCookTime] = useState('30');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (recipeId) loadRecipe(); }, [recipeId]);

  async function loadRecipe() {
    try {
      const recipe = await getRecipeById(recipeId);
      if (!recipe) {
        Alert.alert('菜谱不存在', '这道菜可能已经被删除', [{ text: '返回', onPress: () => navigation.goBack() }]);
        return;
      }
      const loadedIngredients = parseRecipeList(recipe.ingredients);
      const loadedSteps = parseRecipeList(recipe.steps);
      setName(recipe.name); setCategory(recipe.category);
      setCookTime(String(recipe.cookTime || 30));
      setIngredients(loadedIngredients.length ? loadedIngredients : ['']);
      setSteps(loadedSteps.length ? loadedSteps : ['']);
      setNotes(recipe.notes); setImageUri(recipe.imageUri);
    } catch {
      Alert.alert('加载失败', '请返回后重试');
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('需要权限', '请在设置中允许访问相册'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('需要权限', '请在设置中允许使用相机'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  }

  function showImagePicker() {
    Alert.alert('添加图片', '选择图片方式', [
      { text: '从相册选择', onPress: pickImage }, { text: '拍照', onPress: takePhoto }, { text: '取消', style: 'cancel' },
    ]);
  }

  function updateArr(arr: string[], i: number, v: string) { const n = [...arr]; n[i] = v; return n; }
  function removeArr(arr: string[], i: number) { return arr.filter((_, idx) => idx !== i); }

  async function handleSave() {
    if (saving) return;
    if (!name.trim()) { Alert.alert('提示', '请输入菜名'); return; }
    const vi = ingredients.filter(i => i.trim());
    if (!vi.length) { Alert.alert('提示', '请至少输入一种食材'); return; }
    const vs = steps.filter(s => s.trim());
    if (!vs.length) { Alert.alert('提示', '请至少输入一个步骤'); return; }
    const normalizedCookTime = Math.max(1, Math.min(300, Number.parseInt(cookTime, 10) || 30));
    const data = { name: name.trim(), category, cookTime: normalizedCookTime, tags: '[]', ingredients: JSON.stringify(vi.map(i => i.trim())), steps: JSON.stringify(vs.map(s => s.trim())), notes: notes.trim(), imageUri };
    setSaving(true);
    try {
      if (isEdit) await updateRecipe({ id: recipeId, ...data } as any);
      else await addRecipe(data);
      navigation.goBack();
    } catch {
      setSaving(false);
      Alert.alert('保存失败', '请重试');
    }
  }

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.imagePicker}>
          {imageUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.imageAction} onPress={showImagePicker} accessibilityLabel="更换图片">
                  <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageAction} onPress={() => setImageUri('')} accessibilityLabel="移除图片">
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={showImagePicker} style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={32} color={theme.textMuted} />
                <Text style={styles.imagePlaceholderText}>添加菜品图片</Text>
                <Text style={styles.imagePlaceholderHint}>建议使用横向成品图</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>菜名</Text>
        <TextInput style={styles.input} placeholder="例如：红烧肉" placeholderTextColor={theme.textMuted} value={name} onChangeText={setName} />

        <Text style={styles.label}>预计用时</Text>
        <View style={styles.timeInputWrap}>
          <Ionicons name="time-outline" size={19} color={theme.textSecondary} />
          <TextInput
            style={styles.timeInput}
            placeholder="30"
            placeholderTextColor={theme.textMuted}
            value={cookTime}
            onChangeText={value => setCookTime(value.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={styles.timeSuffix}>分钟</Text>
        </View>

        <Text style={styles.label}>分类</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>食材</Text>
        {ingredients.map((item, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.numCircle}><Text style={styles.numText}>{i + 1}</Text></View>
            <TextInput style={styles.dynamicInput} placeholder={`食材 ${i + 1}`} placeholderTextColor={theme.textMuted} value={item} onChangeText={v => setIngredients(updateArr(ingredients, i, v))} />
            {ingredients.length > 1 && <TouchableOpacity onPress={() => setIngredients(removeArr(ingredients, i))}><Ionicons name="close-circle" size={22} color={theme.textMuted} /></TouchableOpacity>}
          </View>
        ))}
        <TouchableOpacity style={styles.addLine} onPress={() => setIngredients([...ingredients, ''])}><Ionicons name="add-circle" size={18} color={theme.primary} /><Text style={styles.addLineText}> 添加食材</Text></TouchableOpacity>

        <Text style={styles.label}>步骤</Text>
        {steps.map((step, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.stepCircle}><Text style={styles.stepNumText}>{i + 1}</Text></View>
            <TextInput style={styles.dynamicInput} placeholder={`步骤 ${i + 1}`} placeholderTextColor={theme.textMuted} value={step} onChangeText={v => setSteps(updateArr(steps, i, v))} multiline />
            {steps.length > 1 && <TouchableOpacity onPress={() => setSteps(removeArr(steps, i))}><Ionicons name="close-circle" size={22} color={theme.textMuted} /></TouchableOpacity>}
          </View>
        ))}
        <TouchableOpacity style={styles.addLine} onPress={() => setSteps([...steps, ''])}><Ionicons name="add-circle" size={18} color={theme.primary} /><Text style={styles.addLineText}> 添加步骤</Text></TouchableOpacity>

        <Text style={styles.label}>备注</Text>
        <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="小贴士..." placeholderTextColor={theme.textMuted} value={notes} onChangeText={setNotes} multiline />

        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
          <Text style={styles.saveBtnText}>{saving ? '正在保存…' : isEdit ? '保存修改' : '添加菜谱'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, paddingBottom: 40 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  label: { fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginTop: 20, marginBottom: 8, marginLeft: 2 },
  input: { backgroundColor: theme.surface, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.border },
  imagePicker: { alignItems: 'center', marginBottom: 4 },
  previewWrap: { width: '100%', position: 'relative' },
  previewImage: { width: '100%', height: 210, borderRadius: 8 },
  imageActions: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', gap: 8 },
  imageAction: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(24,37,29,0.78)' },
  imagePlaceholder: { width: '100%', height: 176, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: theme.borderStrong, borderRadius: 8, backgroundColor: theme.surface },
  imagePlaceholderText: { marginTop: 9, color: theme.textSecondary, fontSize: 14, fontWeight: '700' },
  imagePlaceholderHint: { marginTop: 3, color: theme.textMuted, fontSize: 12 },
  timeInputWrap: { minHeight: 46, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface },
  timeInput: { flex: 1, paddingHorizontal: 9, paddingVertical: 10, color: theme.text, fontSize: 15 },
  timeSuffix: { color: theme.textSecondary, fontSize: 14 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  chipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  chipText: { fontSize: 14, color: theme.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  dynamicInput: { flex: 1, backgroundColor: theme.surface, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.border },
  numCircle: { width: 22, height: 22, borderRadius: 7, backgroundColor: theme.primaryBg, justifyContent: 'center', alignItems: 'center' },
  numText: { fontSize: 12, fontWeight: '700', color: theme.primaryDark },
  stepCircle: { width: 24, height: 24, borderRadius: 7, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  addLine: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginLeft: 2 },
  addLineText: { color: theme.primary, fontSize: 14, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', gap: 8, justifyContent: 'center', backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 28 },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

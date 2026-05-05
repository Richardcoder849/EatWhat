import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getRecipeById, addRecipe, updateRecipe } from '../services/recipeService';
import { theme } from '../theme';
import GlassCard from '../components/GlassCard';
import AppBackground from '../components/AppBackground';

const CATEGORIES = ['中餐', '西餐', '日料', '甜点', '汤羹', '早餐', '小吃', '饮品', '其他'];

export default function AddEditRecipeScreen({ route, navigation }: any) {
  const recipeId = route.params?.recipeId;
  const isEdit = !!recipeId;
  const [name, setName] = useState('');
  const [category, setCategory] = useState('中餐');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState('');

  useEffect(() => { if (recipeId) loadRecipe(); }, [recipeId]);

  async function loadRecipe() {
    const recipe = await getRecipeById(recipeId);
    if (recipe) {
      setName(recipe.name);
      setCategory(recipe.category);
      setIngredients(JSON.parse(recipe.ingredients));
      setSteps(JSON.parse(recipe.steps));
      setNotes(recipe.notes);
      setImageUri(recipe.imageUri);
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
      { text: '从相册选择', onPress: pickImage },
      { text: '拍照', onPress: takePhoto },
      { text: '取消', style: 'cancel' },
    ]);
  }

  function updateArr(arr: string[], i: number, v: string) { const n = [...arr]; n[i] = v; return n; }
  function removeArr(arr: string[], i: number) { return arr.filter((_, idx) => idx !== i); }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('提示', '请输入菜名'); return; }
    const vi = ingredients.filter(i => i.trim());
    if (!vi.length) { Alert.alert('提示', '请至少输入一种食材'); return; }
    const vs = steps.filter(s => s.trim());
    if (!vs.length) { Alert.alert('提示', '请至少输入一个步骤'); return; }
    const data = { name: name.trim(), category, ingredients: JSON.stringify(vi.map(i => i.trim())), steps: JSON.stringify(vs.map(s => s.trim())), notes: notes.trim(), imageUri };
    try {
      if (isEdit) await updateRecipe({ id: recipeId, ...data } as any);
      else await addRecipe(data);
      navigation.goBack();
    } catch { Alert.alert('保存失败', '请重试'); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppBackground>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={showImagePicker} style={styles.imagePicker} activeOpacity={0.82}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <GlassCard style={styles.imageEmpty}>
                <Ionicons name="camera-outline" size={34} color={theme.primary} />
                <Text style={styles.imageEmptyText}>添加菜品图片</Text>
              </GlassCard>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>菜名</Text>
          <TextInput style={styles.input} placeholder="例如：红烧肉" placeholderTextColor={theme.textMuted} value={name} onChangeText={setName} />

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
          <TextInput style={[styles.input, styles.notesInput]} placeholder="小贴士..." placeholderTextColor={theme.textMuted} value={notes} onChangeText={setNotes} multiline />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.86}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveBtnText}> {isEdit ? '保存修改' : '添加菜谱'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </AppBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 24, paddingBottom: 104 },
  label: { fontSize: 14, fontWeight: '800', color: theme.textSecondary, marginTop: 20, marginBottom: 8, marginLeft: 2 },
  input: { backgroundColor: theme.inputBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.glassBorder },
  imagePicker: { alignItems: 'center', marginBottom: 4 },
  imageEmpty: { padding: 32, alignItems: 'center', width: '100%', borderStyle: 'dashed' },
  imageEmptyText: { color: theme.textSecondary, marginTop: 8, fontWeight: '700' },
  previewImage: { width: '100%', height: 210, borderRadius: 18 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: theme.glass, borderWidth: 1, borderColor: theme.glassBorder },
  chipActive: { backgroundColor: theme.ink, borderColor: theme.ink },
  chipText: { fontSize: 14, color: theme.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  dynamicInput: { flex: 1, backgroundColor: theme.inputBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.glassBorder },
  numCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primaryBg, justifyContent: 'center', alignItems: 'center' },
  numText: { fontSize: 12, fontWeight: '800', color: theme.primaryDark },
  stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  addLine: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginLeft: 2 },
  addLineText: { color: theme.primary, fontSize: 14, fontWeight: '800' },
  notesInput: { minHeight: 88, textAlignVertical: 'top' },
  saveBtn: { flexDirection: 'row', justifyContent: 'center', backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 28, shadowColor: theme.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.26, shadowRadius: 14, elevation: 8 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { Gender, Season, UserProfile } from '../types';
import { calculateDailyWaterGoal } from '../utils/waterCalculator';

interface OnboardingFormProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({
  onComplete,
}) => {
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>('female');
  const [season, setSeason] = useState<Season>('summer');

  const seasons: Season[] = ['summer', 'winter', 'spring', 'autumn'];

  const handleSubmit = () => {
    const parsedAge = parseInt(age, 10);
    if (!parsedAge || parsedAge <= 0 || parsedAge > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 120.');
      return;
    }

    const dailyGoalMl = calculateDailyWaterGoal(parsedAge, gender, season);

    onComplete({
      age: parsedAge,
      gender,
      season,
      dailyGoalMl,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Tracker Setup</Text>
      <Text style={styles.subtitle}>
        Enter your details to calculate your daily goal
      </Text>

      {/* ورودی سن */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 26"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />
      </View>

      {/* انتخاب جنسیت */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.row}>
          {(['male', 'female'] as Gender[]).map((item) => (
            <Pressable
              key={item}
              style={[styles.chip, gender === item && styles.chipActive]}
              onPress={() => setGender(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  gender === item && styles.chipTextActive,
                ]}
              >
                {item.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* انتخاب فصل */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Current Season</Text>
        <View style={styles.row}>
          {seasons.map((item) => (
            <Pressable
              key={item}
              style={[styles.chip, season === item && styles.chipActive]}
              onPress={() => setSeason(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  season === item && styles.chipTextActive,
                ]}
              >
                {item.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* دکمه محاسبه و ثبت */}
      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Calculate Daily Goal</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  chipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

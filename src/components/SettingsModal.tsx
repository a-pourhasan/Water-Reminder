import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  Switch,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationSettings, UserProfile, Gender, Season } from '../types';
import { calculateDailyWaterGoal } from '../utils/waterCalculator';

interface SettingsModalProps {
  visible: boolean;
  initialSettings: NotificationSettings;
  initialProfile: UserProfile | null;
  onClose: () => void;
  onSave: (settings: NotificationSettings, profile: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  initialSettings,
  initialProfile,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'notifications' | 'profile'>(
    'notifications',
  );

  // استیت‌های نوتیفیکیشن
  const [settings, setSettings] =
    useState<NotificationSettings>(initialSettings);

  // استیت‌های مشخصات اولیه (جنسیت، سن و فصل)
  const [gender, setGender] = useState<Gender>(
    initialProfile?.gender || 'male',
  );
  const [age, setAge] = useState<string>(
    (initialProfile?.age ?? 25).toString(),
  );
  const [season, setSeason] = useState<Season>(
    initialProfile?.season || 'summer',
  );

  const seasons: Season[] = ['summer', 'winter', 'spring', 'autumn'];

  useEffect(() => {
    if (visible && initialProfile) {
      setSettings(initialSettings);
      setGender(initialProfile.gender || 'male');
      setAge((initialProfile.age ?? 25).toString());
      setSeason(initialProfile.season || 'summer');
    }
  }, [visible, initialSettings, initialProfile]);

  const ageNum = parseInt(age, 10) || 25;
  const computedDailyGoal = calculateDailyWaterGoal(ageNum, gender, season);

  const handleSave = () => {
    const updatedProfile: UserProfile = {
      gender,
      age: ageNum,
      season,
      dailyGoalMl: computedDailyGoal,
    };

    onSave(settings, updatedProfile);
    onClose();
  };

  if (!visible) return null;

  const modalContent = (
    <View style={styles.overlay}>
      {/* لمس فضای تیره بالا پنجره را می‌بندد */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdropClickArea} />
      </TouchableWithoutFeedback>

      {/* کانتینر سفید مماس به کف بدون فاصله اضافی */}
      <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
        {/* نوار جابجایی تب‌ها */}
        <View style={styles.tabBar}>
          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'notifications' && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'notifications' && styles.tabBtnTextActive,
              ]}
            >
              🔔 Notifications
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'profile' && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab('profile')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'profile' && styles.tabBtnTextActive,
              ]}
            >
              👤 Profile
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'notifications' ? (
            /* تب نوتیفیکیشن */
            <View>
              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>Enable Reminders</Text>
                  <Text style={styles.subLabel}>
                    Periodic alerts throughout the day
                  </Text>
                </View>
                <Switch
                  value={settings.enabled}
                  onValueChange={(val) =>
                    setSettings((prev) => ({ ...prev, enabled: val }))
                  }
                  trackColor={{ false: '#cbd5e1', true: '#38bdf8' }}
                  thumbColor={settings.enabled ? '#0284c7' : '#f8fafc'}
                />
              </View>

              {settings.enabled && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.label}>Notification Sound</Text>
                      <Text style={styles.subLabel}>
                        {settings.soundEnabled
                          ? 'Sound enabled'
                          : 'Muted (Silent)'}
                      </Text>
                    </View>
                    <Switch
                      value={settings.soundEnabled}
                      onValueChange={(val) =>
                        setSettings((prev) => ({
                          ...prev,
                          soundEnabled: val,
                        }))
                      }
                      trackColor={{ false: '#cbd5e1', true: '#38bdf8' }}
                      thumbColor={settings.soundEnabled ? '#0284c7' : '#f8fafc'}
                    />
                  </View>

                  <View style={styles.divider} />

                  <Text style={[styles.label, { marginBottom: 10 }]}>
                    Reminder Frequency
                  </Text>
                  <View style={styles.frequencyGroup}>
                    <Pressable
                      style={[
                        styles.freqOption,
                        settings.frequency === 'once_daily' &&
                          styles.freqOptionActive,
                      ]}
                      onPress={() =>
                        setSettings((prev) => ({
                          ...prev,
                          frequency: 'once_daily',
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.freqText,
                          settings.frequency === 'once_daily' &&
                            styles.freqTextActive,
                        ]}
                      >
                        Once a day
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.freqOption,
                        settings.frequency === 'three_daily' &&
                          styles.freqOptionActive,
                      ]}
                      onPress={() =>
                        setSettings((prev) => ({
                          ...prev,
                          frequency: 'three_daily',
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.freqText,
                          settings.frequency === 'three_daily' &&
                            styles.freqTextActive,
                        ]}
                      >
                        3 times a day
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.freqOption,
                        settings.frequency === 'every_2h' &&
                          styles.freqOptionActive,
                      ]}
                      onPress={() =>
                        setSettings((prev) => ({
                          ...prev,
                          frequency: 'every_2h',
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.freqText,
                          settings.frequency === 'every_2h' &&
                            styles.freqTextActive,
                        ]}
                      >
                        Every 2h
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ) : (
            /* تب مشخصات کاربری */
            <View>
              {/* انتخاب سن */}
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor="#94a3b8"
              />

              {/* انتخاب جنسیت */}
              <Text style={[styles.label, { marginTop: 14 }]}>Gender</Text>
              <View style={styles.rowGender}>
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

              {/* انتخاب فصل */}
              <Text style={[styles.label, { marginTop: 14 }]}>
                Current Season
              </Text>
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

              {/* پیش‌نمایش هدف جدید */}
              <View style={styles.goalPreviewBox}>
                <Text style={styles.goalPreviewTitle}>
                  Calculated Daily Goal:
                </Text>
                <Text style={styles.goalPreviewValue}>
                  {computedDailyGoal} ml
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* کلیدهای انصراف و ذخیره */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView behavior="padding" style={styles.flexOne}>
          {modalContent}
        </KeyboardAvoidingView>
      ) : (
        modalContent
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropClickArea: {
    flex: 1,
    width: '100%',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    maxHeight: '85%',
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#0284c7',
    fontWeight: 'bold',
  },
  scrollArea: {
    maxHeight: 340,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowGender: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  frequencyGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  freqOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqOptionActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  freqText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  freqTextActive: {
    color: '#0284c7',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
  },
  chip: {
    paddingVertical: 8,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  goalPreviewBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  goalPreviewTitle: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
  },
  goalPreviewValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0284c7',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 18,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: '#64748b',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

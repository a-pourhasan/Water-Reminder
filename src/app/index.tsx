import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingForm } from '../components/OnboardingForm';
import { WaterGallon } from '../components/WaterGallon';
import { WaterActionButton } from '../components/WaterActionButton';
import { WeeklyHistory } from '../components/WeeklyHistory';
import { NotificationBanner } from '../components/NotificationBanner';
import { SettingsModal } from '../components/SettingsModal';
import { CelebrationModal } from '../components/CelebrationModal';

import { useTiltSensor } from '../hooks/useTiltSensor';
import {
  UserProfile,
  DailyWaterState,
  DailyRecord,
  NotificationSettings,
} from '../types';
import {
  getUserProfile,
  saveUserProfile,
  getDailyWaterState,
  saveCurrentWater,
  getWeeklyHistory,
  getNotificationSettings,
  saveNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../storage/waterStorage';
import {
  applyNotificationSettings,
  triggerTestBanner,
} from '../services/notificationService';

export default function HomeScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyState, setDailyState] = useState<DailyWaterState | null>(null);
  const [lastAddedAmount, setLastAddedAmount] = useState<number>(0);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  // تنظیمات نوتیفیکیشن و مودال
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS,
  );
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // استیت بنر شناور (Heads-up)
  const [bannerVisible, setBannerVisible] = useState<boolean>(false);
  const [bannerContent, setBannerContent] = useState({
    title: '',
    message: '',
  });

  const tiltX = useTiltSensor();

  const refreshHistory = async () => {
    const records = await getWeeklyHistory();
    setHistory(records);
  };

  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedProfile = await getUserProfile();
        if (storedProfile) {
          const storedDailyState = await getDailyWaterState();
          const storedSettings = await getNotificationSettings();

          setProfile(storedProfile);
          setDailyState(storedDailyState);
          setNotifSettings(storedSettings);
          await refreshHistory();
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStoredData();
  }, []);

  const handleProfileComplete = async (newProfile: UserProfile) => {
    setLoading(true);
    await saveUserProfile(newProfile);
    const initialDailyState = await getDailyWaterState();
    setProfile(newProfile);
    setDailyState(initialDailyState);
    await refreshHistory();
    setLoading(false);
  };

  const handleAddWater = async (amountMl: number) => {
    if (!dailyState || !profile) return;

    setLastAddedAmount(amountMl);
    const newTotal = dailyState.currentWaterMl + amountMl;

    // اگر قبلاً کمتر از هدف بوده و حالا رسیده یا رد کرده، جشن بگیر
    if (
      dailyState.currentWaterMl < profile.dailyGoalMl &&
      newTotal >= profile.dailyGoalMl
    ) {
      setCelebrationVisible(true);
    }

    await saveCurrentWater(newTotal, profile.dailyGoalMl);
    setDailyState((prev) =>
      prev ? { ...prev, currentWaterMl: newTotal } : null,
    );
    await refreshHistory();
  };

  const handleResetWater = async () => {
    if (!profile) return;

    setLastAddedAmount(0);
    await saveCurrentWater(0, profile.dailyGoalMl);
    setDailyState((prev) => (prev ? { ...prev, currentWaterMl: 0 } : null));
    await refreshHistory();
  };

  const handleSaveSettings = async (
    newSettings: NotificationSettings,
    updatedProfile: UserProfile,
  ) => {
    setProfile(updatedProfile);
    await saveUserProfile(updatedProfile);

    if (dailyState) {
      await saveCurrentWater(
        dailyState.currentWaterMl,
        updatedProfile.dailyGoalMl,
      );
    }
    await refreshHistory();

    setNotifSettings(newSettings);
    await saveNotificationSettings(newSettings);
    await applyNotificationSettings(newSettings);

    if (newSettings.enabled) {
      triggerTestBanner(newSettings, (title, message) => {
        setBannerContent({ title, message });
        setBannerVisible(true);
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <NotificationBanner
        visible={bannerVisible}
        title={bannerContent.title}
        message={bannerContent.message}
        onDismiss={() => setBannerVisible(false)}
      />

      {profile && (
        <SettingsModal
          visible={settingsModalOpen}
          initialSettings={notifSettings}
          initialProfile={profile}
          onClose={() => setSettingsModalOpen(false)}
          onSave={handleSaveSettings}
        />
      )}

      {/* مودال انیمیشن جشن تکمیل هدف */}
      {profile && (
        <CelebrationModal
          visible={celebrationVisible}
          dailyGoalMl={profile.dailyGoalMl}
          onClose={() => setCelebrationVisible(false)}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!profile ? (
            <OnboardingForm onComplete={handleProfileComplete} />
          ) : (
            <View style={styles.dashboardContainer}>
              <View style={styles.topBar}>
                <View>
                  <Text style={styles.headerTitle}>Daily Hydration</Text>
                  <Text style={styles.dateSubtitle}>
                    Today: {dailyState?.lastUpdatedDate}
                  </Text>
                </View>
                <Pressable
                  style={styles.settingsIconBtn}
                  onPress={() => setSettingsModalOpen(true)}
                >
                  <Text style={styles.settingsIconText}>⚙️</Text>
                </Pressable>
              </View>

              <WaterGallon
                currentMl={dailyState?.currentWaterMl ?? 0}
                goalMl={profile.dailyGoalMl}
                tiltX={tiltX}
                addedAmount={lastAddedAmount}
              />

              <Text style={styles.sectionTitle}>Add Water</Text>
              <View style={styles.buttonRow}>
                <WaterActionButton
                  amount={250}
                  label="Glass"
                  onPress={handleAddWater}
                />
                <WaterActionButton
                  amount={500}
                  label="Bottle"
                  onPress={handleAddWater}
                />
              </View>

              <WeeklyHistory history={history} />

              <Pressable style={styles.resetBtn} onPress={handleResetWater}>
                <Text style={styles.resetBtnText}>Reset Today</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  dashboardContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topBar: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dateSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  settingsIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsIconText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 18,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  resetBtn: {
    marginTop: 12,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
});

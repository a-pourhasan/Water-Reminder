import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  DailyWaterState,
  DailyRecord,
  NotificationSettings,
} from '../types';

const PROFILE_KEY = '@water_tracker_profile';
const DAILY_STATE_KEY = '@water_tracker_daily_state';
const HISTORY_STORAGE_KEY = '@water_weekly_history';
const NOTIFICATION_SETTINGS_KEY = '@water_notification_settings';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  soundEnabled: true,
  frequency: 'every_2h',
};

/**
 * دریافت تاریخ محلی دستگاه بر اساس تقویم ساعت کاربر (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_NOTIFICATION_SETTINGS;
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings) {
  try {
    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify(settings),
    );
  } catch (error) {
    console.warn('Error saving notification settings:', error);
  }
}

export async function getWeeklyHistory(): Promise<DailyRecord[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function updateTodayInHistory(consumedMl: number, goalMl: number) {
  try {
    const today = getTodayDateString();
    const history = await getWeeklyHistory();

    const existingIndex = history.findIndex((item) => item.date === today);
    if (existingIndex >= 0) {
      history[existingIndex].consumedMl = consumedMl;
      history[existingIndex].goalMl = goalMl;
    } else {
      history.push({ date: today, consumedMl, goalMl });
    }

    // نگه‌داشتن فقط ۷ روز اخیر
    const trimmed = history.slice(-7);
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Error saving history:', error);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function getUserProfile() {
  const data = await AsyncStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * بررسی و دریافت وضعیت روزانه (ریست خودکار در صورت تغییر تاریخ)
 */
export async function getDailyWaterState(): Promise<DailyWaterState> {
  const today = getTodayDateString();
  const data = await AsyncStorage.getItem(DAILY_STATE_KEY);

  if (!data) {
    const initialState: DailyWaterState = {
      currentWaterMl: 0,
      lastUpdatedDate: today,
    };
    await AsyncStorage.setItem(DAILY_STATE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  const parsed: DailyWaterState = JSON.parse(data);

  // اگر تاریخ ذخیره‌شده با تاریخ امروز محلی همخوانی ندارد
  if (parsed.lastUpdatedDate !== today) {
    const resetState: DailyWaterState = {
      currentWaterMl: 0,
      lastUpdatedDate: today,
    };
    await AsyncStorage.setItem(DAILY_STATE_KEY, JSON.stringify(resetState));
    return resetState;
  }

  return parsed;
}

export async function saveCurrentWater(amountMl: number, goalMl?: number) {
  try {
    const today = getTodayDateString();

    let finalGoalMl: number;
    if (goalMl !== undefined) {
      finalGoalMl = goalMl;
    } else {
      const profile = await getUserProfile();
      finalGoalMl = profile?.dailyGoalMl ?? 2500;
    }

    const state: DailyWaterState = {
      currentWaterMl: amountMl,
      lastUpdatedDate: today,
    };

    await AsyncStorage.setItem(DAILY_STATE_KEY, JSON.stringify(state));
    await updateTodayInHistory(amountMl, finalGoalMl);
  } catch (error) {
    console.warn('Error saving water state:', error);
  }
}

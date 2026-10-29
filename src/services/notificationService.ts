import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings } from '../types';

// تغییر شناسه کانال برای بازنشانی و ثبت صدای سفارشی جدید در اندروید
const CHANNEL_ID = 'water-reminder-droplet-v1';
const CUSTOM_SOUND = 'water_drop.wav';

// نحوه رفتار نوتیفیکیشن در زمان باز بودن برنامه
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isMuted = notification.request.content.data?.silent === true;
    return {
      shouldShowAlert: true,
      shouldPlaySound: !isMuted,
      shouldSetBadge: false,
      shouldShowBanner: true, // نمایش بنر شناور (Heads-up)
      shouldShowList: true, // نمایش در لیست کشویی نوتیفیکیشن‌ها
      priority: Notifications.AndroidNotificationPriority.MAX,
    };
  },
});

/**
 * ایجاد کانال اختصاصی اندروید با اولویت MAX و صدای قطره آب
 */
async function setupNotificationChannel(soundEnabled: boolean) {
  if (Platform.OS === 'android') {
    const channelOptions: Notifications.NotificationChannelInput = {
      name: 'Water Intake Reminders',
      importance: Notifications.AndroidImportance.MAX,
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0284c7',
      showBadge: true,
      sound: soundEnabled ? CUSTOM_SOUND : null, // اتصال به فایل صدای سفارشی
    };

    try {
      await Notifications.setNotificationChannelAsync(
        CHANNEL_ID,
        channelOptions,
      );
    } catch (error) {
      console.warn('Error setting up notification channel:', error);
    }
  }
}

/**
 * درخواست مجوز اعلان از سیستم‌عامل
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let granted =
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

  if (!granted) {
    const request = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    granted =
      request.granted ||
      request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }

  return granted;
}

/**
 * لغو تمام اعلان‌های زمان‌بندی‌شده قبلی
 */
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * اعمال تنظیمات جدید و زمان‌بندی یادآورها در سیستم‌عامل
 */
export async function applyNotificationSettings(
  settings: NotificationSettings,
) {
  await cancelAllReminders();

  if (!settings.enabled) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await setupNotificationChannel(settings.soundEnabled);

  let intervalSeconds = 2 * 60 * 60;
  if (settings.frequency === 'once_daily') {
    intervalSeconds = 24 * 60 * 60;
  } else if (settings.frequency === 'three_daily') {
    intervalSeconds = 4 * 60 * 60;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'وقت نوشیدن آبه! 💧',
      body: 'بدنت به آب نیاز داره؛ یک لیوان آب تازه بنوش.',
      sound: settings.soundEnabled ? CUSTOM_SOUND : false, // پخش صدای قطره آب
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { silent: !settings.soundEnabled },
      color: '#0284c7',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: intervalSeconds,
      repeats: true,
      channelId: CHANNEL_ID,
    },
  });
}

export async function triggerTestBanner(
  settings: NotificationSettings,
  onShow?: (title: string, message: string, sound: boolean) => void,
) {
  if (!settings.enabled) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await setupNotificationChannel(settings.soundEnabled);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'It’s time to drink water! 💧',
      body: 'You’re not a cactus! 🌵',
      sound: settings.soundEnabled ? CUSTOM_SOUND : false, // پخش صدای قطره آب
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { silent: !settings.soundEnabled },
      color: '#0284c7',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: CHANNEL_ID,
    },
  });

  if (onShow) {
    onShow(
      'It’s time to drink water! 💧',
      'You’re not a cactus! 🌵',
      settings.soundEnabled,
    );
  }
}

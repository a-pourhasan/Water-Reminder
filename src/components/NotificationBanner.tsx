import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface BannerProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<BannerProps> = ({
  visible,
  title,
  message,
  onDismiss,
}) => {
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = () => {
    // انیمیشن خروج به سمت بالای صفحه
    translateY.value = withTiming(-120, { duration: 250 });
    opacity.value = withTiming(0, { duration: 200 });

    // اجرای onDismiss در ترد جاوااسکریپت پس از پایان انیمیشن (بدون درگیری با UI Worklet)
    setTimeout(() => {
      onDismiss();
    }, 250);
  };

  useEffect(() => {
    if (visible) {
      // سر خوردن به سمت پایین مانند بنر سیستم‌عامل
      translateY.value = withSpring(0, { damping: 14, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 150 });

      // پاک کردن تایمر قبلی
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
      }

      // بسته‌شدن خودکار بعد از ۳.۸ ثانیه
      autoCloseTimer.current = setTimeout(() => {
        handleClose();
      }, 3800);

      return () => {
        if (autoCloseTimer.current) {
          clearTimeout(autoCloseTimer.current);
        }
      };
    } else {
      translateY.value = -120;
      opacity.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable style={styles.card} onPress={handleClose}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>💧</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.appName}>WATER REMINDER</Text>
            <Text style={styles.timeText}>Now</Text>
          </View>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.bodyText}>{message}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  appName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0284c7',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  titleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  bodyText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
});

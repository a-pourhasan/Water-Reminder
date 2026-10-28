export type Gender = 'male' | 'female';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type ReminderFrequency = 'once_daily' | 'three_daily' | 'every_2h';

export interface UserProfile {
  age: number;
  gender: Gender;
  season: Season;
  dailyGoalMl: number;
}

export interface DailyWaterState {
  currentWaterMl: number;
  lastUpdatedDate: string;
}

export interface DailyRecord {
  date: string; // فرمت: YYYY-MM-DD
  consumedMl: number;
  goalMl: number;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  frequency: ReminderFrequency; // روزی یکبار، ۳ بار در روز، یا هر ۲ ساعت
}

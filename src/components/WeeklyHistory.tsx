import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { DailyRecord } from '../types';

interface WeeklyHistoryProps {
  history: DailyRecord[];
}

export const WeeklyHistory: React.FC<WeeklyHistoryProps> = ({ history }) => {
  // ساخت آرایه روزهای هفته (اگر دیتایی نبود ستون خالی با ارتفاع حداقل نشان دهد)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Last 7 Days Progress</Text>
      <View style={styles.chartContainer}>
        {history.map((record) => {
          const ratio =
            record.goalMl > 0 ? record.consumedMl / record.goalMl : 0;
          const barHeightPercentage = Math.min(Math.round(ratio * 100), 100);
          const dayName = daysOfWeek[new Date(record.date).getDay()];
          const isTargetMet = record.consumedMl >= record.goalMl;

          return (
            <View key={record.date} style={styles.col}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.max(barHeightPercentage, 4)}%`,
                      backgroundColor: isTargetMet ? '#0284c7' : '#93c5fd',
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{dayName}</Text>
              <Text style={styles.volumeLabel}>
                {(record.consumedMl / 1000).toFixed(1)}L
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    paddingHorizontal: 6,
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 75,
    backgroundColor: '#f1f5f9',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  dayLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
  },
  volumeLabel: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
});

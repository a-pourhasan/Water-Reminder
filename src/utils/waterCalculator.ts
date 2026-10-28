import { Gender, Season } from '../types';

export function calculateDailyWaterGoal(
  age: number,
  gender: Gender,
  season: Season,
): number {
  let goal = gender === 'male' ? 2600 : 2100;

  // اثر فصول بر نیاز هیدراتاسیون
  if (season === 'summer') goal += 500;
  else if (season === 'spring') goal += 200;
  else if (season === 'winter') goal -= 200;

  // سنین رشد و میانسالی
  if (age < 18) goal -= 300;
  else if (age > 55) goal -= 200;

  return Math.max(goal, 1500);
}

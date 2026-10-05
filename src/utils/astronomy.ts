/**
 * Công thức thiên văn học và khí tượng học tính toán chu kỳ Mặt Trăng và Điểm Sương
 */

export interface MoonPhaseInfo {
  phaseTitle: string;
  illumination: number; // 0 - 100 (%)
  daysToFull: number;
  phaseFraction: number;
  currentCycleDay: number;
}

/**
 * Tính toán chu kỳ Mặt Trăng thực tế từ ngày hiện tại
 */
export const calculateMoonPhase = (date: Date = new Date()): MoonPhaseInfo => {
  const newMoonRef = new Date(2000, 0, 6, 18, 14).getTime();
  const daysSinceNewMoon = (date.getTime() - newMoonRef) / (1000 * 60 * 60 * 24);
  const synodicMonth = 29.530588853;
  const currentCycleDay = ((daysSinceNewMoon % synodicMonth) + synodicMonth) % synodicMonth;
  const phaseFraction = currentCycleDay / synodicMonth;
  const illumination = Math.round(((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2) * 100);
  const daysToFull = Math.round(((synodicMonth / 2 - currentCycleDay + synodicMonth) % synodicMonth));

  let phaseTitle = 'LƯỠI LIỀM';
  if (phaseFraction < 0.05 || phaseFraction > 0.95) phaseTitle = 'TRĂNG MỚI';
  else if (phaseFraction < 0.22) phaseTitle = 'LƯỠI LIỀM ĐẦU THÁNG';
  else if (phaseFraction < 0.28) phaseTitle = 'BÁN NGUYỆT ĐẦU THÁNG';
  else if (phaseFraction < 0.47) phaseTitle = 'TRĂNG KHUYẾT';
  else if (phaseFraction < 0.53) phaseTitle = 'TRĂNG TRÒN';
  else if (phaseFraction < 0.72) phaseTitle = 'TRĂNG KHUYẾT CUỐI THÁNG';
  else if (phaseFraction < 0.78) phaseTitle = 'BÁN NGUYỆT CUỐI THÁNG';
  else phaseTitle = 'LƯỠI LIỀM CUỐI THÁNG';

  return {
    phaseTitle,
    illumination,
    daysToFull,
    phaseFraction,
    currentCycleDay,
  };
};

/**
 * Ước lượng Điểm Sương (Dew Point) theo công thức Magnus-Tetens gần đúng
 */
export const calculateDewPoint = (temp: number, humidity: number): number => {
  return Math.round(temp - (100 - humidity) / 5);
};

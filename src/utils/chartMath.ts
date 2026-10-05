import { ChartPoint, DynamicScale } from '../types';

/**
 * Tự động tính toán thang nhiệt độ linh hoạt theo thực tế với bước nhảy 3°
 */
export const calculateDynamicDegreeScale = (temps: number[]): DynamicScale => {
  if (!temps || temps.length === 0) {
    return {
      degMin: 18,
      degMax: 33,
      degRange: 15,
      gridDegrees: [33, 30, 27, 24, 21, 18],
    };
  }

  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const degMin = Math.max(0, Math.floor((minTemp - 2) / 3) * 3);
  const degMax = Math.ceil((maxTemp + 2) / 3) * 3;
  const degRange = Math.max(6, degMax - degMin);

  const gridDegrees: number[] = [];
  for (let d = degMax; d >= degMin; d -= 3) {
    gridDegrees.push(d);
  }

  return {
    degMin,
    degMax,
    degRange,
    gridDegrees,
  };
};

export interface HermiteCurveResult {
  points: ChartPoint[];
  maxPoint: ChartPoint;
  minPoint: ChartPoint;
}

/**
 * Tạo đường cong mềm mịn bằng nội suy Hermite Cosine giữa 24 mốc giờ
 */
export const calculateHermiteCurve = (
  hourlyTemps: number[],
  degMin: number,
  degMax: number,
  degRange: number,
  chartWidth: number,
  chartHeight: number,
  totalSteps: number = 48
): HermiteCurveResult => {
  const points: ChartPoint[] = [];

  for (let step = 0; step <= totalSteps; step++) {
    const hFloat = (step / totalSteps) * 23;
    const h0 = Math.floor(hFloat);
    const h1 = Math.min(23, h0 + 1);
    const t = hFloat - h0;
    const smoothT = (1 - Math.cos(t * Math.PI)) / 2;
    const tempVal = hourlyTemps[h0] * (1 - smoothT) + hourlyTemps[h1] * smoothT;
    const clamped = Math.max(degMin, Math.min(degMax, tempVal));
    const x = (step / totalSteps) * chartWidth;
    const y = ((degMax - clamped) / degRange) * chartHeight;
    points.push({ x, y });
  }

  const maxPoint = points.reduce((best, p) => (p.y < best.y ? p : best), points[0] || { x: 0, y: 0 });
  const minPoint = points.reduce((best, p) => (p.y > best.y ? p : best), points[0] || { x: 0, y: 0 });

  return {
    points,
    maxPoint,
    minPoint,
  };
};

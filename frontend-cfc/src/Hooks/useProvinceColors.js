import { useMemo } from 'react';

const PROVINCE_COLORS = {
  "Kathmandu": "#CA163A",
  "Pokhara": "#F2CA50",
  "Rupandehi": "#880696",
  "Dang": "#6C757D",
  "Birgunj": "#00A155",
  "Farwest": "#FF914C",
  "Koshi": "#EF7B97",
  "Chitwan": "#964A01",
  "LB Karnali": "#bbd704",
  "National": "#0076B4",
  "Core Team": "#01152E",
  "Unassigned": "#94a3b8" // slate-400 fallback
};

export const useProvinceColors = () => {
  const getColor = useMemo(() => (provinceName) => {
    if (!provinceName) return PROVINCE_COLORS["Unassigned"];
    
    // Exact match
    if (PROVINCE_COLORS[provinceName]) {
      return PROVINCE_COLORS[provinceName];
    }

    // Case-insensitive/partial match (e.g., 'national' vs 'National')
    const key = Object.keys(PROVINCE_COLORS).find(
      k => k.toLowerCase() === provinceName.toLowerCase()
    );
    
    return key ? PROVINCE_COLORS[key] : PROVINCE_COLORS["Unassigned"];
  }, []);

  return { PROVINCE_COLORS, getColor };
};

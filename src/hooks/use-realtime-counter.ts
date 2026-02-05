import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "vistaceo_active_users";
const GLOBAL_MIN = 17;
const GLOBAL_MAX = 673;

// Rangos por horario Argentina (America/Argentina/Buenos_Aires)
const getTimeRangeAR = (): { min: number; max: number } => {
  const now = new Date();
  const arTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const hour = arTime.getHours();

  if (hour >= 3 && hour < 7) return { min: 17, max: 90 };      // Madrugada baja
  if (hour >= 7 && hour < 10) return { min: 60, max: 220 };    // Mañana
  if (hour >= 10 && hour < 14) return { min: 180, max: 673 };  // Pico laboral
  if (hour >= 14 && hour < 17) return { min: 140, max: 420 };  // Siesta
  if (hour >= 17 && hour < 21) return { min: 170, max: 520 };  // Tarde
  return { min: 70, max: 260 };                                 // Noche (21:00-02:59)
};

const clamp = (value: number, min: number, max: number): number => 
  Math.max(min, Math.min(max, value));

const getRandomInRange = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

// Distribución con peso hacia el centro del rango
const getWeightedTarget = (min: number, max: number): number => {
  const center = (min + max) / 2;
  const spread = (max - min) / 2;
  // Box-Muller para distribución normal aproximada
  const u1 = Math.random();
  const u2 = Math.random();
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const normalized = clamp(normal * 0.3, -1, 1); // Limitar a ±1
  return Math.round(center + normalized * spread);
};

const getInitialValue = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { value, timestamp } = JSON.parse(stored);
      const elapsed = Date.now() - timestamp;
      // Si pasaron menos de 5 minutos, usar valor guardado
      if (elapsed < 5 * 60 * 1000) {
        const range = getTimeRangeAR();
        // Ajustar gradualmente si está fuera del rango
        return clamp(value, range.min, range.max);
      }
    }
  } catch {}
  
  // Valor inicial: centro del rango con leve variación
  const range = getTimeRangeAR();
  const center = (range.min + range.max) / 2;
  const variation = getRandomInRange(-15, 15);
  return clamp(Math.round(center + variation), range.min, range.max);
};

export const useRealtimeCounter = () => {
  const [count, setCount] = useState<number>(getInitialValue);
  const trendRef = useRef<number>(0); // -1: bajando, 0: estable, 1: subiendo
  const trendCountRef = useRef<number>(0);

  const updateCount = useCallback(() => {
    setCount((current) => {
      const range = getTimeRangeAR();
      const target = getWeightedTarget(range.min, range.max);
      
      // Calcular delta base con easing
      const baseDelta = (target - current) * 0.12;
      
      // Ruido pequeño (-2 a +2)
      const noise = getRandomInRange(-2, 2);
      
      // Inercia: mantener tendencia por 2-4 ticks
      let trendBonus = 0;
      if (trendCountRef.current > 0) {
        trendBonus = trendRef.current * getRandomInRange(1, 3);
        trendCountRef.current--;
      } else if (Math.random() < 0.3) {
        // 30% chance de iniciar nueva tendencia
        trendRef.current = baseDelta > 0 ? 1 : baseDelta < 0 ? -1 : 0;
        trendCountRef.current = getRandomInRange(2, 4);
      }
      
      // Delta final, limitado a ±15 para suavidad
      let delta = clamp(Math.round(baseDelta + noise + trendBonus), -15, 15);
      
      // A veces quedarse igual (micro-ruido realista)
      if (Math.random() < 0.15) {
        delta = getRandomInRange(-1, 1);
      }
      
      // Nuevo valor clamped
      const newValue = clamp(current + delta, GLOBAL_MIN, GLOBAL_MAX);
      const finalValue = clamp(newValue, range.min, range.max);
      
      // Persistir
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          value: finalValue,
          timestamp: Date.now()
        }));
      } catch {}
      
      return finalValue;
    });
  }, []);

  useEffect(() => {
    const scheduleUpdate = () => {
      const delay = getRandomInRange(18000, 45000); // 18-45 segundos
      return setTimeout(() => {
        updateCount();
        timeoutRef.current = scheduleUpdate();
      }, delay);
    };

    let timeoutRef = { current: scheduleUpdate() };

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [updateCount]);

  return count;
};

import { useState, useRef, useCallback, useEffect } from "react";

export const useAlarm = () => {
  const [alarmConfig, setAlarmConfig] = useState(null);
  const alarmConfigRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  const stopAlarm = useCallback(() => {
    setAlarmConfig(null);
    alarmConfigRef.current = null;
    if (oscillatorRef.current) {
      if (oscillatorRef.current.sirenInterval) {
        clearInterval(oscillatorRef.current.sirenInterval);
      }
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  }, []);

  const startAlarm = useCallback(
    (message, type) => {
      stopAlarm();
      setAlarmConfig({ message, type });
      alarmConfigRef.current = { message, type };

      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ctx;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.value = 0.2;

        const osc = ctx.createOscillator();
        oscillatorRef.current = osc;
        osc.connect(gainNode);

        if (type === "not_found") {
          osc.type = "square";
          let freq = 400;
          let up = true;
          const interval = setInterval(() => {
            if (!oscillatorRef.current) return clearInterval(interval);
            freq = up ? freq + 50 : freq - 50;
            if (freq >= 900) up = false;
            if (freq <= 400) up = true;
            try {
              osc.frequency.setValueAtTime(freq, ctx.currentTime);
            } catch (e) {}
          }, 30);
          osc.sirenInterval = interval;
        } else if (type === "empty_stock") {
          osc.type = "sawtooth";
          let on = true;
          const interval = setInterval(() => {
            if (!oscillatorRef.current) return clearInterval(interval);
            try {
              gainNode.gain.setValueAtTime(on ? 0.2 : 0, ctx.currentTime);
              osc.frequency.setValueAtTime(150, ctx.currentTime);
            } catch (e) {}
            on = !on;
          }, 150);
          osc.sirenInterval = interval;
        } else if (type === "empty_cart") {
          osc.type = "sine";
          let high = true;
          const interval = setInterval(() => {
            if (!oscillatorRef.current) return clearInterval(interval);
            try {
              // Suara bolak-balik tinggi-rendah cepat (Tii-Tuu-Tii-Tuu)
              osc.frequency.setValueAtTime(high ? 1000 : 600, ctx.currentTime);
            } catch (e) {}
            high = !high;
          }, 100);
          osc.sirenInterval = interval;
        }
        osc.start();
      } catch (e) {}
    },
    [stopAlarm],
  );

  return { alarmConfig, alarmConfigRef, startAlarm, stopAlarm };
};

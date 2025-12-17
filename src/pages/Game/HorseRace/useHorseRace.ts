import { useCallback, useEffect, useRef, useState } from "react";
import { initHorses, pickWinner } from "./horse.logic";
import type { Horse } from "./horse.logic";

export function useHorseRace() {
	const [horses, setHorses] = useState<Horse[]>(() => initHorses());
	const [racing, setRacing] = useState(false);
	const rafRef = useRef<number | null>(null);
	const lastTsRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	const reset = useCallback(() => {
		if (rafRef.current) cancelAnimationFrame(rafRef.current);
		lastTsRef.current = null;
		setHorses(initHorses());
		setRacing(false);
	}, []);

	const start = useCallback((): Promise<number> => {
		return new Promise((resolve) => {
			if (racing) return resolve(-1);
			setRacing(true);
			lastTsRef.current = null;

			const step = (ts: number) => {
				if (!lastTsRef.current) lastTsRef.current = ts;
				const dt = Math.min(50, ts - (lastTsRef.current || ts));
				lastTsRef.current = ts;

				setHorses((prev) => {
					const next = prev.map((h) => {
						const delta = (h.speed * dt) / 30; // tuned factor
						return { ...h, progress: Math.min(110, h.progress + delta) };
					});

					const winner = pickWinner(next);
					if (winner !== null) {
						setRacing(false);
						if (rafRef.current) cancelAnimationFrame(rafRef.current);
						resolve(winner);
					} else {
						rafRef.current = requestAnimationFrame(step);
					}

					return next;
				});
			};

			rafRef.current = requestAnimationFrame(step);
		});
	}, [racing]);

	return {
		horses,
		racing,
		start,
		reset,
	} as const;
}

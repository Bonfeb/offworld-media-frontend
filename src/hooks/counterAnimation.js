import { useState, useEffect, useRef } from "react";

export const counterAnimation = (targetValue, options = {}) => {
  const {
    duration = 2000,
    autoRestart = false,
    restartDelay = 5000,
    shouldStart = true,
    easing = "easeOut",
  } = options;

  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animationRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  const easingFunctions = {
    easeOut: (t) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    linear: (t) => t,
    easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  };

  const startAnimation = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease = easingFunctions[easing] || easingFunctions.easeOut;
      const currentCount = Math.floor(ease(progress) * targetValue);

      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
        setIsAnimating(false);

        if (autoRestart && shouldStart) {
          restartTimeoutRef.current = setTimeout(startAnimation, restartDelay);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    setIsAnimating(false);
  };

  useEffect(() => {
    if (shouldStart && !isAnimating) startAnimation();
  }, [shouldStart]);

  useEffect(() => stopAnimation, []);

  return {
    count,
    isAnimating,
    startAnimation,
    stopAnimation,
  };
};

import { useState, useEffect, useRef } from "react";

export const useScrollVisibility = (options = {}) => {
  const {
    threshold = 0.3,
    rootMargin = "0px",
    triggerOnce = false,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);

        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [threshold, rootMargin, hasBeenVisible]);

  return {
    ref: elementRef,
    isVisible,
    hasBeenVisible,
  };
};

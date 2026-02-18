import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

export const useAnimations = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();

  // Entrance animations
  const slideInFromLeft = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  };

  const slideInFromRight = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  };

  const slideInFromTop = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  };

  const slideInFromBottom = {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  };

  const scaleIn = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  };

  const bounceIn = {
    initial: { scale: 0.3, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    },
    exit: { scale: 0.3, opacity: 0 }
  };

  // Hover animations
  const hoverScale = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 }
  };

  const hoverLift = {
    whileHover: { y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
    whileTap: { y: 0 },
    transition: { duration: 0.2 }
  };

  const hoverGlow = {
    whileHover: { 
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)'
    },
    transition: { duration: 0.3 }
  };

  // Loading animations
  const pulse = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1]
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const spin = {
    animate: {
      rotate: 360
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  };

  const bounce = {
    animate: {
      y: [0, -10, 0]
    },
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  // Stagger animations for lists
  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3 }
  };

  // Complex animations
  const drawPath = {
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: {
      duration: 2,
      ease: 'easeInOut'
    }
  };

  const morphShape = {
    initial: { pathLength: 1 },
    animate: {
      d: [
        'M0,0 L100,0 L100,100 L0,100 Z',
        'M50,0 L100,50 L50,100 L0,50 Z',
        'M0,0 L100,0 L100,100 L0,100 Z'
      ]
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  // Page transitions
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  // Custom hooks for specific animations
  const useScrollAnimation = (threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      };
    }, [threshold]);

    return { ref, isVisible };
  };

  const useTypewriter = (text, speed = 50) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, speed);

        return () => clearTimeout(timeout);
      }
    }, [currentIndex, text, speed]);

    const reset = () => {
      setDisplayedText('');
      setCurrentIndex(0);
    };

    return { displayedText, reset, isComplete: currentIndex === text.length };
  };

  const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const startTimeRef = useRef(null);

    useEffect(() => {
      const animate = (currentTime) => {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
        }

        const progress = Math.min((currentTime - startTimeRef.current) / duration, 1);
        const currentCount = Math.floor(progress * end);
        
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
  };

  const useParallax = (speed = 0.5) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
      const handleScroll = () => {
        setOffset(window.scrollY * speed);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
  };

  // Animation utilities
  const springConfig = {
    type: 'spring',
    stiffness: 300,
    damping: 30
  };

  const smoothConfig = {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut'
  };

  const bounceConfig = {
    type: 'spring',
    stiffness: 400,
    damping: 10
  };

  return {
    // Animation variants
    slideInFromLeft,
    slideInFromRight,
    slideInFromTop,
    slideInFromBottom,
    fadeIn,
    scaleIn,
    bounceIn,
    hoverScale,
    hoverLift,
    hoverGlow,
    pulse,
    spin,
    bounce,
    staggerContainer,
    staggerItem,
    drawPath,
    morphShape,
    pageTransition,

    // Custom hooks
    useScrollAnimation,
    useTypewriter,
    useCountUp,
    useParallax,

    // Animation controls
    controls,
    isAnimating,
    setIsAnimating,

    // Configuration
    springConfig,
    smoothConfig,
    bounceConfig
  };
};

export default useAnimations;

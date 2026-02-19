import React, { useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

const MobileGestureHandler = ({ children }) => {
  const { state, dispatch } = useApp();
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const gestureStateRef = useRef({
    isDragging: false,
    isLongPress: false,
    swipeDirection: null,
    pinchDistance: 0
  });

  // Get touch position
  const getTouchPosition = (touch) => ({
    x: touch.clientX,
    y: touch.clientY
  });

  // Calculate distance between two points
  const getDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate swipe direction
  const getSwipeDirection = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = getTouchPosition(touch);
    touchEndRef.current = getTouchPosition(touch);
    
    gestureStateRef.current = {
      isDragging: false,
      isLongPress: false,
      swipeDirection: null,
      pinchDistance: 0
    };

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      gestureStateRef.current.isLongPress = true;
      handleLongPress(e);
    }, 500); // 500ms for long press
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const currentPos = getTouchPosition(touch);
    
    // Clear long press timer if moved
    if (longPressTimerRef.current) {
      const distance = getDistance(touchStartRef.current, currentPos);
      if (distance > 10) { // Moved more than 10px
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    // Handle pinch gesture (2 fingers)
    if (e.touches.length === 2) {
      const touch1 = getTouchPosition(e.touches[0]);
      const touch2 = getTouchPosition(e.touches[1]);
      const distance = getDistance(touch1, touch2);
      
      if (gestureStateRef.current.pinchDistance === 0) {
        gestureStateRef.current.pinchDistance = distance;
      } else {
        const scale = distance / gestureStateRef.current.pinchDistance;
        handlePinch(scale, e);
      }
    }

    // Update drag state
    gestureStateRef.current.isDragging = true;
    touchEndRef.current = currentPos;
    
    handleDrag(currentPos, e);
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current || !touchEndRef.current) return;

    const distance = getDistance(touchStartRef.current, touchEndRef.current);
    
    // Handle swipe if distance is sufficient
    if (distance > 50 && !gestureStateRef.current.isLongPress) {
      const direction = getSwipeDirection(touchStartRef.current, touchEndRef.current);
      handleSwipe(direction, e);
    }

    // Reset gesture state
    gestureStateRef.current = {
      isDragging: false,
      isLongPress: false,
      swipeDirection: null,
      pinchDistance: 0
    };

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, []);

  // Handle swipe gestures
  const handleSwipe = useCallback((direction, e) => {
    const target = e.target.closest('[data-gesture-aware]');
    if (!target) return;

    // Dispatch custom event for swipe
    const swipeEvent = new CustomEvent('swipe', {
      detail: { direction, target, originalEvent: e }
    });
    target.dispatchEvent(swipeEvent);

    // Handle specific swipe actions
    switch (direction) {
      case 'left':
        // Navigate to next window/app
        if (target.dataset.swipeLeft) {
          const action = target.dataset.swipeLeft;
          if (action === 'next-window') {
            // Switch to next window
            const openApps = state.openApps;
            if (openApps.length > 1) {
              const currentIndex = openApps.findIndex(app => app.id === state.activeApp);
              const nextIndex = (currentIndex + 1) % openApps.length;
              dispatch({ type: 'SET_ACTIVE_APP', payload: openApps[nextIndex].id });
            }
          }
        }
        break;

      case 'right':
        // Navigate to previous window/app
        if (target.dataset.swipeRight) {
          const action = target.dataset.swipeRight;
          if (action === 'prev-window') {
            // Switch to previous window
            const openApps = state.openApps;
            if (openApps.length > 1) {
              const currentIndex = openApps.findIndex(app => app.id === state.activeApp);
              const prevIndex = currentIndex === 0 ? openApps.length - 1 : currentIndex - 1;
              dispatch({ type: 'SET_ACTIVE_APP', payload: openApps[prevIndex].id });
            }
          }
        }
        break;

      case 'up':
        // Minimize current window
        if (target.dataset.swipeUp && target.dataset.swipeUp === 'minimize') {
          if (state.activeApp) {
            dispatch({ type: 'MINIMIZE_APP', payload: { appId: state.activeApp } });
          }
        }
        break;

      case 'down':
        // Close current window
        if (target.dataset.swipeDown && target.dataset.swipeDown === 'close') {
          if (state.activeApp) {
            dispatch({ type: 'CLOSE_APP', payload: state.activeApp });
          }
        }
        break;
    }
  }, [state.activeApp, state.openApps, dispatch]);

  // Handle drag gestures
  const handleDrag = useCallback((position, e) => {
    const target = e.target.closest('[data-gesture-aware]');
    if (!target) return;

    // Dispatch custom event for drag
    const dragEvent = new CustomEvent('drag', {
      detail: { position, target, originalEvent: e }
    });
    target.dispatchEvent(dragEvent);
  }, []);

  // Handle long press
  const handleLongPress = useCallback((e) => {
    const target = e.target.closest('[data-gesture-aware]');
    if (!target) return;

    // Dispatch custom event for long press
    const longPressEvent = new CustomEvent('longpress', {
      detail: { target, originalEvent: e }
    });
    target.dispatchEvent(longPressEvent);

    // Handle specific long press actions
    if (target.dataset.longPress) {
      const action = target.dataset.longPress;
      
      switch (action) {
        case 'context-menu':
          // Show context menu
          window.dispatchEvent(new CustomEvent('show-context-menu', {
            detail: { x: touchStartRef.current.x, y: touchStartRef.current.y, target }
          }));
          break;

        case 'open-settings':
          // Open settings
          dispatch({ type: 'OPEN_APP', payload: { id: 'settings', name: 'Settings' } });
          break;

        case 'create-shortcut':
          // Create shortcut
          window.dispatchEvent(new CustomEvent('create-shortcut', {
            detail: { target }
          }));
          break;
      }
    }
  }, [dispatch]);

  // Handle pinch gestures
  const handlePinch = useCallback((scale, e) => {
    const target = e.target.closest('[data-gesture-aware]');
    if (!target) return;

    // Dispatch custom event for pinch
    const pinchEvent = new CustomEvent('pinch', {
      detail: { scale, target, originalEvent: e }
    });
    target.dispatchEvent(pinchEvent);

    // Handle zoom in/out
    if (scale > 1.1) {
      // Zoom in
      document.body.style.zoom = `${Math.min(2, parseFloat(document.body.style.zoom || 1) + 0.1)}`;
    } else if (scale < 0.9) {
      // Zoom out
      document.body.style.zoom = `${Math.max(0.5, parseFloat(document.body.style.zoom || 1) - 0.1)}`;
    }
  }, []);

  // Add event listeners
  useEffect(() => {
    const element = document.body;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      
      // Clear any pending timers
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return children;
};

export default MobileGestureHandler;

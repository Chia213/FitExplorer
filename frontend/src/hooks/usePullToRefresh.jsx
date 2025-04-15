import { useState, useEffect, useCallback } from 'react';

/**
 * A hook that adds pull-to-refresh functionality to a component
 * @param {Function} onRefresh - Function to call when refresh is triggered
 * @param {Object} options - Configuration options
 * @param {string} options.pullDownThreshold - Threshold in px to trigger refresh (default: 80)
 * @param {string} options.containerSelector - CSS selector for the container (default: undefined)
 * @returns {Object} - Object containing pullToRefreshProps and refreshing state
 */
const usePullToRefresh = (onRefresh, options = {}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const pullDownThreshold = options.pullDownThreshold || 80;
  const containerSelector = options.containerSelector;
  
  // Function to reset pull state
  const resetPull = useCallback(() => {
    setPullDistance(0);
    setTouchStart(0);
  }, []);
  
  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    // Only activate if at the top of the container
    const target = containerSelector 
      ? document.querySelector(containerSelector) 
      : document.documentElement;
    
    if (!target) return;
    
    const scrollTop = target.scrollTop;
    
    // Only allow pull to refresh when at the top of the content
    if (scrollTop <= 0) {
      setTouchStart(e.touches[0].clientY);
    } else {
      setTouchStart(0);
    }
  }, [containerSelector]);
  
  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (touchStart === 0 || refreshing) return;
    
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStart;
    
    // Only handle downward pull
    if (distance > 0) {
      // Use a damping effect - pull distance reduces as it increases
      const dampedDistance = Math.round(Math.min(distance * 0.5, pullDownThreshold * 1.5));
      setPullDistance(dampedDistance);
      
      // If we're on iOS, prevent default to avoid Safari's elastic scroll effect
      if (distance > 10 && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
        e.preventDefault();
      }
    }
  }, [touchStart, refreshing, pullDownThreshold]);
  
  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > pullDownThreshold && !refreshing) {
      setRefreshing(true);
      
      // Vibrate if device supports it
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setRefreshing(false);
        resetPull();
      }
    } else {
      resetPull();
    }
  }, [pullDistance, pullDownThreshold, refreshing, onRefresh, resetPull]);
  
  // Listen for touch events on the document
  useEffect(() => {
    // Only add touch handlers on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  const pullToRefreshStyles = {
    container: {
      position: 'relative',
      overflow: 'hidden',
    },
    indicator: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: `${pullDistance}px`,
      pointerEvents: 'none',
      zIndex: 9999,
      transition: refreshing ? 'none' : 'height 0.2s ease',
    },
    spinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      color: '#3b82f6',
      fontSize: '20px',
      transform: `rotate(${(pullDistance / pullDownThreshold) * 360}deg)`,
      transition: refreshing ? 'transform 1s linear infinite' : 'transform 0.2s ease',
    },
    content: {
      transform: `translateY(${refreshing ? pullDownThreshold : pullDistance}px)`,
      transition: refreshing ? 'none' : 'transform 0.2s ease',
    },
  };
  
  const PullToRefreshIndicator = () => {
    if (pullDistance === 0 && !refreshing) return null;
    
    return (
      <div style={pullToRefreshStyles.indicator}>
        <div style={pullToRefreshStyles.spinner}>
          {refreshing ? '↻' : '↓'}
        </div>
      </div>
    );
  };
  
  return {
    refreshing,
    pullDistance,
    PullToRefreshIndicator,
    pullToRefreshProps: {
      style: pullToRefreshStyles.container,
      contentStyle: pullToRefreshStyles.content,
    },
  };
};

export default usePullToRefresh; 
'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CustomScrollbar.module.css';

export function CustomScrollbar() {
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(40);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);

  useEffect(() => {
    const updateScrollbar = () => {
      const thumb = thumbRef.current;
      const track = trackRef.current;
      if (!thumb || !track) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const trackHeight = track.clientHeight;

      // Thumb height proportional to visible content ratio
      const ratio = clientHeight / scrollHeight;
      const newThumbHeight = Math.max(40, ratio * trackHeight);
      setThumbHeight(newThumbHeight);

      // Thumb position
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);
      const maxTop = trackHeight - newThumbHeight;
      thumb.style.transform = `translateY(${scrollRatio * maxTop}px)`;
    };

    window.addEventListener('scroll', updateScrollbar, { passive: true });
    window.addEventListener('resize', updateScrollbar);
    updateScrollbar();

    return () => {
      window.removeEventListener('scroll', updateScrollbar);
      window.removeEventListener('resize', updateScrollbar);
    };
  }, []);

  // Drag support
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartScroll.current = window.scrollY;
    document.body.style.userSelect = 'none';

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const track = trackRef.current;
      if (!track) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const trackHeight = track.clientHeight;
      const deltaY = e.clientY - dragStartY.current;
      const scrollDelta = (deltaY / (trackHeight - thumbHeight)) * (scrollHeight - clientHeight);
      window.scrollTo(0, dragStartScroll.current + scrollDelta);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Click on track to jump
  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === thumbRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const ratio = clickY / track.clientHeight;
    window.scrollTo({ top: ratio * (scrollHeight - clientHeight), behavior: 'smooth' });
  };

  return (
    <div className={styles.track} ref={trackRef} onClick={onTrackClick}>
      <div
        ref={thumbRef}
        className={styles.thumb}
        style={{ height: `${thumbHeight}px` }}
        onMouseDown={onMouseDown}
      >
        <div className={styles.thumbInner} />
      </div>
    </div>
  );
}

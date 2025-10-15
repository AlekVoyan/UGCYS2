import React, { useEffect, useState, useContext } from 'react';
import { motion, Variants } from 'framer-motion';
import { CursorContext } from '../context/CursorContext';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const cursorContext = useContext(CursorContext);
  const isHovering = cursorContext?.isHovering || false;

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updatePosition);

    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  const cursorVariants: Variants = {
    default: {
      x: position.x - 8,
      y: position.y - 8,
      width: 16,
      height: 16,
      backgroundColor: '#E60023',
      mixBlendMode: 'normal',
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    },
    hover: {
      x: position.x - 32,
      y: position.y - 32,
      width: 64,
      height: 64,
      backgroundColor: '#FFFFFF',
      mixBlendMode: 'difference',
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    },
  };

  return (
    <motion.div
      className="custom-cursor"
      variants={cursorVariants}
      animate={isHovering ? 'hover' : 'default'}
    />
  );
};
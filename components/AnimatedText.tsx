import React from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  // FIX: Changed type from 'keyof JSX.IntrinsicElements' to 'React.ElementType' to correctly type a dynamic component/tag prop.
  el?: React.ElementType;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 * i },
  }),
};

const childVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, el: Wrapper = 'h1', className }) => {
  const words = text.split(' ');

  return (
    <Wrapper className={className}>
      <motion.span
        style={{ display: 'inline-block' }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            style={{ display: 'inline-block', marginRight: '0.25em', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            <motion.span style={{display: 'inline-block'}} variants={childVariants}>{word}</motion.span>
          </motion.span>
        ))}
      </motion.span>
    </Wrapper>
  );
};

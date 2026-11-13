// הגדרת אנימציות לכל האתר: אם המשתמש ביקש להפחית תנועה (בהגדרות המכשיר),
// כל אנימציה מסתיימת מיד, כולל הופעה הדרגתית. אחרת האנימציות רגילות.
import { ReactNode } from 'react';
import { MotionConfig, useReducedMotion } from 'motion/react';

export default function MotionSettings({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user" transition={reduced ? { duration: 0 } : undefined}>
      {children}
    </MotionConfig>
  );
}

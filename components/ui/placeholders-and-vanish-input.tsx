'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PixelData {
  x: number;
  y: number;
  r: number;
  color: string;
}

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [value, setValue] = useState('');
  const [animating, setAnimating] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<PixelData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const startAnimation = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  }, [placeholders.length]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== 'visible' && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === 'visible') {
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    startAnimation();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange, startAnimation]);

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue('font-size'));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = '#FFF';
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: PixelData[] = [];

    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n;
        if (pixelData[e] !== 0 && pixelData[e + 1] !== 0 && pixelData[e + 2] !== 0) {
          newData.push({
            x: n,
            y: t,
            r: 1,
            color: `rgba(${pixelData[e]}, ${pixelData[e + 1]}, ${pixelData[e + 2]}, ${pixelData[e + 3]})`,
          });
        }
      }
    }

    newDataRef.current = newData;
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start: number) => {
    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 800; // Animation duration in ms

    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const pos = start * (1 - progress);

      const newArr: PixelData[] = [];
      for (const current of newDataRef.current) {
        if (current.x < pos) {
          newArr.push(current);
        } else {
          if (current.r <= 0) continue;

          const randomX = Math.random() * 2 - 1;
          const randomY = Math.random() * 2 - 1;

          newArr.push({
            x: current.x + randomX * progress * 2,
            y: current.y + randomY * progress * 2,
            r: Math.max(0, current.r - progress * 0.1),
            color: current.color,
          });
        }
      }

      newDataRef.current = newArr;
      const ctx = canvasRef.current?.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, 800, 800);
        newDataRef.current.forEach((pixel) => {
          const { x, y, r, color } = pixel;
          if (x > pos) {
            ctx.beginPath();
            ctx.rect(x, y, r, r);
            ctx.fillStyle = color;
            ctx.fill();
          }
        });
      }

      if (progress < 1 && newDataRef.current.length > 0) {
        animationFrameId = requestAnimationFrame(animateFrame);
      } else {
        setValue('');
        setAnimating(false);
      }
    };

    animationFrameId = requestAnimationFrame(animateFrame);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !animating) {
      vanishAndSubmit();
    }
  };

  const vanishAndSubmit = () => {
    setAnimating(true);
    draw();

    const value = inputRef.current?.value || '';
    if (value && inputRef.current) {
      const maxX = newDataRef.current.reduce((prev, current) => (current.x > prev ? current.x : prev), 0);
      animate(maxX);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vanishAndSubmit();
    onSubmit?.(e);
  };
  return (
    <form className={cn('w-full h-14 relative rounded-full overflow-hidden transition duration-200', value && 'bg-transparent')} onSubmit={handleSubmit}>
      <canvas
        className={cn(
          'absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20',
          !animating ? 'opacity-0' : 'opacity-100'
        )}
        ref={canvasRef}
      />
      <input
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange?.(e);
          }
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={value}
        type='text'
        className={cn(
          'w-full h-full relative text-sm sm:text-base z-50 border-none bg-transparent text-foreground rounded-full focus:outline-none focus:ring-0 pl-6 sm:pl-10 pr-20',
          animating && 'text-transparent'
        )}
      />

      <button
        disabled={!value}
        type='submit'
        className='absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full disabled:bg-muted/50 bg-primary dark:disabled:bg-muted/20 transition duration-200 flex items-center justify-center'
      >
        <motion.svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-muted-foreground h-4 w-4'
        >
          <path stroke='none' d='M0 0h24v24H0z' fill='none' />
          <motion.path
            d='M5 12l14 0'
            initial={{
              strokeDasharray: '50%',
              strokeDashoffset: '50%',
            }}
            animate={{
              strokeDashoffset: value ? 0 : '50%',
            }}
            transition={{
              duration: 0.3,
              ease: 'linear',
            }}
          />
          <path d='M13 18l6 -6' />
          <path d='M13 6l6 6' />
        </motion.svg>
      </button>

      <div className='absolute inset-0 flex items-center rounded-full pointer-events-none'>
        <AnimatePresence mode='wait'>
          {!value && (
            <motion.p
              initial={{
                y: 5,
                opacity: 0,
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -15,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: 'linear',
              }}
              className='dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-4 sm:pl-12 text-left w-[calc(100%-2rem)] truncate'
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

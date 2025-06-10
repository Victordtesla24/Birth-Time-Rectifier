import React, { useEffect, useRef } from 'react';
import { P5Instance } from 'p5';
import { AnimationManager } from '@/services/animationManager';
import { logger } from '@/services/logger';

interface AnimationProps {
    width: number;
    height: number;
    frames: any[];
    loop?: boolean;
    autoplay?: boolean;
    onComplete?: () => void;
}

export const Animation: React.FC<AnimationProps> = ({
    width,
    height,
    frames,
    loop = true,
    autoplay = true,
    onComplete
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const animationManagerRef = useRef<AnimationManager | null>(null);
    const animationIdRef = useRef<string | null>(null);

    useEffect(() => {
        let p5Instance: P5Instance | null = null;

        const setupCanvas = async () => {
            try {
                if (!canvasRef.current) return;

                const p5 = (await import('p5')).default;
                p5Instance = new p5((p: P5Instance) => {
                    p.setup = () => {
                        p.createCanvas(width, height);
                        p.background(0, 0);
                    };

                    p.draw = () => {
                        if (!animationManagerRef.current) return;
                        animationManagerRef.current.update(p.millis());
                    };
                }, canvasRef.current);

                animationManagerRef.current = new AnimationManager(p5Instance);
                
                const animationId = animationManagerRef.current.addAnimation({
                    frames,
                    loop,
                    onComplete
                });

                animationIdRef.current = animationId;

                if (autoplay) {
                    animationManagerRef.current.play(animationId);
                }
            } catch (error) {
                logger.error('animation', 'Failed to setup canvas', error as Error);
            }
        };

        setupCanvas();

        return () => {
            try {
                if (animationManagerRef.current && animationIdRef.current) {
                    animationManagerRef.current.removeAnimation(animationIdRef.current);
                    animationManagerRef.current.cleanup();
                }
                if (p5Instance) {
                    p5Instance.remove();
                }
            } catch (error) {
                logger.error('animation', 'Failed to cleanup animation', error as Error);
            }
        };
    }, [width, height, frames, loop, autoplay, onComplete]);

    const handlePlay = () => {
        try {
            if (animationManagerRef.current && animationIdRef.current) {
                animationManagerRef.current.play(animationIdRef.current);
            }
        } catch (error) {
            logger.error('animation', 'Failed to play animation', error as Error);
        }
    };

    const handlePause = () => {
        try {
            if (animationManagerRef.current && animationIdRef.current) {
                animationManagerRef.current.pause(animationIdRef.current);
            }
        } catch (error) {
            logger.error('animation', 'Failed to pause animation', error as Error);
        }
    };

    const handleResume = () => {
        try {
            if (animationManagerRef.current && animationIdRef.current) {
                animationManagerRef.current.resume(animationIdRef.current);
            }
        } catch (error) {
            logger.error('animation', 'Failed to resume animation', error as Error);
        }
    };

    return (
        <div 
            ref={canvasRef}
            style={{ 
                width, 
                height,
                position: 'relative'
            }}
        >
            <div 
                style={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '10px'
                }}
            >
                <button onClick={handlePlay}>Play</button>
                <button onClick={handlePause}>Pause</button>
                <button onClick={handleResume}>Resume</button>
            </div>
        </div>
    );
}; 
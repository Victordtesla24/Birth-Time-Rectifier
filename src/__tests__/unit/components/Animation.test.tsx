import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Animation } from '@/components/Animation';
import { gsap, animationManager } from '@tests/mocks/animation';

// Mock GSAP
jest.mock('gsap', () => gsap);

// Mock animation manager
jest.mock('@/services/animationManager', () => ({
    AnimationManager: jest.fn().mockImplementation(() => animationManager)
}));

describe('Animation Component', () => {
  const mockProps = {
    frames: [1, 2, 3],
    autoplay: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Animation {...mockProps} />);
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
  });

  it('initializes animation manager with correct props', () => {
    render(<Animation {...mockProps} />);
    expect(AnimationManager).toHaveBeenCalled();
  });

  it('handles play button click', () => {
    render(<Animation {...mockProps} />);
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    expect(mockAnimationManager.play).toHaveBeenCalled();
  });

  it('handles pause button click', () => {
    render(<Animation {...mockProps} />);
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);
    expect(mockAnimationManager.pause).toHaveBeenCalled();
  });

  it('handles resume button click', () => {
    render(<Animation {...mockProps} />);
    const resumeButton = screen.getByRole('button', { name: /resume/i });
    fireEvent.click(resumeButton);
    expect(mockAnimationManager.resume).toHaveBeenCalled();
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(<Animation {...mockProps} />);
    unmount();
    expect(mockAnimationManager.cleanup).toHaveBeenCalled();
  });

  it('starts animation automatically when autoplay is true', () => {
    render(<Animation {...mockProps} autoplay={true} />);
    expect(mockAnimationManager.play).toHaveBeenCalled();
  });

  it('does not start animation automatically when autoplay is false', () => {
    render(<Animation {...mockProps} />);
    expect(mockAnimationManager.play).not.toHaveBeenCalled();
  });

  it('updates animation when frames prop changes', () => {
    const { rerender } = render(<Animation {...mockProps} />);
    const newFrames = [4, 5, 6];
    rerender(<Animation {...mockProps} frames={newFrames} />);
    expect(mockAnimationManager.removeAnimation).toHaveBeenCalled();
    expect(mockAnimationManager.addAnimation).toHaveBeenCalledWith(
      expect.objectContaining({ frames: newFrames })
    );
  });
}); 
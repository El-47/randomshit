// GSAP animation utilities for the Research Literature Agent

import gsap from 'gsap';

// Activate timeline node with scale and opacity animation
export const animateNodeActivation = (element: HTMLElement | null, delay: number = 0) => {
  if (!element) return;

  gsap.fromTo(
    element,
    { scale: 0.8, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      delay,
      ease: 'back.out',
    },
  );
};

// Expand node to show working component
export const animateNodeExpand = (
  element: HTMLElement | null,
  delay: number = 0,
) => {
  if (!element) return;

  gsap.fromTo(
    element,
    { maxHeight: '60px', opacity: 0 },
    {
      maxHeight: '400px',
      opacity: 1,
      duration: 0.8,
      delay,
      ease: 'power2.out',
    },
  );
};

// Slide in cards with stagger
export const animateCardSlideIn = (
  elements: HTMLElement[] | NodeListOf<Element>,
  duration: number = 0.5,
  staggerDelay: number = 0.1,
) => {
  gsap.fromTo(
    elements,
    { x: 100, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration,
      stagger: staggerDelay,
      ease: 'power2.out',
    },
  );
};

// Fade in elements
export const animateFadeIn = (
  element: HTMLElement | null,
  duration: number = 0.5,
  delay: number = 0,
) => {
  if (!element) return;

  gsap.fromTo(
    element,
    { opacity: 0 },
    {
      opacity: 1,
      duration,
      delay,
      ease: 'power2.out',
    },
  );
};

// Counter animation from 0 to target
export const animateCounter = (
  element: HTMLElement | null,
  target: number,
  duration: number = 1,
  delay: number = 0,
  suffix: string = '',
) => {
  if (!element) return;

  const obj = { value: 0 };

  gsap.to(obj, {
    value: target,
    duration,
    delay,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.floor(obj.value) + suffix;
    },
  });
};

// Timeline collapse animation (center to left sidebar)
export const animateTimelineCollapse = (
  timelineElement: HTMLElement | null,
  duration: number = 0.8,
) => {
  if (!timelineElement) return;

  const timeline = gsap.timeline();

  timeline.to(timelineElement, {
    x: -200,
    scale: 0.6,
    duration,
    ease: 'power2.inOut',
  });

  return timeline;
};

// Pulse animation (for loading states)
export const animatePulse = (element: HTMLElement | null, duration: number = 2) => {
  if (!element) return;

  gsap.to(element, {
    opacity: 0.6,
    duration: duration / 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};

// Rotate animation (spinner effect)
export const animateRotate = (element: HTMLElement | null, duration: number = 2) => {
  if (!element) return;

  gsap.to(element, {
    rotation: 360,
    duration,
    repeat: -1,
    ease: 'none',
  });
};

// Bounce animation for elements
export const animateBounce = (element: HTMLElement | null, delay: number = 0) => {
  if (!element) return;

  gsap.fromTo(
    element,
    { y: 0, opacity: 0 },
    {
      y: -20,
      opacity: 1,
      duration: 0.6,
      delay,
      ease: 'back.out',
    },
  );
};

// Stagger animation for grid items
export const animateGridStagger = (
  container: HTMLElement | null,
  itemSelector: string,
  duration: number = 0.5,
) => {
  if (!container) return;

  const items = container.querySelectorAll(itemSelector);

  gsap.fromTo(
    items,
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration,
      stagger: 0.08,
      ease: 'power2.out',
    },
  );
};

// Float animation (subtle continuous motion)
export const animateFloat = (element: HTMLElement | null, distance: number = 10) => {
  if (!element) return;

  gsap.to(element, {
    y: distance,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};

// Typewriter effect (reveal text character by character)
export const animateTypewriter = (
  element: HTMLElement | null,
  text: string,
  duration: number = 2,
  delay: number = 0,
) => {
  if (!element) return;

  const charCount = text.length;
  const obj = { index: 0 };

  gsap.to(obj, {
    index: charCount,
    duration,
    delay,
    ease: 'none',
    onUpdate: () => {
      element.textContent = text.substring(0, Math.floor(obj.index));
    },
  });
};

// Kill all animations on an element
export const killAnimations = (element: HTMLElement | null) => {
  if (!element) return;
  gsap.killTweensOf(element);
};

// Kill all GSAP animations globally
export const killAllAnimations = () => {
  gsap.killAll();
};

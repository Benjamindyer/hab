import { classifyGesture, type Gesture } from "../state/gesture";

export interface GestureHandlers {
  onTap(): void;
  onSwipeLeft(): void;
  onSwipeRight(): void;
}

/** Controls such as buttons and the volume knob keep their own touches. */
const OWN_TOUCH = "button, .knob, a, input, select";

/** Turns taps and sideways swipes on an element into calls. Touches that start on a control are left alone. */
export function attachGestures(element: HTMLElement, handlers: GestureHandlers): void {
  let start: { x: number; y: number; at: number } | null = null;
  const act: Record<Exclude<Gesture, null>, () => void> = {
    tap: handlers.onTap,
    "swipe-left": handlers.onSwipeLeft,
    "swipe-right": handlers.onSwipeRight,
  };

  element.addEventListener("pointerdown", (event) => {
    start = (event.target as Element).closest(OWN_TOUCH) ? null : { x: event.clientX, y: event.clientY, at: Date.now() };
  });
  element.addEventListener("pointerup", (event) => {
    if (!start) return;
    const gesture = classifyGesture(event.clientX - start.x, event.clientY - start.y, Date.now() - start.at);
    start = null;
    if (gesture) act[gesture]();
  });
  element.addEventListener("pointercancel", () => { start = null; });
}

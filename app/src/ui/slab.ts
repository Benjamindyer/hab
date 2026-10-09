import type { VoiceState } from "../state/scene";
import { dancePose } from "./dance";

export interface Slab {
  element: HTMLElement;
  setVoice(state: VoiceState): void;
  /** A name to dance to while music plays, or null for no dancing. */
  setMusic(seed: string | null): void;
}

const BARS = 4;
const calm = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Pose {
  height: number;
  lift: number;
  tilt: number;
}

function voicePose(state: VoiceState, seconds: number, index: number): Pose {
  switch (state) {
    case "listening":
      return { height: 0.35 + 0.65 * Math.abs(Math.sin(seconds * 3.1 + index * 1.7) * Math.sin(seconds * 1.3 + index * 0.9)), lift: 0, tilt: 0 };
    case "responding":
      return { height: 0.7 + 0.3 * Math.abs(Math.sin(seconds * 5.2 + index * 0.8) * Math.sin(seconds * 2.1 + index)), lift: 0, tilt: 0 };
    case "processing":
      return { height: 1, lift: Math.floor(seconds * 2.4) % BARS === index ? -9 : 0, tilt: 0 };
    default:
      return { height: 0.96 + 0.04 * Math.sin(seconds * 0.7 + index), lift: 0, tilt: 0 };
  }
}

/** The slab: four bars that show what the assistant is doing. Voice wins, then music, then rest. */
export function createSlab(): Slab {
  const element = document.createElement("div");
  element.id = "slab";
  const bars = Array.from({ length: BARS }, () => element.appendChild(document.createElement("i")));
  let state: VoiceState = "idle";
  let seed: string | null = null;

  const frame = (now: number): void => {
    const seconds = now / 1000;
    bars.forEach((bar, index) => {
      const dancing = state === "idle" && seed !== null && !calm;
      const pose = dancing && seed !== null ? dancePose(seed, seconds, index) : voicePose(state, seconds, index);
      bar.style.height = `${pose.height * 100}%`;
      bar.style.transform = `translateY(${pose.lift}%) rotate(${pose.tilt}deg)`;
    });
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return {
    element,
    setVoice: (next) => { state = next; },
    setMusic: (next) => { seed = next; },
  };
}

import type { DayPoint, HourPoint } from "../state/forecast";
import { el, renderWhenChanged } from "./dom";
import { attachGestures } from "./gestures";
import { dayDetail } from "./weatherDay";

export interface DayOverlay {
  element: HTMLElement;
  /** Opens the overlay on a day. */
  open(index: number): void;
  /** Keeps the open day up to date with the latest forecast. */
  update(days: DayPoint[], hourly: HourPoint[], now: Date): void;
}

/** A full-screen view of one day. A touch closes it, and a swipe moves to the day before or after. */
export function createDayOverlay(): DayOverlay {
  const element = el("div", "d-overlay");
  const body = el("div", "d-body");
  element.append(body);
  let selected: number | null = null;
  let days: DayPoint[] = [];

  const show = (index: number | null): void => {
    selected = index;
    element.classList.toggle("open", index !== null);
  };
  const move = (step: number): void => {
    if (selected === null) return;
    const next = selected + step;
    if (next >= 0 && next < days.length) show(next);
  };
  attachGestures(element, { onTap: () => show(null), onSwipeLeft: () => move(1), onSwipeRight: () => move(-1) });

  return {
    element,
    open: show,
    update(latest, hourly, now) {
      days = latest;
      const day = selected === null ? undefined : days[selected];
      if (!day) return void (selected !== null && show(null));
      const key = `${selected}|${day.at.getTime()}|${day.high}|${hourly.map((h) => `${h.at.getTime()}${h.temp}${h.rain}`).join(",")}|${now.getDate()}`;
      renderWhenChanged(body, key, () => dayDetail(day, hourly, now, { days, onJump: show }));
    },
  };
}

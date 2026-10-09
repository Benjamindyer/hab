import { el } from "./dom";

export interface PagerPage {
  id: string;
  label: string;
  element: HTMLElement;
}

export interface Pager {
  /** The swipeable area. */
  element: HTMLElement;
  /** A row of page names that follows the swipe and can be tapped. */
  tabs: HTMLElement;
  goTo(id: string, smooth?: boolean): void;
}

/** Which page is showing, from how far the track has scrolled. */
export function pageIndex(scrollLeft: number, width: number, count: number): number {
  if (width <= 0 || count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(scrollLeft / width)));
}

/** Pages side by side that you swipe between. The browser does the snapping, so it feels native. */
export function createPager(pages: PagerPage[]): Pager {
  const element = el("div", "pager");
  const track = element.appendChild(el("div", "pager-track"));
  const tabs = el("div", "pager-tabs");
  const buttons = pages.map((page) => {
    track.append(page.element);
    page.element.classList.add("page");
    const button = el("button", "pager-tab", page.label);
    button.addEventListener("click", () => goTo(page.id, true));
    tabs.append(button);
    return button;
  });

  const markActive = (index: number): void => buttons.forEach((b, i) => b.classList.toggle("on", i === index));

  function goTo(id: string, smooth = false): void {
    const index = pages.findIndex((page) => page.id === id);
    if (index < 0) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: smooth ? "smooth" : "auto" });
    markActive(index);
  }

  track.addEventListener("scroll", () => markActive(pageIndex(track.scrollLeft, track.clientWidth, pages.length)), { passive: true });
  return { element, tabs, goTo };
}

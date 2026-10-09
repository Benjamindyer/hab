import type { Option } from "../../state/options";
import { el } from "../dom";

/** A labelled row. The hint, if any, explains the choice in plain words. */
export function row(label: string, control: HTMLElement, hint?: string): HTMLElement {
  const wrapper = el("label", "field");
  wrapper.append(el("span", "field-label", label), control);
  if (hint) wrapper.append(el("span", "field-hint", hint));
  return wrapper;
}

export function textInput(value: string, onChange: (value: string) => void, placeholder = ""): HTMLInputElement {
  const input = el("input", "input");
  input.value = value;
  input.placeholder = placeholder;
  input.addEventListener("input", () => onChange(input.value));
  return input;
}

/** A drop-down with "Not set" first, so a choice can always be undone. */
export function selectInput(options: Option[], value: string, onChange: (value: string) => void): HTMLSelectElement {
  const select = el("select", "input");
  const all = [{ value: "", label: "Not set" }, ...options];
  if (value && !all.some((o) => o.value === value)) all.push({ value, label: `${value} (not found)` });
  for (const option of all) {
    const item = el("option", "", option.label);
    item.value = option.value;
    select.append(item);
  }
  select.value = value;
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

/** A slider from 0 to 100 with its number beside it. */
export function dialInput(value: number, onChange: (value: number) => void): HTMLElement {
  const box = el("div", "dial");
  const slider = el("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = String(value);
  const readout = el("span", "dial-value mono", String(value));
  slider.addEventListener("input", () => {
    readout.textContent = slider.value;
    onChange(Number(slider.value));
  });
  box.append(slider, readout);
  return box;
}

export function section(title: string, note?: string): HTMLElement {
  const box = el("div", "section");
  box.append(el("div", "section-title", title));
  if (note) box.append(el("div", "section-note", note));
  return box;
}

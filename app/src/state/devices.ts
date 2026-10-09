export type DeviceKind = "speaker" | "tv" | "echo" | "group" | "computer" | "phone";

export interface DeviceInfo {
  label: string;
  kind: DeviceKind;
}

const KIND_WORDS: Record<DeviceKind, string> = {
  speaker: "Speaker",
  tv: "TV",
  echo: "Echo",
  group: "All speakers",
  computer: "Computer",
  phone: "Phone",
};

/** Guesses what a Spotify device is from its name. Home Assistant only gives us the name. */
export function describeDevice(name: string): DeviceInfo {
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  if (/^everywhere$|^all\b/i.test(name)) return { label, kind: "group" };
  if (/\btv\b|fire\s?tv|cube/i.test(name)) return { label, kind: "tv" };
  if (/\becho\b|\bdot\b/i.test(name)) return { label, kind: "echo" };
  if (/macbook|\bmac\b|laptop|\bpc\b|windows|desktop/i.test(name)) return { label, kind: "computer" };
  if (/iphone|ipad|android|pixel|galaxy|phone/i.test(name)) return { label, kind: "phone" };
  return { label, kind: "speaker" };
}

export const kindWord = (kind: DeviceKind): string => KIND_WORDS[kind];

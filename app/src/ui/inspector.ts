import type { Entity, EntityStore } from "../state/entities";

function matches(entity: Entity, query: string): boolean {
  const name = String(entity.attributes["friendly_name"] ?? "");
  return `${entity.id} ${name}`.toLowerCase().includes(query);
}

function row(entity: Entity): string {
  const name = String(entity.attributes["friendly_name"] ?? "");
  return `<tr><td>${entity.id}</td><td>${name}</td><td>${entity.state}</td></tr>`;
}

/** A plain developer view: search every entity Home Assistant has, with its live state. */
export function mountInspector(root: HTMLElement, store: EntityStore): void {
  root.innerHTML = `<input id="q" placeholder="Search entities (try: solix, kitchen, timer)" autofocus />
    <p id="count"></p><table id="rows"></table>`;
  const input = root.querySelector<HTMLInputElement>("#q");
  const count = root.querySelector<HTMLElement>("#count");
  const rows = root.querySelector<HTMLElement>("#rows");
  if (!input || !count || !rows) return;

  const render = (): void => {
    const hits = store.all().filter((e) => matches(e, input.value.toLowerCase()));
    count.textContent = `${hits.length} of ${store.all().length} entities`;
    rows.innerHTML = hits.slice(0, 200).map(row).join("");
  };
  input.addEventListener("input", render);
  store.subscribe(render);
  render();
}

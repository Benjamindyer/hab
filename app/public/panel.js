// The sidebar item. Home Assistant's own sign-in page cannot run inside a frame, so instead of
// framing HAB this opens it as the whole page. replace() keeps the Back button from looping here.
class HabPanel extends HTMLElement {
  connectedCallback() {
    this.textContent = "Opening HAB...";
    window.location.replace("/hab_static/index.html");
  }
}

customElements.define("hab-panel", HabPanel);

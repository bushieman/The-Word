import ReactDOM from "react-dom/client";
import App from "./App.tsx";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    let selectedText: string | null = null;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        ui &&
        ui.shadowHost &&
        !ui.shadowHost.contains(event.target as Node)
      ) {
        ui.remove();
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };

    const ui = await createShadowRootUi(ctx, {
      name: "wxt-react-example",
      position: "inline",
      anchor: "body",
      append: "first",
      onMount: (container) => {
        const wrapper = document.createElement("div");
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<App text={selectedText ?? undefined} />);
        document.addEventListener("mousedown", handleClickOutside);
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    // Track if a non-modifier key was pressed during the shortcut window
    let secondaryKeyPressed = false;

    document.addEventListener("keydown", (e) => {
      // If either modifier is pressed down, reset tracking if it's a fresh sequence
      if (e.key === "Control" || e.key === "Alt") {
        return;
      }
      
      // If any other key is pressed while BOTH Ctrl and Alt are active, flag it
      if (e.ctrlKey && e.altKey) {
        secondaryKeyPressed = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      // Trigger when either Control or Alt is released, provided BOTH were active
      if (e.key !== "Control" && e.key !== "Alt") return;
      if (!e.ctrlKey && !e.altKey) return; // Ensures at least one modifier was held down

      // If a third, non-modifier key was involved, abort
      if (secondaryKeyPressed) {
        secondaryKeyPressed = false; 
        return;
      }

      const text = window.getSelection()?.toString().trim();
      if (!text) return; 

      selectedText = text;
      ui.mount();
    });
  
  },
});

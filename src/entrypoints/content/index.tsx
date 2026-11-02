import ReactDOM from "react-dom/client";
import App from "./App.tsx";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    let selectedText: string | null = null;

    // let ui: ReturnType<typeof createShadowRootUi>;

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

    // Listen for mouseup and pass selected text to ui.mount

    // Variable to track if another key was pressed while Control was held down
    let secondaryKeyPressed = false;

    document.addEventListener("keydown", (e) => {
      // If Control is pressed, reset our tracking flag for a fresh press cycle
      if (e.key === "Control") {
        secondaryKeyPressed = false;
        return;
      }
      
      // If any other key is pressed down while Control is active, flag it
      if (e.ctrlKey) {
        secondaryKeyPressed = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key !== "Control") return;

      // If a secondary key was involved in this press window, abort immediately
      if (secondaryKeyPressed) {
        secondaryKeyPressed = false; // reset flag
        return;
      }

      const text = window.getSelection()?.toString().trim();
      if (!text) return; // Guard against mounting with empty text

      selectedText = text;
      ui.mount();
    });
  
  },
});

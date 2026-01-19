import type { Preview } from "@storybook/nextjs-vite";
import "@/styles/globals.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const root = document.documentElement;
      const isDark = context.globals.theme === "dark";

      root.classList.toggle("dark", isDark);

      if (context.viewMode === "docs") {
        return (
          <div className="w-full rounded border bg-background p-6">
            <Story />
          </div>
        );
      }

      return <Story />;
    },
  ],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    chromatic: {
      modes: {
        light: { globals: { theme: "light" } },
        dark: { globals: { theme: "dark" } },
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;

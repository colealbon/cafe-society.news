import { themes } from '@storybook/theming';
import '../src/style.css'
import { fn } from '@storybook/test';

const preview: Preview = {
  parameters: {
    // actions: { argTypesRegex: "^on[A-Z].*" },
    args: { onClick: fn() },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      // Override the default dark theme
      dark: { ...themes.dark },
      // Override the default light theme
      light: { ...themes.normal }
    }
  },
};

export default preview;

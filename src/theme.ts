import { createTheme, MantineColorsTuple } from '@mantine/core';

const nordicEmerald: MantineColorsTuple = [
  '#e6fcf5',
  '#c3fae8',
  '#96f2d7',
  '#63e6be',
  '#38d9a9',
  '#20c997',
  '#12b886',
  '#0ca678',
  '#099268',
  '#087f5b',
];

const nordicDark: MantineColorsTuple = [
  '#f3f4f6',
  '#d1d5db',
  '#9ca3af',
  '#6b7280',
  '#4b5563',
  '#262833',
  '#1e202a',
  '#161822',
  '#10121a',
  '#090a0f',
];

export const theme = createTheme({
  primaryColor: 'emerald',
  colors: {
    emerald: nordicEmerald,
    dark: nordicDark,
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Card: {
      defaultProps: {
        withBorder: true,
        radius: 'lg',
        padding: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        overlayProps: {
          backgroundOpacity: 0.75,
          blur: 5,
        },
      },
    },
    Drawer: {
      defaultProps: {
        overlayProps: {
          backgroundOpacity: 0.75,
          blur: 5,
        },
      },
    },
  },
});

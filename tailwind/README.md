# Tailwind CSS Setup
To set up Tailwind CSS in your project, follow these steps:

1. Install Dependencies
```bash
yarn add -D tailwindcss postcss autoprefixer
```
2. Create tailwind.config.js File
Create a tailwind.config.js file in the root of your project with the following content:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{html,js,tsx,ts}",
    "./components/**/*.{html,js,tsx,ts}"
  ],
  theme: {
    colors: {
      white: {
        100: '#FFFFFF',
        200: '#FBFBFB',
        300: '#FCFCFC',
        400: '#F4F4F4',
        500: '#F6F6F6',
        600: '#F9F9F9',
        900: '#C8C8C8'
      },
      black: {
        100: '#39393A',
        200: '#262E37',
        400: '#2A2A2D',
        900: '#000000'
      },
      grey: {
        100: '#B1B1B1',
        200: '#8D8D8D',
        300: '#666667',
        400: '#39393A'
      },
      blue: {
        100: '#E0EEFF',
        400: '#3C8AE5'
      },
      green: {
        100: '#D1E7DD',
        400: '#00E2B8',
         }
    },
    fontSize: {
      sm: '0.9rem',
      base: '1rem',
      xl: '1.25rem',
      '2xl': '1.563rem',
      '3xl': '1.953rem',
      '4xl': '2.441rem',
      '5xl': '3.052rem'
    },
    extend: {
      fontFamily: {
        DarkerGrotesque: ['Darker Grotesque', 'sans-serif'],
        Lexend: ['Lexend', 'sans-serif'],
        Mako: ['Mako', 'sans-serif'],
        Poppins: ['Poppins', 'sans-serif']
      }
    },
    plugins: []
  }
};
```
Make sure to customize the theme and other configurations according to your project's needs.

3. Create Tailwind CSS File
Create a CSS file (e.g., tailwind-import.css) in your project's styles directory with the following content:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import './base.css';
@import 'tailwindcss/utilities';

@layer base {
    h1 {
        @apply text-2xl;
        @apply font-bold;
    }
}
```
You can import additional CSS files or customize the styles as needed.

4. Add this tailwind script in your package.json. After adding the script, you can run the script in your command line.

```bash
{
  // add this script to your package.json - then run npm run watch:tailwind
  "scripts": {
    "watch:tailwind": "npx tailwindcss -i ./assets/styles/tailwind-import.css -o ./assets/styles/tailwind-compiled.css --watch"
  }
}
```

## That's it! You've successfully set up Tailwind CSS in your project. Happy coding!
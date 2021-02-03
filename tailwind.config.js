module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}'], //remove unused style classes in production 
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Roboto', 'sans-serif']
      }
    }, 
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

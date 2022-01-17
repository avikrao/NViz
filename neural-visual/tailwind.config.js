module.exports = {
  content: [    
    "./pages/**/*.{js,ts,jsx,tsx}",    
    "./components/**/*.{js,ts,jsx,tsx}",  
  ],
  theme: {
    extend: {
      fontFamily: {
        'vietnam': ['"Be Vietnam Pro"']
      }
    },
  },
  plugins: [
    require('./node_modules/tailwind-percentage-heights-plugin')(),
    require("daisyui"),
  ],
}

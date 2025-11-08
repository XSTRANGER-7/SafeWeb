module.exports = {
    content: [
      './index.html', 
      './src/**/*.{js,jsx}',
      '!./src/**/AdhaarDemo.jsx',
      '!./src/**/AadhaarDemo.jsx'
    ],
    theme: {
      extend: {
        colors: {
          cream: '#FFF7F0',
          primary: '#0F172A',
          accent: '#F59E0B'
        }
      }
    },
    plugins: []
  }
  
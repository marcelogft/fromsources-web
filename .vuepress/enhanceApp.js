import Vuetify from 'vuetify'
// index.js or main.js
//import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader

export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {
    Vue.use(Vuetify, {
      iconfont: 'fa'
     })
    console.log ("Loaded")
}
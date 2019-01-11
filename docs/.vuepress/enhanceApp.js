import Vuetify from 'vuetify'
// index.js or main.js

import SocialSharing from 'vue-social-sharing'


export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {
    Vue.use(Vuetify, {
      iconfont: 'fa'
     })
     Vue.use(SocialSharing)
}

<template>
  <v-app id="fromsources" dark>
    <v-navigation-drawer
      clipped
      fixed
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-tile 
          router
          :to="item.to"
          :key="i"
          v-for="(item, i) in items"
          exact
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>FromSources</v-toolbar-title>
    </v-toolbar>
    <v-content> 
       <v-container fluid grid-list-md>
    <v-layout row wrap>
      <v-flex xs10>
      <nuxt />  
      </v-flex>
        <v-flex xs2>
       <a class="twitter-timeline" data-theme="dark" href="https://twitter.com/mcolomer?ref_src=twsrc%5Etfw">Timeline</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </v-flex>
    </v-layout>
       </v-container>
    </v-content>
    <v-footer app fixed>
      <span>Fromsources &copy; 2018</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: null,
    items: [
      { icon: 'home', title: 'Home', to: '/' },
      { icon: 'build', title: 'Tools', to: '/tools' },
      { icon: 'info_outline', title: 'About', to: '/about' }
    ]
  }),
  props: {
    source: String
  }
}
</script>

 
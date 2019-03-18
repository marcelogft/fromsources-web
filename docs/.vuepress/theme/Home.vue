<template>
  <v-content>
      <section>
        <v-parallax :src="$withBase(data.heroImage)" height="600">
          <v-layout
            column
            align-center
            justify-center
          >
            <img src="logo.png" alt="FromSources" height="200">
            <h1 class="font-weight-bold mb-2 display-3 text-xs-center" style="text-shadow: 2px 2px 4px #000000;">From Sources Blog</h1>
            <div class="subheading mb-3 text-xs-center" style="text-shadow: 2px 2px 4px #000000;">Yet Another Coding Blog</div>

          </v-layout>
        </v-parallax>
      </section>

      <section>
        <v-container fluid fill-height  grid-list-lg>
        <v-layout align-center justify-space-around fill-height row wrap>
        <v-flex :key="post.key" v-for="post in posts" xs12 sm6 md4>
         <v-card height="100%" hover>
           <v-img :src="post.frontmatter.image" height="200px"></v-img>
           <v-card-title primary-title>
           <div>
             <h3 class="title">{{ post.frontmatter.title }}</h3>
             <div>{{ post.frontmatter.description }} ...</div>
           </div>
           </v-card-title>
           <v-card-actions>
             <v-btn flat color="orange" :to="post.path">More</v-btn>
           </v-card-actions>
         </v-card>
        </v-flex>
        </v-layout>
         </v-container>
      </section>

      <section>
        <v-parallax :src="$withBase(data.heroImage)" height="380">
          <v-layout column align-center justify-center>
             <v-btn
              class="blue lighten-2 mt-5"
              dark
              large
              round
              :href="$withBase(data.actionLink)"
            >
              Blog
            </v-btn>
          </v-layout>
        </v-parallax>
      </section>

      <section>
        <v-container grid-list-xl>
          <v-layout row wrap justify-center >
            <v-flex xs12 sm2>
                 <div class="footer" v-if="data.footer">
                   {{ data.footer }}
                 </div>
            </v-flex>
          </v-layout>
        </v-container>
      </section>

    </v-content>
</template>

<script>
import NavLink from './NavLink.vue'

export default {
  components: { NavLink },
  computed: {
    posts() {
      return this.$site.pages
          .filter(x => x.path.startsWith('/blog/') && !x.frontmatter.blog_index)
          .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
          .slice(0,3);
    },
    data () {
      return this.$page.frontmatter
    },

    actionLink () {
      return {
        link: this.data.actionLink,
        text: this.data.actionText
      }
    }
  }
}
</script>

<style lang="stylus">
@import './styles/config.styl'

@media (max-width: $MQMobile)
  .home
    .features
      flex-direction column
    .feature
      max-width 100%
      padding 0 2.5rem

@media (max-width: $MQMobileNarrow)
  .home
    padding-left 1.5rem
    padding-right 1.5rem
    .hero
      img
        max-height 210px
        margin 2rem auto 1.2rem
      h1
        font-size 2rem
      h1, .description, .action
        margin 1.2rem auto
      .description
        font-size 1.2rem
      .action-button
        font-size 1rem
        padding 0.6rem 1.2rem
    .feature
      h2
        font-size 1.25rem
</style>

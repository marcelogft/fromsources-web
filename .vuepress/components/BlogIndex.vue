<!-- /.vuepress/components/BlogIndex.vue -->

<template>
<div>
 <v-flex xs12 :key="post.key" v-for="post in posts">
     <v-card >
        <v-img
          :src="post.frontmatter.image"
          aspect-ratio="2.75"
        ></v-img>

        <v-card-title primary-title>
          <div>
            <h3 class="headline mb-0">{{ post.frontmatter.title }}</h3>
            <div>{{ post.frontmatter.description }} ...</div> 
          </div>
        </v-card-title>

        <v-card-actions>
          <v-btn flat color="orange" :to="post.path">More</v-btn> 
        </v-card-actions>
      </v-card>
      <br/>
</v-flex>
</div>
</template>

<script>
export default {
    computed: {
        posts() {
            console.log (this.$site.pages)
            return this.$site.pages
                .filter(x => x.path.startsWith('/blog/') && !x.frontmatter.blog_index)
                .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
        }
    }
}
</script>
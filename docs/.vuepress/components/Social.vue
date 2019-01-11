<template>
  <social-sharing :url="url"
                  :title="title"
                  :description="description"
                  :quote="quote"
                  :hashtags="hashtags"
                  twitter-user="mcolomer"
                  inline-template>
  <div>
      <network network="facebook">
        <v-icon large color="blue darken-2" style="cursor: pointer;">fab fa-facebook-square</v-icon>
      </network>
      <network network="linkedin">
        <v-icon large color="blue darken-2" style="cursor: pointer;">fab fa-linkedin</v-icon>
      </network>
      <network network="twitter">
        <v-icon large color="blue darken-2" style="cursor: pointer;">fab fa-twitter-square</v-icon>
      </network>
  </div>
</social-sharing>
</template>

<script>

// usage in local component

export default {
  name: 'Social',
  props: {
      url: { type: String, default: '' },
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      quote: { type: String, default: '' },
      hashtags: { type: String, default: '' },
   }
};
</script>



<template>  
<v-container grid-list-md text-xs-center>
    <v-layout row wrap>
      <v-flex xs12>
         <v-parallax src="images/codecode.jpg">
           <v-layout column align-center justify-center>
             <h1 class="white--text">FromSources</h1>
             <h4 class="white--text">{ "coding": true }</h4>
           </v-layout>
         </v-parallax>
      </v-flex> 
      <v-flex xs2 v-for="item in data" :key="item.id">
        <CardInfo  :info="item"></CardInfo>
      </v-flex>
    </v-layout> 
</v-container>
</template>
<script>
import data from '../static/data/data.json'
import CardInfo from '../components/cardinfo/cardinfo'
export default {
  components: {
    CardInfo
  },
  data () {
    return {
      data
    }
  }
}
</script>
 
<style>
.parallax__image-container {
  opacity: 0.1;
}
h1 {
  text-shadow: 4px 4px #000000;
  font-size: 4.5em;
  font-style: italic;
}
h4 {
  text-shadow: 4px 4px #000000;
  font-size: 1.5em;
}
</style> 
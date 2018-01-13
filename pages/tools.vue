<template>  
<v-container grid-list-md text-xs-center>
    <v-layout row wrap> 
      <v-flex xs2 v-for="item in data" :key="item.id" >   
        <CardInfo :info="item" :name="item.name" class="list-complete-item"></CardInfo>  
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
 
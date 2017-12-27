<template>
  <v-card color="blue-grey lighten-1 darken-2" class="text-xs-left white--text" >
    <v-container fluid grid-list-lg >
        <v-layout row>
            <v-flex xs7>
              <div>
                <div class="headline">{{ info.name }} </div>
                 <div>{{ info.desc }} </div>
               </div>
            </v-flex>
            <v-flex xs5>
            <v-card-media
              :src="info.icon"
              height="125px"
              contain
            ></v-card-media>
            </v-flex>
        </v-layout>
    </v-container>
 </v-card>
</template>
<script>
export default {
  name: 'CardInfo',
  props: {
    info: {
      name: String,
      desc: String,
      icon: String
    }
  }
}
</script>
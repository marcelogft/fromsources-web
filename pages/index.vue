<template> 
 <v-container grid-list-xl>
    <v-layout v-bind="binding">
      <v-flex>
         <v-parallax src="images/codecode.jpg">
           <v-layout column align-center justify-center>
             <h1 class="white--text">Fromsources</h1>
             <h4 class="white--text">{ coding: true }</h4>
           </v-layout>
         </v-parallax>
      </v-flex> 
    </v-layout>
  </v-container> 
</template>
 
<style>
.parallax__image-container {
  opacity: 0.1;
}
h1 {
  text-shadow: 4px 4px #000000;
}
h4 {
  text-shadow: 4px 4px #000000;
}
</style>
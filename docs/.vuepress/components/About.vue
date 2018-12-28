 <template>
 <v-container grid-list-md text-xs-center>
    <v-layout row wrap>
        <v-flex xs12>
            <div class="text-xs-center">
              <v-avatar size="125px">
                <img
                  class="img-circle elevation-7 mb-1"
                  :src="$page.frontmatter.avatar">
              </v-avatar>
              <div class="headline">{{$page.frontmatter.name}} <span style="font-weight:bold">{{$page.frontmatter.surname}} </span></div>
              <div class="subheading text-xs-center font-weight:bold">{{$page.frontmatter.role}}</div> 
            </div>
        </v-flex>        
        <v-flex xs12 style="margin-top: 40px;">            
            <v-layout row wrap>
                <v-flex xs4>
                    <v-icon large color="blue-grey darken-2" @click="open(github)">fab fa-github</v-icon> 
                </v-flex>   
                <v-flex xs4>  
                    <v-icon large color="blue darken-2" @click="open(linkedin)">fab fa-linkedin-in</v-icon>
                </v-flex>    
                <v-flex xs4>      
                    <v-icon large color="blue darken-2" @click="open(twitter)">fab fa-twitter</v-icon>  
                </v-flex>    
            </v-layout>          
        </v-flex>
        <v-flex xs12 style="margin-top: 100px;">            
            <v-layout row wrap>
                <v-flex xs12> 
                   <div class="subheading text-xs-center font-weight:bold"> This site was made using: </div>
                </v-flex> 
                <v-flex xs4>
                   <img src="https://vuejs.org/images/logo.png" width="50" height="50"> 
                </v-flex>   
                <v-flex xs4>  
                    <img src="https://vuepress.vuejs.org/hero.png" width="50" height="50"> 
                </v-flex>    
                <v-flex xs4>      
                    <img src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-300.png" width="50" height="50">  
                </v-flex>    
                <v-flex xs4> 
                    <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer"> Vue<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" x="0px" y="0px" viewBox="0 0 100 100" width="15" height="15" class="icon outbound"><path fill="currentColor" d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"></path> <polygon fill="currentColor" points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"></polygon></svg></a>
                </v-flex>   
                <v-flex xs4>  
                    <a href="https://vuepress.vuejs.org/" target="_blank" rel="noopener noreferrer"> Vuepress<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" x="0px" y="0px" viewBox="0 0 100 100" width="15" height="15" class="icon outbound"><path fill="currentColor" d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"></path> <polygon fill="currentColor" points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"></polygon></svg></a>
                </v-flex>    
                <v-flex xs4>   
                    <a href="https://vuetifyjs.com" target="_blank" rel="noopener noreferrer"> Vuetify<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" x="0px" y="0px" viewBox="0 0 100 100" width="15" height="15" class="icon outbound"><path fill="currentColor" d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"></path> <polygon fill="currentColor" points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"></polygon></svg></a>
                </v-flex>    
            </v-layout>          
        </v-flex>
    </v-layout>
 </v-container>
</template>
<script>
export default {
    computed: {
        github() {   
            return this.$page.frontmatter.github
        },
        linkedin() {   
            return this.$page.frontmatter.linkedin
        },
        twitter() {   
            return this.$page.frontmatter.twitter
        },

    },
    methods: {
        open(link) { 
           window.open(link);
        }
    }
}
</script>
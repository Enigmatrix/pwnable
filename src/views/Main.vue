<template>
  <v-container grid-list-md fluid fill-height style="padding: 0">
    <v-layout row>
      <v-flex xs6 style="background: red;">
        <v-card class="elevation-8" style="margin: 0">
          <v-layout row style="margin: 0; padding: 0">
            <div style="width: 18px; padding-top: 0; font-size: 0;">
              <input type="radio" style="width:18px; height:18px; margin-top: 0; font-size: 18px; margin-bottom: 0.25em; background: orange" v-for="i in 12" :key="i"/>
            </div>
            <v-flex style="margin: 0; padding: 0">
              <pre v-highlightjs="csrc" style="font-size: 18px"><code class="c cpp" style="padding: 0"></code></pre>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
      <v-flex xs6>
        <v-container fill-height style="padding: 0">
          <v-layout column>
            <v-flex xs6 style="background: yellow"></v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VueHighlight from 'vue-highlightjs';
import cpp from 'highlight.js/lib/languages/cpp';
import hljs from 'highlight.js/lib/highlight';
hljs.registerLanguage('cpp', cpp);
import 'highlight.js/styles/github.css';

Vue.use(VueHighlight);
@Component({
  components: {
    VueHighlight
  },
  data(){
    return {
      csrc: `#include <stdio.h>

int main(){
    int nani = 0;
    char name[8];
    scanf("%s", name);
    if (nani == 0x696e616e)
        printf("Success");
    else printf("Fail");

    return 0;
}`
    };
  }
})
export default class Main extends Vue {}
</script>
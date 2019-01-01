<template>
    <v-tabs>
        <v-tab v-for="i in [0,1]" :key="langs[i]">{{langs[i]}}</v-tab>
        <v-tab-item  v-for="i in [0,1]" :key="langs[i]">
            <Code :src="srcs[i].src" :line-numbers="srcs[i].lines" style="font-size: 18px"></Code>
        </v-tab-item>
    </v-tabs>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { langs } from "./Code";
import Code from "@/components/Code.vue";
@Component({
  components: { Code },
  props: ["srcs"],
  data: () => ({ langs })
})
export default class Source extends Vue {}
</script>

<style scoped>
</style>

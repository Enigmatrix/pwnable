<template>
    <div>
        <div v-for="(rinfo, rname) in regInfo" style="margin: 4px">
            <v-layout row align-center style="font-family: monospace; padding: 4px">
                <div>{{rname}}:</div>
                <div v-ripple><v-icon small>mdi-content-copy</v-icon></div>
                <select class="elevation-4">
                    <option v-for="meth in valueForms">{{meth(rinfo)}}</option>
                </select>
            </v-layout>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
const range = (n: Number) => Array.from(Array(n).keys());

function int(s: Number){
    return s + "u64";
}
function sint(s: Number){

}
function hex(s: Number){
    return "0x"+s.toString(16);
}
function oct(s: Number){
    return "0o"+s.toString(8);
}
function bin(s: Number){
    return "0b"+s.toString(2)//.padStart(64, "0");
}
function str(s: Number){
    return `"${String.fromCharCode(...range(8).map(x => (s >> (x*8)) & 0xff))}"`;
}
const valueForms =  [
    hex,
    int,
    oct,
    bin,
    sint,
    str];

@Component({
  props: ["regs"],
  computed: {
    regInfo() {
      return this.$props.regs;
    },
  },
    data: () => ({valueForms}),
  methods: {
  }
})
export default class Registers extends Vue {}
</script>

<style scoped lang="scss">
    select {
        -moz-appearance: none;
        display: inline-block;
        option {
            background: #424242;
            color: white;
            padding: 4px;
        }
    }
    .match-font{
        width: 1em;
        height: 1em;
    }
</style>

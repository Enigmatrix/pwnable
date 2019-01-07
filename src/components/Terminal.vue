<template>
    <div ref="terminal"></div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {Terminal as XTerminal} from 'xterm';
import 'xterm/dist/xterm.css';
import * as attach from 'xterm/lib/addons/attach/attach';

let ws = (path:string) => {
    let loc = window.location, new_uri;
    if (loc.protocol === "https:") {
        new_uri = "wss:";
    } else {
        new_uri = "ws:";
    }
    new_uri += "//" + loc.hostname +":"+((<any>window).webpackHotUpdate ? 3000 : 8080);
    new_uri += path;
    console.log(new_uri);
    return new WebSocket(new_uri);
}

@Component({
    props: ['challid'],
    mounted(){
        let terminal = new XTerminal();
        XTerminal.applyAddon(attach);
        terminal.open(this.$refs.terminal as HTMLElement);
        let socket = ws(`/chall/${this.$props.challid}/output`);
        (<any>terminal).attach(socket);
    }
})
export default class Terminal extends Vue {}
</script>

<style scoped>
</style>

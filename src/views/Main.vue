<template>
    <v-container grid-list-md fluid fill-height style="padding: 0">
        <v-layout row style="margin: 0">
            <v-flex xs6 style="padding: 0">
                <v-card fill-height style="margin: 4px" class="elevation-8">
                    <Registers :regs="registers"></Registers>
                    <v-divider></v-divider>
                    <Memory></Memory>
                </v-card>
            </v-flex>
            <v-flex xs6>
                <v-container fill-height style="padding: 0">
                    <v-layout column>
                        <v-flex xs6 style="padding: 0;">
                            <v-card class="elevation-8" style="margin: 4px">
                                <v-layout row>
                                    <v-btn flat icon small color="green" @click="run">
                                        <v-icon>mdi-play</v-icon>
                                    </v-btn>
                                    <v-btn flat icon small color="red">
                                        <v-icon>mdi-flash</v-icon>
                                    </v-btn>
                                    <v-divider vertical></v-divider>
                                    <v-btn flat icon small>
                                        <v-icon>mdi-skip-backward</v-icon>
                                    </v-btn>
                                    <v-btn flat icon small>
                                        <v-icon>mdi-skip-previous</v-icon>
                                    </v-btn>
                                    <v-btn flat icon small>
                                        <v-icon>mdi-skip-next</v-icon>
                                    </v-btn>
                                    <v-btn flat icon small>
                                        <v-icon>mdi-skip-forward</v-icon>
                                    </v-btn>
                                </v-layout>
                                <Source :srcs="sources" ></Source>
                            </v-card>
                        </v-flex>
                        <v-flex xs6 style="padding: 0">
                            <Terminal :challid="challid"></Terminal>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import Code, {langs} from "@/components/Code.vue";
    import Source from "@/components/Source.vue";
    import Registers from '@/components/Registers.vue';
    import Memory from '@/components/Memory.vue';
    import Terminal from '@/components/Terminal.vue';
    //import {ChallengeState} from '@/../dtos/ChallengeState';
    import axios from '@/util/axios';

    @Component({
        components: {
            Memory,
            Registers,
            Source,
            Code,
            Terminal
        },
        methods: {
            async run(){
                console.log(this);
                console.log(await axios.post(`/chall/${this.$data.chall.id}/run`));
            },
            async asmSrc(){

            }
        },
        async mounted(){
            let res = await axios.post('/chall/new');
            console.log(res.data);
            this.$data.chall = res.data;
        },
        computed:{
            challid(){
                return this.$data.chall == undefined ? undefined : this.$data.chall.id;
            },
        },
        data() {
            return {
                chall: undefined,
                langs,
                cFontSize: 18,
                registers: {
                    'rax': 0x40000,
                    'rbx': 0x60000,
                    'rsp': 0x5445,
                    'rbp': 0x6363,
                },
                sources: [
                    {
                        src: `#include <stdio.h>

int main(){
    int nani = 0;
    char name[8];
    scanf("%s", name);
    if (nani == 0x696e616e)
        printf("Success");
    else printf("Fail");

    return 0;
}`,
                        lines: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
                    },
                    {
                        src: `push rbp
mov rbp, rsp

leave
ret`,
                        lines: ["0x400000", "0x400001", "0x40000a", "0x40000d", "0x40000f"]
                    }
                ]
            };
        }
    })
    export default class Main extends Vue {
    }
</script>

<template>
    <v-container v-if="chall" grid-list-md fluid fill-height style="padding: 0">
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
                                <Source :srcs="sources" />
                            </v-card>
                        </v-flex>
                        <v-flex xs6 style="padding: 0">
                            <Terminal :challid="chall.id"></Terminal>
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
    import {ChallengeState, CSourceLine, AsmSourceLine} from '@/../dtos/ChallengeState';
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
            }
        },
        async mounted(){
            let res = await axios.post('/chall/new');
            console.log(res.data);
            this.$data.chall = res.data;
        },
        computed:{
            challid(){
                return this.$data.chall.id;
            },
            sources(){
                let csrc: CSourceLine[] = this.$data.chall.sources[0];
                let asmsrc: AsmSourceLine[] = this.$data.chall.sources[1];
                
                return [{
                    lines: csrc.map(x => ''+x.line),
                    src: csrc.map(x => x.src).join('\n')
                },
                {
                    lines: asmsrc.map(x => `${x.addr} <${x.raddr}>`),
                    src: asmsrc.map(x => x.src).join('\n')
                }]
            }
        },
        data() {
            return {
                chall: <ChallengeState|undefined>undefined,
                langs,
                cFontSize: 18,
                registers: {
                    'rax': 0x40000,
                    'rbx': 0x60000,
                    'rsp': 0x5445,
                    'rbp': 0x6363,
                }
            };
        }
    })
    export default class Main extends Vue {
    }
</script>

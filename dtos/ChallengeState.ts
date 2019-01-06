export interface SourceLine{
    src: string;
    breakpoint: boolean;
}

export interface CSourceLine extends SourceLine {
    line: string;
}

export interface AsmSourceLine extends SourceLine {
    addr: string,
    raddr: string,
}

export interface ChallengeState {
    id: string;
    name: string;
    chall_name: string;
    sources: [CSourceLine[], AsmSourceLine[]],
    breakpoints: []
}
import express from 'express';
import docker from '../docker';
import uuid from 'uuid';
import sscanf from 'sscanf';
import { Container, Exec } from 'dockerode';
import {GDB} from 'gdb-js';
import MemoryStream from 'memorystream';
import { Socket } from 'net';
import wsStream from 'websocket-stream/stream';

let challs = express.Router();

let challMapping: {[key:string]: Challenge} = {};

class Challenge {
    id: string;
    name: string;
    chall_name: string;
    gdb: GDB;
    container: Container;
    output: Socket;

    constructor(name: string, chall_name: string, container: Container, gdb: GDB, output: Socket) {
        this.id = container.id;
        this.name = name;
        this.chall_name = chall_name;
        this.container = container;
        this.gdb = gdb;
        this.output = output;
    }
}

//TODO: make sure solving one chall doesnt mean they cd and solve other challs
let initChallContainer = async (name: string) => {
    let container = await docker.createContainer({
        Image: 'chall_base',
        AttachStdin: true,
        AttachStderr: true,
        AttachStdout: true,
        //Tty: true,
        OpenStdin: true,
        Volumes: {},
        name,
        HostConfig: {
            // list of "src:dest"
            Binds: [],
            CapAdd: ['SYS_PTRACE'],
            Privileged: true,
        },
        Entrypoint: "gdb",
        Cmd: ["-i=mi"]
    });
    await container.start();
    return container;
};

let initGdb = async (chall: Container, chall_name: string) => {
    let procStream = await chall.attach({
        stream: true, stdin: true, stdout: true, stderr: true});
    let stdout1 = new MemoryStream();
    let stderr1 = new MemoryStream();
    await chall.modem.demuxStream(procStream, stdout1, stderr1);
    let gdb = new GDB({
        stdin: procStream,
        stdout: stdout1,
        stderr: stderr1
    });
    await gdb.init();
    await gdb.enableAsync();
    await gdb.execCLI('cd '+chall_name);
    await gdb.execCLI('file '+chall_name);
    await gdb.execCLI('tty /dev/gdbout');
    return gdb;
};

let containerExecStream = async (container: Container,cmd: string[]) => {
    let exec = await container.exec({
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd:['bash', '-c', 'socat pty,raw,echo=0,link=/dev/gdbout,waitslave -']});
    let out = await exec.start({Tty: true});
    return <Socket>out.output.connection;
}

let getChallenge = id => {
    let chall = challMapping[id];
    if(!chall)
        throw new Error(`Challenge ${id} not found!`)
    return chall;
}

challs.post('/new', async (req, res) => {
    let name = 'chall-'+uuid.v4();
    let chall_name = 'crackme4';
    let container = await initChallContainer(name);
    let output = await containerExecStream(container, ['bash', '-c', 'socat pty,raw,echo=0,link=/dev/gdbout,waitslave -']);
    let gdb = await initGdb(container, chall_name);

    let asmsrc = await gdb.execCLI('x/10i main');
    let csrc = await gdb.execCLI('list main');
    
    challMapping[container.id] = new Challenge(name, chall_name, container, gdb, output);

    res.json({
        id: container.id,
        csrc: csrc.split('\n').map(cLine),
        asmsrc: asmsrc.split('\n').map(asmLine),
        running: false,
        breakpoints: false
    })
});

challs.delete('/all', async (req, res) => {
    let containers = await docker.listContainers();
    containers.forEach(c => {
        docker.getContainer(c.Id).kill();
    });
    res.sendStatus(200);
});

challs.ws('/:id/output', async (ws, req) => {
    const stream = wsStream(ws, {binary: true});
    let chall = getChallenge(req.params.id);
    chall.output.pipe(stream);
    stream.pipe(chall.output);
});

challs.post('/:id/break/asm', async (req, res) => {
    let chall = getChallenge(req.params.id);
})

challs.post('/:id/break/c', async (req, res) => {
    let chall = getChallenge(req.params.id);
})

challs.post('/:id/run', async (req, res) => {
    let chall = getChallenge(req.params.id);
    await chall.gdb.run();
    res.sendStatus(200);
})

challs.post('/:id/step', async (req, res) => {
    
})

challs.delete('/:id', async (req, res) => {
    let id = req.params.id;
    let chall = await getChallenge(id);
    //chall.kill();
    res.sendStatus(200);
});

let cLine = (s: string) => {
    return sscanf(s, '%d\t%S', 'no', 'src');
}

let asmLine = (s: string) => {
    //the <main+x> might not be always there!
    return sscanf(s, '   0x%s <%s>:\t%S', 'addr', 'raddr', 'src');
}

let afterFirst = (s: string, pat:string) => {
    var i = s.indexOf(pat);
    return s.slice(i+pat.length);
};

let beforeLast = (s: string, pat:string) => {
    var i = s.lastIndexOf(pat);
    return s.slice(0, i);
};

export default challs;
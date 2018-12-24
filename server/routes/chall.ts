import express from 'express';
import docker from '../docker';
import uuid from 'uuid';
import path from 'path';
import sscanf from 'sscanf';
import { Container } from 'dockerode';
import {GDB} from 'gdb-js';
import MemoryStream from 'memorystream';

let challs = express.Router();

let getChall = async id => {
    let chall = docker.getContainer(id);
    let info = await chall.inspect();
    if(!info.Name.startsWith('/chall-')) throw new Error("Container not found");
    return chall;
};

let getChallStream = async (chall:Container) => {
    return await chall.attach({
        stream: true, stdin: true, stdout: true, stderr: true});
};

challs.post('/new', async (req, res) => {
    let chall = await docker.createContainer({
        Image: 'chall_base',
        AttachStdin: true,
        AttachStderr: true,
        AttachStdout: true,
        //Tty: true,
        OpenStdin: true,
        Volumes: {},
        name: 'chall-'+uuid.v4(),
        HostConfig: {
            // list of "src:dest"
            Binds: [],
            CapAdd: ['SYS_PTRACE'],
            Privileged: true
        },
        Entrypoint: "gdb",
        Cmd: ["-i=mi"]
    })
    await chall.start();
    let procStream = await getChallStream(chall);
    let stdout1 = new MemoryStream();
    let stderr1 = new MemoryStream();
    await chall.modem.demuxStream(procStream, stdout1, stderr1);
    let gdb = new GDB({
        stdin: procStream,
        stdout: stdout1,
        stderr: stderr1
    });
    await gdb.init();
    console.log(await gdb.execCLI('cd bof1'));
    console.log(await gdb.execCLI('file bof1'));
    let asmsrc = await gdb.execCLI('x/10i main');
    let csrc = await gdb.execCLI('list main');
    
    res.json({
        id: chall.id,
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

challs.post('break/:id', async (req, res) => {

})

challs.post('run/:id', async (req, res) => {

})

challs.post('step/:id', async (req, res) => {

})

challs.delete('/:id', async (req, res) => {
    let id = req.params.id;
    let chall = await getChall(id);
    chall.kill();
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
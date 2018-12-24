import express from 'express';
import docker from '../docker';
import uuid from 'uuid';
import path from 'path';
import sscanf from 'sscanf';
import { Container } from 'dockerode';
import slashes from 'slashes';
import { stringify } from 'querystring';

let challs = express.Router();

let getChall = async id => {
    let chall = docker.getContainer(id);
    let info = await chall.inspect();
    if(!info.Name.startsWith('/chall-')) throw new Error("Container not found");
    return chall;
};

let getChallStream = async (chall:Container) => {
    return await chall.attach({
        stream: true, stdin: true, stdout: true, /*stderr: true*/});
};

let tillGdbCmdSep = (stream: NodeJS.ReadWriteStream, cmd):Promise<string[]> => {
    return new Promise(res => {
        let result = Buffer.from("");
        const needle = '(gdb) ';
        let listener = (dat: Buffer|string) => {
            if(!(dat instanceof Buffer))
                dat = Buffer.from(dat);
            let sep = dat.indexOf(needle);
            //console.log('BUFF>>', dat.toString());
            if(sep >= 0){
                result = Buffer.concat([result, dat.slice(0, sep)]);
                stream.unshift(dat.slice(sep+needle.length));
                stream.removeListener('data', listener);
                //console.log(result.toString())
                let out = result.toString().split('\n')
                    .filter(x => x.indexOf("~\"") >= 0 && x.indexOf("\\n\"") >= 0)
                    .map(x => beforeLast(afterFirst(x, "~\""), "\\n\""))
                    .map(x => JSON.parse('"'+x+'"'));
                res(out);
            } else {
                result = Buffer.concat([result, dat]);
            }
        }
        stream.on('data', listener);
        stream.write(cmd);
    });
}

let gdbCmdInit = async (chall: Container) => {
    let stream = await getChallStream(chall);
    await tillGdbCmdSep(stream, '');
};

let gdbCmd = async (chall:Container, cmd):Promise<string[]> => {
    let stream = await getChallStream(chall);
    return await tillGdbCmdSep(stream, cmd+'\n');
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

    await gdbCmdInit(chall);
    await gdbCmd(chall, 'cd ./bof1');
    await gdbCmd(chall, 'file ./bof1');
    await gdbCmd(chall, 'set disassembly-flavor intel');
    let asmsrc = await gdbCmd(chall, 'x/10i main');
    let csrc = await gdbCmd(chall, 'list main');
    
    res.json({
        id: chall.id,
        csrc: csrc.map(cLine),
        asmsrc: asmsrc.map(asmLine),
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
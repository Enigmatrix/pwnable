import express from 'express';
import docker from '../docker';
import uuid from 'uuid';
import path from 'path';
import { Container } from 'dockerode';

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

let tillGdbCmdSep = (stream: NodeJS.ReadWriteStream, cmd) => {
    return new Promise(res => {
        let result = '';
        const needle = '(gdb) ';
        let listener = (dat: Buffer|string) => {
            if(dat instanceof Buffer)
                dat = dat.toString();
            let sep = dat.indexOf(needle);
            if(sep > 0){
                result+=dat.substring(0, sep);
                stream.unshift(Buffer.from(dat.substring(sep+needle.length)));
                stream.removeListener('data', listener);
                res(result);
            } else {
                result+=dat;
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

let gdbCmd = async (chall:Container, cmd) => {
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
        Entrypoint: "gdb"
    })
    await chall.start();

    //read gdb intro
    //await gdbCmd(chall, '');
    await gdbCmdInit(chall);
    console.log(await gdbCmd(chall, 'file /bin/ls'));
    console.log(await gdbCmd(chall, 'x/20i main'));
    console.log(await gdbCmd(chall, 'x/20i main'));
    
    res.json({
        id: chall.id
    })
});

challs.delete('/all', async (req, res) => {
    let containers = await docker.listContainers();
    containers.forEach(c => {
        docker.getContainer(c.Id).kill();
    });
    res.sendStatus(200);
});

challs.delete('/:id', async (req, res) => {
    let id = req.params.id;
    let chall = await getChall(id);
    chall.kill();
    res.sendStatus(200);
});

export default challs;
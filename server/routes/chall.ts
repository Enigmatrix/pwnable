import express from 'express';
import Docker from 'dockerode';
import uuid from 'uuid';

let challs = express.Router();
let docker = new Docker();

let getChall = async id => {
    let chall = docker.getContainer(id);
    let info = await chall.inspect();
    if(!info.Name.startsWith('/chall-')) throw new Error("Container not found");
    return chall;
};

challs.post('/new', async (req, res) => {
    await docker.pull('shahzeb/cpp-gdb', {});
    let chall = await docker.createContainer({
        Image: 'shahzeb/cpp-gdb',
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
        Cmd: [
            "/bin/bash", "-c", "apt install gdb -y"
        ],
        Entrypoint: "/bin/bash"
    });
    await chall.start();
    let stream = await chall.attach({stream: true, stdin: true, stdout: true, stderr: true});

    stream.write('which ls\n');
    stream.on('data', (d:Buffer) => console.log(d.toString()));
    
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
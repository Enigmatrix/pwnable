import Docker from 'dockerode';
import path from 'path';

const docker = new Docker();

(async ()  => {
    let stream = await docker.buildImage({
        context: path.join(__dirname, '../challs'),
        src: ['Dockerfile']},
        {t: 'chall_base'});
    await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
    });
    console.log('Challenge Base Image built. You may start now')
})()

export default docker;
import 'babel-polyfill';
import express, {Application, Router} from 'express';
import expressWsify from 'express-ws';
import morgan from 'morgan';

let routesFrom = async file => {
  return await import(file).then(x => x.default)
}

export default async (app:Application) => {
  expressWsify(app, null, {
    wsOptions: {
      perMessageDeflate: false
    }
  });
  app.use(express.json());
  app.use(morgan('tiny'))

  app.use('/chall', await routesFrom('./routes/chall'));
}
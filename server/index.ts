import express, {Application} from 'express';
import challs from './routes/chall';

export default (app:Application) => {
  app.use(express.json());
  
  app.get('/foo', (req, res) => {
     res.json({msg: 'foo'});
  });

  app.use('/chall', challs);

  //
  // app.post('/bar', (req, res) => {
  //   res.json(req.body);
  // });
}
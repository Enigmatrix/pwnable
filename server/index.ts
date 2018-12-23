import express, {Application} from 'express';

export default (app:Application) => {
  // app.use(express.json());
  //
  app.get('/foo2', (req, res) => {
     res.json({msg: 'foo'});
  });
  //
  // app.post('/bar', (req, res) => {
  //   res.json(req.body);
  // });
}

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/api');
const multer = require('multer');
var upload = multer();

const app = express();
const port = 5000;


app.use(upload.array());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());



// app.use(express.urlencoded({ extended: true })); 

app.use(bodyParser.urlencoded({extended:true}));

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.log(err);
  next();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
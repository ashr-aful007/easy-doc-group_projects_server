const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.get(cors());
app.get(express.json());





app.get('/', async(req, res) =>{
    res.send('port is running');
})
app.listen(port, async(req, res) =>{
    console.log(`port is running ${port}`);
})
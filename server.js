'use strict';

const express = require('express')
const app = express()
const path = require('path')
const port = 3000

app.use(express.static('views'))

app.get('/', (req, res) => 
{
	res.sendFile(path.join(__dirname + '/views/baseView.html'))
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
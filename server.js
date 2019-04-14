console.log('\n\n\n=================================');
// Express
const express = require('express');
const app = express();
// Path
const path = require('path');

// 👉 Express templating engine
app.set('view engine', 'ejs');

// 👉 Serving static files in Express
app.use('/assets', express.static('assets'))

app.get('/', function(req, res){
    console.log(req.url);
    res.render('index');
});


// Configuration Server
const host = '127.0.0.1';
const port = process.env.PORT || 4000;
app.listen(port, host, function(){
    console.log(`HTTP Server is running at http://${host}:${port}`);
})
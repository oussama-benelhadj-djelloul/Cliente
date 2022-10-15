const express = require('express');
const app = express()

//the engine
app.set('view engine', 'ejs');

app.get('/',function (req,res){
    console.log('Landing Page')
    res.send('landing page')
})

app.get('/company/:id', function(req,res){
    res.render('index', {Brand : req.params.id})
})


app.listen('3000')
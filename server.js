const express = require('express');
const app = express()
require('dotenv').config()
const feedbacks = require('./models/feedback')


require('./Models/db')();
//the engine
app.set('view engine', 'ejs');

app.get('/',function (req,res){
    console.log('Landing Page')
    res.send('landing page')
})

app.get('/company/:id', async function(req,res){
    const results = await feedbacks.find({to : req.params.id})
    res.render('index', {Brand : req.params.id, feedbacks : results})
})


app.listen('3000')
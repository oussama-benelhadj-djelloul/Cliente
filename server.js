const express = require('express');
const app = express()
require('dotenv').config()
var session = require('express-session')
const feedbacks = require('./models/feedback')

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))
require('./Models/db')();
//the engine
app.set('view engine', 'ejs');

app.get('/',function (req,res){
    console.log('Landing Page')
    res.send('landing page')
})

app.get('/company/:id', async function(req,res){
    req.session.user = 'noone'
    console.log(req.session)
    const results = await feedbacks.find({to : req.params.id})
    res.render('index', {Brand : req.params.id, feedbacks : results, user :  req.session.user})
})

app.get('/user/login', function(req,res){
    res.render('connect')
})

app.get('/admin/login', function(req,res){
    res.render('aconnect')
})

app.get('/admin/dash', async function(req,res){
    const response = await feedbacks.find({to : 'Cliente'})
    res.render('index', {Brand : 'Cliente', feedbacks : response, user :  req.session.user})
})

app.listen('3000')
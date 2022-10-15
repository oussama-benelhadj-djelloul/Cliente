const express = require('express');
const app = express()
require('dotenv').config()
var session = require('express-session')
const feedbacks = require('./models/feedback')
const users = require('./models/user')
const brands = require('./models/brand')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(session({ resave: true ,secret: '123456' , saveUninitialized: true}));

require('./Models/db')();
//the engine
app.set('view engine', 'ejs');

app.get('/',function (req,res){
    console.log('Landing Page')
    res.send('landing page')
})

app.get('/company/:id', async function(req,res){
    req.session.brand = req.params.id;
    const results = await feedbacks.find({to : req.params.id})
    res.render('index', {Brand : req.params.id, feedbacks : results, user :  req.session.user})
})

app.get('/user/login', function(req,res){
    if (req.session.user) {
        res.redirect(`/company/${req.session.brand}`)
    } else {
        res.render('connect', {Brand : req.session.brand, user :  req.session.user})
    }
})

app.post('/user/login', function(req,res){
    users.findOne({email : req.body.email, type : "user"}, function(err, response){
        console.log("db result : "+response)
        if (err || response == null) {
            res.render('connect', {error : 'wrong email'})
        } else {
            console.log("db password : "+response.password)
            if(response.password != req.body.password){
                res.render('connect', {error : 'wrong password'})
            }else{
                req.session.user = response.email;
                console.log(req.session)
                res.redirect(`/company/${req.session.brand}`)
            }
        }
    })
})

app.get('/admin/login', function(req,res){
    res.render('aconnect')
})

app.post('/admin/login', function(req,res){
    brands.findOne({email : req.body.email}, function(err, response){
        console.log("db result : "+response)
        if (err || response == null) {
            res.render('aconnect', {error : 'wrong email'})
        } else {
            console.log("db password : "+response.password)
            if(response.password != req.body.password){
                res.render('aconnect', {error : 'wrong password'})
            }else{
                req.session.user = response.email;
                console.log(req.session)
                res.redirect(`/admin/dash`)
            }
        }
    })
})

app.get('/admin/dash', async function(req,res){
    const response = await feedbacks.find({to : 'Cliente'})
    res.render('aindex', {Brand : 'Cliente', feedbacks : response, user :  req.session.user})
})

app.listen('3000')
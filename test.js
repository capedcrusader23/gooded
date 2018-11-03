const express=require('express');
const app=express();
const route=require('./routes/route.js');
var session= require('express-session');

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(session({
    secret: 'uphaar1233',
    resave: true,
    saveUninitialized: true
}));
app.use(route);


app.listen(process.env.PORT||1111,function(){
  console.log("running at 1111");
})

const router=require('express').Router();
var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');
var path=require('path');
var querystring=require('query-string');
const cre=require('../config/client_secret.json');
const body=require('body-parser');
const url=body.urlencoded({extended:false});
const credential=require('../config/credential.json')
const googleConfig={
clientId:'1093368709643-k3k5b4de4bmepktkad0t1gv8fld6ppf2.apps.googleusercontent.com',
clientSecret:'BTN2EiIpWwfzHbQoEqHmEy12',
redirect:'http://localhost:1111/redirect'
}
const defaultScope = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];
function createConnection(){
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}
function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  });
}
function urlGoogle() {
  const auth = createConnection(); // this is from previous step
  const url = getConnectionUrl(auth);
  return url;
}
function getGooglePlusApi(auth) {
  return google.plus({ version: 'v1', auth });
}
function getYoutubeApi(auth){
  return google.youtube({version:'v3',auth});
}
async function getGoogleAccountFromCode(code)
{
    const auth = createConnection();
    const data = await auth.getToken(code);
    const tokens = data.tokens;
    auth.setCredentials(tokens);
    const plus = getGooglePlusApi(auth);
    const me = await plus.people.get({ userId: 'me' });
    const userGoogleId = me.data.id;
  const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;
  return {
    id: userGoogleId,
    email: userGoogleEmail,
    tokens: tokens,
  };
}

var code='';
router.get('/',function(req,res){
  var url=urlGoogle()
  res.redirect(url);
})

router.get('/redirect',function(req,res){
req.session['code']=req.query.code;
code=req.query.code;
console.log(code);
res.redirect('/upload');

})

router.get('/upload',function(req,res){

res.render('home',{mess:req.flash('Done'),mess2:req.flash('err'),mess3:req.flash('succes')});
});
router.post('/getupload',url,function(req,res){
  var filename=req.body;
  const auth = createConnection();


  auth.setCredentials({
  refresh_token: req.session['refresh']
});
  auth.getToken(req.session['code']).then(function(da){
    console.log(da);
    auth.setCredentials(da.tokens);
    const youtube=getYoutubeApi(auth);
    youtube.videos.insert({
      part:'id,snippet,status',
      notifySubscriber:false,
      requestBody:{
        snippet:{
          title:req.body.title,
          description:req.body.Desc
        },
        status:{
          privacryStatus:'private',
        }
      },
      media:{
        body:fs.createReadStream(req.body.pat)
      }
    }).then(function(re){
      console.log(re);
      req.flash('Done',"Video uploaded");
      res.redirect('/upload');
    })
  })
})

router.get('/change',function(req,res){
  res.render('change')
})

router.get('/dochange',function(req,res){
  const auth = createConnection();
  console.log(req.session['code']);
  auth.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      req.session['refresh']=tokens.refresh_token;
      console.log('Refresh Token '+tokens.refresh_token);
    }
    console.log(tokens);
  });
  auth.setCredentials({
  refresh_token: req.session['refresh']
});


  auth.getToken(req.session['code']).then(function(da){
    console.log('Tokens are '+da.tokens.access_token)
    auth.setCredentials(da.tokens);
      const youtube=getYoutubeApi(auth);
    youtube.search.list({forMine:true,part:'id,snippet',type:'video'}).then(function(da){
      console.log(da.data.items);
      res.render('change',{all:da.data.items});
    })
  })
});

router.post('/finalchange',url,function(req,res){
console.log(req.body);
  const auth = createConnection();
console.log(req.session['code']);
  auth.getToken(req.session['code']).then(function(da){
auth.setCredentials(da.tokens);
    const youtube=getYoutubeApi(auth);
  var vid='';
    youtube.search.list({forMine:true,part:'id,snippet',type:'video'}).then(function(da){
    console.log(da.data.items);
var test='';
    for(var g=0;g<da.data.items.length;g++)
    {
      if(da.data.items[g].id.videoId==req.body.video)
      {
        console.log(da.data.items[g]);
        test=da.data.items[g];
        break;
      }
    }
    if(test==null)
    {
      req.flash('err','Empty video field');
      res.redirect('/upload');
    }
    console.log(test);
    test.snippet.title=req.body.title;
    test.snippet.description=req.body.desc;
    var resource = {
         snippet: {
           description: req.body.desc,
           title:req.body.title,
           categoryId: '22'
         },
          id: test.id.videoId
       };
       var youtube=getYoutubeApi(auth);

       youtube.videos.update({resource,part:'snippet'}).then(function(da){
         console.log(da);

         req.flash("succes","done with the changes");
         res.redirect('/upload');
       });
  })

  })
})

module.exports=router

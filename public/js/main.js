//options

const CLIENT_ID="90385303811-1k2uec0ikgjjnohqsklfktd099it2vd7.apps.googleusercontent.com",
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');
var content=document.getElementById('content');
var channelForm=document.getElementById('channel-form');
var channelInput=document.getElementById('channel-input');
const videoConatiner=document.getElementById('video-container');
const defaultchannel='techguyweb'
function handleClientLoad(){
  gapi.load('client:auth2',initClient);
}
function initClinet
{
  gapi.client.init({
    discoveryDocs:DISCOVERY_DOCS,
    clientId:CLIENT_ID,
    scope:SCOPES
  }).then(function(){
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
    updateSigninstance(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorize.onclick=handleAuthClick;
    signoutButton.onclick=handleSignoutClick;

  })
}
function updateSignInStatus(isSignedIn)
{
  if(isSignedIn)
  {
    authorizeButton.style.display='none';
    signoutButton.style.display='block';
    content.style.display='block';
    videoConatiner.style.display='block';
    getChannel(defaultchannel);
  }
  else{


      authorizeButton.style.display='block';
      signoutButton.style.display='none';
      content.style.display='none';
      videoConatiner.style.display='none';
  }
}

function handleAuthClick()
{
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick()
{
  gapi.auth2.getAuthInstance().signOut();
}
function getChannel(channel)
{
  console.log(channel);
}

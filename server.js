const Vimeo = require('vimeo').Vimeo;
const express = require('express');

const hostValidation = require('host-validation')
const ejs = require('ejs');
const {RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole} = require('agora-access-token');

const app = express();

// Render engine for the express server
app.use(express.static('assets'));
app.use(express.static('dist'));
app.engine('.html', ejs.__express);
app.set('view-engine', 'html');
app.set('port', (process.env.PORT || 3333))
app.set('views', __dirname + '/examples');

// CORS header
app.use(function(req, res, next) {
  console.log(`[Server] A ${req.method} request was made to ${req.url}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

/*
* Vimeo toen for local development is saved in a .env file
* For deployment make sure to store it in an enviorment
* variable called VIMEO_TOKEN=4trwegfudsbg4783724343
*/
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({path: __dirname+'.env'});

  if (process.env.VIMEO_TOKEN) {
    console.log('[Server] Enviorment variables loaded from .env 💪🏻');
  } else {
    console.log('[Server] Could not find a VIMEO_TOKEN. Make sure you have a .env file or enviorment variable with the token');
  }
}

app.use(hostValidation({ hosts: [`127.0.0.1:${process.env.PORT}`,
                                 `192.168.1.99:${process.env.PORT}`,
                                 `localhost:${process.env.PORT}`,
                                 /.*\.glitch\.com$/,
                                 /.*\.ngrok\.io/,
                                 /.*\.herokuapp\.com/,
                                 /.*\.netlify\.app/,
                                 /.*\.glitch\.me$/,
                                 /.*\.sad-tesla-488061.netlify\.app/,
                                 process.env.DOMAIN] }))

                                
app.get('/', (request, response) => {
  response.render('menu.html',{ name: 'Tobi' });
});

app.get('/index', (request, response) => {
  response.render('indexsegallbody.html');
});
app.get('/indexseg', (request, response) => {
  response.render('indexnocanvas.html');
});

app.get('/index3', (request, response) => {
  response.render('index3.html');
});


app.get('/test', (request, response) => {
  response.render('scene_objectmove.html');
});


app.get('/firebase', (request, response) => {
  response.render('index.html');
});

app.get('/login', (request, response) => {
  response.render('loginAWS.html');
});
app.get('/signup', (request, response) => {
  response.render('loginAWSsignup.html');
});
/*app.get('/signup', (request, response) => {
  response.render('login_signup.html');
});*/
/*app.get('/login', (request, response) => {
  response.render('login.html');
});*/

app.get('/adsmanager', (request, response) => {
  response.render('ads_interface.html',{ name: 'Tobi' });
});


app.get('/adscreation', (request, response) => {
  response.render('ads_creation.html',{ name: 'Tobi' });
});

app.get('/art', (request, response) => {
  response.render('art.html');
});

app.get('/artupload', (request, response) => {
  response.render('ArtGalleryUpload.html');
});

app.get('/ads', (request, response) => {
  response.render('ads.html',{ name: 'Tobi' });
});



app.get('/playground', (request, response) => {
  response.render('playground.html');
});

app.get('/green', (request, response) => {
  response.render('greenscreennortm.html');
});

app.get('/greenDesktop', (request, response) => {
  response.render('greenscreennortm_Desktop.html');
});

app.get('/greenStreaming', (request, response) => {
  response.render('greenscreennortm_DesktopStreamingAWS.html');
});


app.get('/picker', (request, response) => {
  response.render('picker.html');
});
app.get('/greenarStreaming', (request, response) => {
  response.render('greenscreennortm_AWSstreaming.html');
});

app.get('/broadcaster', (request, response) => {
  response.render('broadcaster3Dsplit.html',{ name: 'Tobi' });
});
app.get('/menu', (request, response) => {
  response.render('menu.html',{ name: 'Tobi' });
});


app.get('/aws', (request, response) => {
  response.render('AWSUpload.html');
});

app.get('/awslogin', (request, response) => {
  response.render('AWSlogin.html');
});

app.get('/basic', (request, response) => {
  response.render('basic.html');
});


app.get('/test6', (request, response) => {
  response.render('test6.html');
});

// The route for getting videos from the vimeo API
app.get('/vimeo/api', (request, response) => {
  let api = new Vimeo(null, null, process.env.VIMEO_TOKEN);

  api.request({
      method: 'GET',
      path: request.query.path,
      headers: { Accept: 'application/vnd.vimeo.*+json;version=3.4' },
    },
    function(error, body, status_code, headers) {
      if (error) {
        response.status(500).send(error);
        console.log('[Server] ' + error);
      } else {
        // Pass throgh the whole JSON response
        response.status(200).send(body);
      }
    }
  );
});

const APP_ID = "e76fbfaa876b4c68a5d92d92aa6ad3b1";
const APP_CERTIFICATE = "edaf251d48354259bd1739445aaa158b";

const nocache = (_, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

const ping = (req, resp) => {
  resp.send({message: 'pong'});
}

const generateRTCToken = (req, resp) => {
  // set response header
  resp.header('Access-Control-Allow-Origin', '*');
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ 'error': 'channel is required' });
  }
  // get uid 
  let uid = req.params.uid;
  if(!uid || uid === '') {
    return resp.status(500).json({ 'error': 'uid is required' });
  }
  // get role
  let role;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === 'audience') {
    role = RtcRole.SUBSCRIBER
  } else {
    return resp.status(500).json({ 'error': 'role is incorrect' });
  }
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build th token
  let token;
  if (req.params.tokentype === 'userAccount') {
    token = RtcTokenBuilder.buildTokenWithAccount(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  } else if (req.params.tokentype === 'uid') {
    token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  } else {
    return resp.status(500).json({ 'error': 'token type is invalid' });
  }
  // return the token
  return resp.json({ token });
}

const generateRTMToken = (req, resp) => {
  // set response header
  resp.header('Access-Control-Allow-Origin', '*');

  // get uid 
  let uid = req.params.uid;
  if(!uid || uid === '') {
    return resp.status(500).json({ 'error': 'uid is required' });
  }
  // get role
  let role = RtmRole.Rtm_User;
   // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  console.log(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime)
  const token = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
  // return the token
  return resp.json({ 'rtmToken': token });
}

const generateRTEToken = (req, resp) => {
  // set response header
  resp.header('Access-Control-Allow-Origin', '*');
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ 'error': 'channel is required' });
  }
  // get uid 
  let uid = req.params.uid;
  if(!uid || uid === '') {
    return resp.status(500).json({ 'error': 'uid is required' });
  }
  // get role
  let role;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === 'audience') {
    role = RtcRole.SUBSCRIBER
  } else {
    return resp.status(500).json({ 'error': 'role is incorrect' });
  }
  // get the expire time
  let expireTime = req.params.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const rtcToken = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  const rtmToken = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
  // return the token
  return resp.json({ 'rtcToken': rtcToken, 'rtmToken': rtmToken });
}

app.get('/incHp/:id',function(req,res){
  return res.json({ 'rtmToken': req.params.id });
});

app.get('/ping', nocache, ping)
app.get('/rtc/:channel/:role/:tokentype/:uid', nocache , generateRTCToken);

//app.get('/rtc/web/publisher/uid/1', nocache , generateRTCToken);

app.get('/rtm/:uid/', nocache , generateRTMToken);
app.get('/rte/:channel/:role/:tokentype/:uid/:expiry', nocache , generateRTEToken);
app.get('/rtc/web/audience/uid/2', nocache , generateRTCToken);
const listener = app.listen(process.env.PORT, () => {
  console.log(`[Server] Running on port: ${listener.address().port} 🚢`);
});



const sayHello = (name) => {console.log('Hello ' + name)}

module.exports = {
  sayHello: sayHello
};


  //=============== AWS IDs ===============
  var userPoolId = 'eu-west-1_3x9L2hsjh';
  var clientId = '4gkuhfpqeo9rc279nh727l3sco';
  var region = 'eu-west-1';
  var identityPoolId = 'eu-west-1:a40474e9-d90b-494d-836d-7e55d8f9da3b';
  //=============== AWS IDs ===============
  
  var cognitoUser;
  var idToken;
  var userPool;
  
  var poolData = { 
    UserPoolId : userPoolId,
    ClientId : clientId
  };

  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


  getCurrentLoggedInSession();
  
  document.getElementById("logout").addEventListener("click", function (e) {
		logOut();
	});


   // document.getElementById("uploadtop").addEventListener("click", function (e) {
       // logOut();
    //}); 
    
    function isUserLoggedIn() {
      var cognitoUser = userPool.getCurrentUser();
      if (cognitoUser != null) {
          return cognitoUser.getSession(function(err, session) {
            if (err) {
              console.log(err.message);
              return false;
            }
            if(session.isValid()){
              AWS.config.region = region;
  
    var loginMap = {};
    loginMap['cognito-idp.' + region + '.amazonaws.com/' + userPoolId] = idToken;
  
   // AWS.config.credentials.clearCachedId();

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId,
      Logins: loginMap
    });
    
              return true;
            }else{
              return false;
            }
          });
      }else{
          return false;
      }
  }

  function getCurrentLoggedInSession(){
  
  userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  cognitoUser = userPool.getCurrentUser();
  
  if(cognitoUser != null){
  cognitoUser.getSession(function(err, session) {
    if (err) {
    console.log(err.message);
    }else{
        if(document.getElementById("username")!=null){
      document.getElementById("username").textContent = cognitoUser.getUsername();
    }

    console.log('Session found! Logged in.');
    idToken = session.getIdToken().getJwtToken();
    localStorage.setItem("sub", session.getIdToken().decodePayload().sub);
    $("#logout").show();
    document.getElementById("uploadtop").style.display = "block";

    document.getElementById("navbutton").querySelector('li[id='+"upload"+']').style.display = "block";
       // document.getElementById("navbutton").querySelector('li[id='+"profile"+']').querySelector('a[id='+"profilhref"+']').href = "profile.html";
        document.getElementById("navbutton").querySelector('li[id='+"login"+']').style.display = "none";
        document.getElementById("navbutton").querySelector('li[id='+"profile"+']').style.display = "block";

        document.getElementById("navbutton").querySelector('li[id='+"logout"+']').querySelector('a[id='+"logouthref"+']').href = "";
        document.getElementById("navbutton").querySelector('li[id='+"logout"+']').querySelector('span[id='+"logouttext"+']').innerHTML = "Logout";

        
    }
  });
  }else{
    document.getElementById("uploadtop").style.display = "none";

    document.getElementById("navbutton").querySelector('li[id='+"upload"+']').style.display = "none";
     //   document.getElementById("navbutton").querySelector('li[id='+"profile"+']').querySelector('a[id='+"profilhref"+']').href = "loginAWS.html";
        document.getElementById("navbutton").querySelector('li[id='+"login"+']').style.display = "none";
        document.getElementById("navbutton").querySelector('li[id='+"profile"+']').style.display = "none";

        document.getElementById("navbutton").querySelector('li[id='+"logout"+']').querySelector('span[id='+"logouttext"+']').innerHTML = "Login";
        document.getElementById("navbutton").querySelector('li[id='+"logout"+']').querySelector('a[id='+"logouthref"+']').href = "LoginAWS.html";

  console.log('Logout');
   // window.location = "https://livear.herokuapp.com/login";

  }
  
  }
  
  function logOut(){
          if (cognitoUser != null) {
            cognitoUser.signOut();
          //  $("#logout").html("Sign In");
            console.log('Logged out!');
            localStorage.setItem("sub", "");

          //  document.getElementById("navbutton").querySelector('li[id='+"profile"+']').querySelector('a[id='+"profilhref"+']').href = "loginAWS.html";
            document.getElementById("navbutton").querySelector('li[id='+"login"+']').style.display = "none";
         document.getElementById("navbutton").querySelector('li[id='+"upload"+']').style.display = "none";
         document.getElementById("navbutton").querySelector('li[id='+"profile"+']').style.display = "none";

            document.getElementById("navbutton").querySelector('li[id='+"logout"+']').querySelector('a[id='+"logout"+']').href = "LoginAWS.html";
       document.getElementById("navbutton").querySelector('li[id='+"logout"+']').querySelector('span[id='+"logouttext"+']').innerHTML = "Login";

          //  window.location = "https://livear.herokuapp.com/login";

          }else{
            window.location = "https://admirable-concha-277e68.netlify.app/loginAWS";

          }
          }

    function getCognitoIdCredentials(){
    AWS.config.region = region;
  
    var loginMap = {};
    loginMap['cognito-idp.' + region + '.amazonaws.com/' + userPoolId] = idToken;
  
   // AWS.config.credentials.clearCachedId();

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId,
      Logins: loginMap
    });
  

    AWS.config.credentials.get(function(err) {
        if (err){
        console.log(err.message);
        }
        else {
        console.log('AWS Access Key: '+ AWS.config.credentials.accessKeyId);
        console.log('AWS Secret Key: '+ AWS.config.credentials.secretAccessKey);
        console.log('AWS Session Token: '+ AWS.config.credentials.sessionToken);
        
        }
    
      });

    return AWS.config.credentials;
    }





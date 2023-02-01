var userPoolId = 'eu-west-1_3x9L2hsjh';
var albumBucketName = "videoaws-source-8r4bwmp9uami";
var bucketRegion = "eu-west-1";
var IdentityPoolId = "eu-west-1:a40474e9-d90b-494d-836d-7e55d8f9da3b";
var clientId = '4gkuhfpqeo9rc279nh727l3sco';
var cognitoUser;
  var idToken;
  var userPool;

var currentalbum=null;
var username=null;
var currentvideoalblum="";


AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

  var poolData = { 
    UserPoolId : userPoolId,
    ClientId : clientId
  };

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});

createVideoUserSubAlbum(encodeURIComponent("video")+"/",localStorage.getItem("sub"));

getCurrentLoggedInSession();

function getCurrentLoggedInSession(){
  
  userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  cognitoUser = userPool.getCurrentUser();
  
  if(cognitoUser != null){
  cognitoUser.getSession(function(err, session) {
    if (err) {
    console.log(err.message);
    }else{
      username= cognitoUser.getUsername();
    

    console.log(username);
    idToken = session.getIdToken().getJwtToken();
    localStorage.setItem("sub", session.getIdToken().decodePayload().sub);

        
    }
  });
  }else{
  
  }
  
  }

function listAlbums() {
  var userid = localStorage.getItem("sub");
    var albumPhotosKey = encodeURIComponent("video") + "/"+encodeURIComponent(userid) + "/";
   // s3.listObjects({Delimiter: "/" }, function(err, data) {

  s3.listObjects({Prefix: albumPhotosKey, Delimiter: "/" }, function(err, data) {
    if (err) {
      return alert("There was an error listing your albums: " + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace("/", "/"));
        return getHtml([
          "<li>",
          "<span onclick=\"deleteAlbum('" + albumName + "')\">X</span>",
          "<span onclick=\"viewAlbum('" + albumName + "')\">",
          albumName,
          "</span>",
          "</li>"
        ]);
      });
      var message = albums.length
        ? getHtml([
            "<p>Click on an album name to view it.</p>",
            "<p>Click on the X to delete the album.</p>"
          ])
        : "<p>You do not have any albums. Please Create album.";
        viewAlbum(encodeURIComponent("video")+"/",localStorage.getItem("sub"));
      var htmlTemplate = [
        "<h2>Albums</h2>",
        message,
        "<ul>",
        getHtml(albums),
        "</ul>",
        "<button onclick=\"createAlbum(prompt('Enter Album Name:'))\">",
        "Create New Album",
        "</button>"
      ];
      document.getElementById("app").innerHTML = getHtml(htmlTemplate);
    }
  });
}

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
     return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid; };

  function generateUUID_LiveStream() {
    var d = new Date().getTime();
    var uuid = 'Livexxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
       return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid; };

function createAlbum(albumName) {
  albumName = albumName.trim();
  if (!albumName) {
    return alert("Album names must contain at least one non-space character.");
  }
  if (albumName.indexOf("/") !== -1) {
    return alert("Album names cannot contain slashes.");
  }
  var albumKey = encodeURIComponent(albumName);
  s3.headObject({ Key: albumKey }, function(err, data) {
    if (!err) {
      return alert("Album already exists.");
    }
    /*if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }*/
    s3.putObject({ Key: albumKey }, function(err, data) {
     /* if (err) {
        return alert("There was an error creating your album: " + err.message);
      }*/
    //  alert("Successfully created album.");
      viewAlbum(albumName);
    });
  });
}

function createObjectSubAlbum(path) {
  currentvideoalblum=path;
  if(document.getElementById("3dobject_input")!=null){
    document.getElementById("3dobject_input").style.display="block";
  }
  var albumKey = path + encodeURIComponent("objects")+"/";
  s3.headObject({ Key: albumKey }, function(err, data) {
    if (!err) {
      return alert("Album already exists.");
    }else{
    }
   /* if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }*/
    s3.putObject({ Key: albumKey }, function(err, data) {
     /* if (err) {
        return alert("There was an error creating your album: " + err.message);
      }*/
     // alert("Object Successfully created album.");
    });
  });
}

function createObjectUserAlbum(path) {
  var userid = localStorage.getItem("sub");
  var albumKey = encodeURIComponent("video")+"/"+encodeURIComponent(userid)+"/"+encodeURIComponent("objects")+"/";


  s3.headObject({ Key: albumKey }, function(err, data) {
    if (!err) {
      return alert("Album already exists.");
    }else{
    }
   /* if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }*/
    s3.putObject({ Key: albumKey }, function(err, data) {
     /* if (err) {
        return alert("There was an error creating your album: " + err.message);
      }*/
     // alert("Object Successfully created album.");
    });
  });
}

function createVideoUserSubAlbum(path,userid) {
  var albumKey = path + encodeURIComponent(userid)+"/";
  s3.headObject({ Key: albumKey }, function(err, data) {
    if (!err) {
       console.log("Album already exists.");
    }
   /* if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }*/
    s3.putObject({ Key: albumKey }, function(err, data) {
     /* if (err) {
        return alert("There was an error creating your album: " + err.message);
      }*/
     // alert("Object Successfully created album.");
    });
  });
}

function generateUUID_LiveStream() {
  var d = new Date().getTime();
  var uuid = 'Livexxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
     return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid; };

function scheduleLive(){
  var datepicker = flatpickr(document.getElementById("datepicker"), {
    enableTime: true,
    dateFormat: "Y-m-dTH:i:S.000Z",
});

if (datepicker.selectedDates.length > 0) {
    var selectedDate = datepicker.selectedDates[0];
    console.log("Selected date:", selectedDate);

    var chan= generateUUID_LiveStream();
    fetch('https://k67ygebkqj.execute-api.eu-west-1.amazonaws.com/stage1/Add_LiveStream', {
            method: 'POST',
            body: JSON.stringify({
        id:chan,
      channel:chan,
          idstream: "",
      userid: localStorage.getItem('sub'),
      Livestatus: "Live",
      LiveSchedule:selectedDate
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });
} else {
   alert("You forgot to select a date:)");
}

 
}

 function createSubAlbum(album) {
  var s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: albumBucketName }
  });
  var files = document.getElementById("videoupload").files;
  var progressBar = document.getElementById("progress-bar");

  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  var file = files[0];
  checkFileSize(file,526214400);
  var fileName = file.name;
  var userid = localStorage.getItem("sub");
  const key= generateUUID();
  var albumPhotosKey = encodeURIComponent("video")+"/"+encodeURIComponent(userid)+"/"+encodeURIComponent(key)+"/";;

  if(document.getElementById("3dobject_input")!=null){
    document.getElementById("3dobject_input").style.display="none";
  }

  if (!albumPhotosKey) {
    return alert("Album names must contain at least one non-space character.");
  }
 
  s3.headObject({ Key: albumPhotosKey }, function(err, data) {
    if (!err) {
      return alert("Album already exists.");
    }
    /*if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }*/
    s3.putObject({ Key: albumPhotosKey }, function(err, data) {
     /* if (err) {
        return alert("There was an error creating your album: " + err.message);
      }*/
     // alert("Successfully created album.");
      var files = document.getElementById("videoupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  const videotitle = document.getElementById("videotitle").value;

  const videodescription = document.getElementById("videodescription").value;
const category=document.getElementById("selectedOption").innerHTML;
  const photoKey = albumPhotosKey + fileName;
  const countview = "0";
  var userid=localStorage.getItem("sub").toString();
  // Use S3 ManagedUpload class as it supports multipart uploads
  //alert(userid);

  var params = {
    ContentType: "video/mp4",

    Metadata: {
      'counterview': videotitle,
      'userid': userid,
      's3key': key,
      'caption': videodescription,
      'username':username,
      'category': category,
      },
    
    Bucket: albumBucketName,
    Key: photoKey,
    Body: file,
};
  var options = {partSize: 200 * 1024 * 1024, queueSize: 1};


  var upload = new AWS.S3.ManagedUpload({
    params: params
});

upload.on('httpUploadProgress', function(evt) {
    var percent = evt.loaded / evt.total * 100;
    progressBar.style.width = percent + '%';
    progressBar.innerHTML = percent + '%';
});

upload.send(function(err, data) {
  if(err) {
    alert(err.code);
} else{
alert('uploaded suceessfully');
createObjectSubAlbum(albumPhotosKey);

viewAlbum(albumPhotosKey);
currentalbum=albumPhotosKey;
};
});


    });
  });
}



function createSubAlbumProgress(album) {
  uploadSampleFile();
}

var uploadfile = function(videotitle, albumBucketName, photoKey, file) {
  const params = {
    Metadata: {
      'title': videotitle,
    },
    
    Bucket: albumBucketName,
    Key: photoKey,
    Body: file,
  };

  var options = {partSize: 200 * 1024 * 1024, queueSize: 1};

  return s3.upload(params,options, function(err, data) {

    if (err) {
      console.log('There was an error uploading your file: ', err);
      return false;
    }
    console.log('Successfully uploaded file.', data);
    
    return true;
  });
}

var uploadSampleFile = function() {
  var progressDiv = document.getElementById("myProgress");
  progressDiv.style.display="block";
  var progressBar = document.getElementById("myBar");
  var files = document.getElementById("videoupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  var file = files[0];
  var fileName = file.name;
  var userid = localStorage.getItem("sub");
  var albumPhotosKey = encodeURIComponent("video")+"/"+encodeURIComponent(userid)+"/"+encodeURIComponent(generateUUID())+"/";;
  var videotitle = document.getElementById("videotitle").value;

  if (!albumPhotosKey) {
    return alert("Album names must contain at least one non-space character.");
  }
 
  s3.headObject({ Key: albumPhotosKey }, function(err, data) {
    if (!err) {
      return alert("Album already exists.");
    }
   /* if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }*/
    s3.putObject({ Key: albumPhotosKey }, function(err, data) {
     /* if (err) {
        return alert("There was an error creating your album: " + err.message);
      }*/
     // alert("Successfully created album.");
      var files = document.getElementById("videoupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }

  var photoKey = albumPhotosKey + fileName;
  
  let fileUpload = {
    id: "",
    name: file.name,
    nameUpload: fileName,
    size: file.size,
    type: "",
    timeReference: 'Unknown',
    progressStatus: 0,
    displayName: file.name,
    status: 'Uploading..',
  }
  uploadfile(videotitle,albumPhotosKey, photoKey, file)
    .on('httpUploadProgress', function(progress) {
      let progressPercentage = Math.round(progress.loaded / progress.total * 100);
      console.log(progressPercentage);
      progressBar.style.width = progressPercentage + "%";
      if (progressPercentage < 100) {
        fileUpload.progressStatus = progressPercentage;

      } else if (progressPercentage == 100) {
        fileUpload.progressStatus = progressPercentage;

        fileUpload.status = "Uploaded";

        alert('uploaded suceessfully')
    createObjectSubAlbum(albumPhotosKey);

    viewAlbum(albumPhotosKey);
    currentalbum=albumPhotosKey;
      }
    })

  });
});
}

/*function viewAlbum(path,albumName) {
  var albumPhotosKey = path + encodeURIComponent(albumName) + "/";
  s3.listObjects({ Prefix: albumPhotosKey }, function(err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + "/";
   
    const transformedObjects = data.Contents
    .filter(object => object.Key.endsWith('.mp4'))
    .map(object => ({
      key: object.Key,
      size: object.Size
    }));
  console.log(transformedObjects);

    var photos = data.Contents.map(function(photo) {
   

      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        "<span>",
        "<div>",
        '<img style="width:240px;height:128px;border: 0px solid #333;border-radius: 10px;box-shadow: 0px 0px 1px #333;" src="' + photoUrl + '"/>',
        "</div>",
        "<div>",
        "<span onclick=\"deletePhoto('" +
          albumName +
          "','" +
          photoKey +
          "')\">",
        "X",
        "</span>",
        "<span>",
        photoKey.replace(albumPhotosKey, ""),
        "</span>",
        "</div>",
        "</span>"
      ]);
    });
    var message = photos.length
      ? "<p>Click on the X to delete the photo</p>"
      : "<p>You do not have any photos in this album. Please add photos.</p>";
    var htmlTemplate = [
      "</div>",
      '<input id="videoupload" type="file" accept="video/*">',
      '<button id="addphoto" onclick="createSubAlbum(\'' + albumName + "')\">",
      "Add Video",
      "</button>",
      '<button onclick="listAlbums()">',
      "Back To Albums",
      "</button>",
      "<br>",
      '<form action="/url" method="GET">',
      "<p>Please enter your Video Title:</p>",
      '<input id="videotitle" type="text" placeholder="Video Title">',
      '<input id="videodescription" type="text" placeholder="Video Description">',

    "</form>",
    '<div id="myProgress" style="display:none;"> ',    
   '<div id="myBar"></div>',   
   '</div>',  
   "<br>",
      '<input id="photoupload" type="file" accept=".glb">',
      '<button id="addphoto" onclick="addPhoto(\'' + currentalbum + "')\">",
      "Add Object",
      "</button>",
      '<button onclick="listAlbums()">',
      "Back To Albums",
      "</button>",
      "<h2>",
      "Album: " + albumName,
      "</h2>",
      message,
      "<div>",
      getHtml(photos)
     
    ];
   
    document.getElementById("app").innerHTML = getHtml(htmlTemplate);

  });
}*/

function viewAlbum(path,albumName) {
  var albumPhotosKey = path + encodeURIComponent(albumName) + "/";
  s3.listObjects({ Prefix: albumPhotosKey }, function(err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + "/";
   
    const transformedObjects = data.Contents
    .filter(object => object.Key.endsWith('.mp4'))
    .map(function(item){

    var photoKey = item.Key;
    var photoUrl = bucketUrl + encodeURIComponent(photoKey);
    //console.log("photoUrl " +albumPhotosKey); video/albumuserparent
    //console.log("bucketUrl "+bucketUrl); https://s3.eu-west-1.amazonaws.com/videoaws-source-8r4bwmp9uami/
    console.log("photoUrl "+photoUrl);
    console.log("photoKey "+photoKey);

    var test=photoKey;

    var splut=test.split('/');

    var album=encodeURIComponent(splut[0])+"/"+encodeURIComponent(splut[1])+"/"+encodeURIComponent(splut[2])+"/";
    console.log("splut "+splut[3]);
    return getHtml([
      "<span>",
      "<div class='image-text-combination'>",
      '<img style="width:240px;height:128px;border: 0px solid #333;border-radius: 10px;box-shadow: 0px 0px 1px #333;" src="' + photoUrl + '"/>',
      "<span>",
      splut[3],
     // photoUrl.replace(splut[3], ""),
      "</span>",
      '<button style="width:50px;height:20px;border: 0px solid #333;border-radius: 10px;box-shadow: 0px 0px 1px #333;" id="addphoto" onclick="deleteAlbum(\'' + album + "')\">",

      "</div>",

      "<div>",
      "<br>",
      "</br>",
      
      "</div>",
      "</span>"
    ]);
  
  });
    var message = transformedObjects.length
      ? "<p>Click on the X to delete the photo</p>"
      : "<p>You do not have any photos in this album. Please add photos.</p>";
    var htmlTemplate = [
      "</div>",
      '<input id="videoupload" type="file" accept="video/*">',
      '<button id="addphoto" onclick="createSubAlbum(\'' + albumName + "')\">",
      "Add Video",
      "</button>",
      '<button onclick="listAlbums()">',
      "Back To Albums",
      "</button>",
      "<br>",
      '<form action="/url" method="GET">',
      "<p>Please enter your Video Title:</p>",
      '<input id="videotitle" type="text" placeholder="Video Title">',
      '<input id="videodescription" type="text" placeholder="Video Description">',

    "</form>",
    '<div id="myProgress" style="display:none;"> ',    
   '<div id="myBar"></div>',   
   '</div>',  
   "<br>",
      '<input id="photoupload" type="file" accept=".glb">',
      '<button id="addphoto" onclick="addPhoto(\'' + currentalbum + "')\">",
      "Add Object",
      "</button>",
      '<button onclick="listAlbums()">',
      "Back To Albums",
      "</button>",
      "<h2>",
      "Album: " + albumName,
      "</h2>",
      message,
      "<div>",
      getHtml(transformedObjects)
     
    ];
   
    document.getElementById("app").innerHTML = getHtml(htmlTemplate);

  });
}

function viewObjectsFolder(albumName) {
 // /video/id/videosrc/objects/

 const [video,userid, videoname] = albumName.split('/');
  var albumPhotosKey = encodeURIComponent(video)+"/"+encodeURIComponent(userid)+"/"+encodeURIComponent(videoname)+"/"+encodeURIComponent("objects")+"/";
 
  s3.listObjects({ Prefix: albumPhotosKey }, function(err, data) {
    if (err) {
      return 'There was an error viewing your album: ' + err.message
    } else {                  
      data.Contents.forEach(function(obj,index) {
      if(obj.Key.includes("glb")){
        console.log(obj.Key,"<<<file path");
        loadProducts(obj.Key);
      }  
      })
    }
  })

  
}

function loadProducts(data){

  document.getElementById("object_product").innerHTML = '';

  var li = document.createElement('li');
  
  var Template = '<div id="btn" class="card mt-1">'+
  '<div class="product-1 align-items-center p-2 text-center"> <img src="3d.png" class="rounded" width="70" height="70">'+
  '<h6 class="mt-0 font-black-bold mb-2 info">'+""+'</h6>'+
  '</div>'+
  '</div>';
  
  li.innerHTML = Template;
  
  var file = "https://"+albumBucketName+".s3."+AWS.config.region+".amazonaws.com/"+data;
  
  li.querySelector("#btn").myParam = file;
  
  li.querySelector("#btn").addEventListener('click', myFunc, false);
  
  
  document.getElementById("object_product").appendChild(li);
      }
  
       function myFunc(evt) {
    var test = evt.currentTarget.myParam;
  var event = new CustomEvent("objectclick", { "detail": test });
    document.dispatchEvent(event);
  }

  function addPhotoProfile(filedata) {
   
    var file = filedata;
    if (file.size<=0) {
      return alert("Please choose a file to upload first.");
    }
    const fileType = file.type;

    checkFileSize(file,5214400);

    var fileName = file.name;
    const fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1);
    if (fileExtension === "jpg" || fileExtension === "png") {
    } else {
        alert("File is not an image in JPG or PNG format.");
        return;
    }

    var userid = localStorage.getItem("sub");

  //  var albumPhotosKey = path + encodeURIComponent("objects") + "/";
    var albumPhotosKey = encodeURIComponent("video")+"/"+encodeURIComponent(userid)+"/"+encodeURIComponent("pictureProfile")+"/";;

    var photoKey = albumPhotosKey + fileName;
  
   
  
    var params = {
      ContentType: fileType,
      Metadata: {
        'jpg': "jpg",
      },
      
      Bucket: albumBucketName,
        Key: photoKey,
        Body: file,
  };
    
  var options = {partSize: 200 * 1024 * 1024, queueSize: 1};
    s3.upload(params, options, function(err, data) {
      if(err) {
          alert(err.code);
      } else{
      alert('image uploaded successfully')
     // viewAlbum(albumPhotosKey);
      };
  });
  
  }

  function checkFileSize(fileinput, size) {
    var file = fileinput;
    var fileSize = file.size;
    var maxSize = size; // 25MB in bytes
    if (fileSize > maxSize) {
      alert("File size must be less than 25MB!");
      return false;
    }
    return true;
  }

function addPhoto(path) {
  var progressBar = document.getElementById("progress-bar");
  var files = "";

  if(currentvideoalblum.length>0){
     files = document.getElementById("photoupload").files;
  }else{
     files = document.getElementById("objectuploader").files;
 
   }
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  var file = files[0];
  checkFileSize(file,26214400);
  var fileName = file.name;

  var albumPhotosKey="";
  if(currentvideoalblum.length>0){
   albumPhotosKey = currentvideoalblum + encodeURIComponent("objects") + "/";
  }else{
     albumPhotosKey = encodeURIComponent("video") + "/" + encodeURIComponent(localStorage.getItem('sub')) + "/"+encodeURIComponent("3Dobjects") + "/";

  }
  var photoKey = albumPhotosKey + fileName;

 

  var params = {
    Metadata: {
      'obj': "obj",
    },
    
    Bucket: albumBucketName,
      Key: photoKey,
      Body: file,
};
  
var options = {partSize: 100 * 1024 * 1024, queueSize: 1};
var upload = new AWS.S3.ManagedUpload({
  params: params
});

upload.on('httpUploadProgress', function(evt) {
  var percent = evt.loaded / evt.total * 100;
  progressBar.style.width = percent + '%';
  progressBar.innerHTML = percent + '%';
});

upload.send(function(err, data) {
if(err) {
  alert(err.code);
} else{
  currentvideoalblum="";
  alert('uploaded suceessfully')
  viewAlbum(albumPhotosKey);
};
});


}

function deletePhoto(albumName, photoKey) {
  s3.deleteObject({ Key: photoKey }, function(err, data) {
    if (err) {
      return alert("There was an error deleting your photo: ", err.message);
    }
    alert("Successfully deleted photo.");
    viewAlbum(albumName);
  });
}

function deleteAlbum(albumName) {
  var albumKey = albumName;
  s3.listObjects({ Prefix: albumKey }, function(err, data) {
    if (err) {
      return alert("There was an error deleting your album: ", err.message);
    }
    var objects = data.Contents.map(function(object) {
      return { Key: object.Key };
    });
    s3.deleteObjects(
      {
        Delete: { Objects: objects, Quiet: true }
      },
      function(err, data) {
        if (err) {
          return alert("There was an error deleting your album: ", err.message);
        }
        alert("Successfully deleted album.");
        listAlbums();
      }
    );
  });
}
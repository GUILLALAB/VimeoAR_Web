var SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

function abbreviateNumber(number) {
  // what tier? (determines SI symbol)
  var tier = Math.log10(Math.abs(number)) / 3 | 0;

  // if zero, we don't need a suffix
  if (tier == 0) return number;

  // get suffix and determine scale
  var suffix = SI_SYMBOL[tier];
  var scale = Math.pow(10, tier * 3);

  // scale the number
  var scaled = number / scale;

  // format number and add suffix
  var formatted = scaled % 1 === 0 ? Math.round(scaled) : scaled.toFixed(1);
  return formatted + " " + suffix;
}

     function loadProducts(data){

var li = document.createElement('li');
var file = "https://"+data.srcBucket.S+".s3."+AWS.config.region+".amazonaws.com/"+data.srcVideo.S;
var test=data.hlsUrl.S+"~"+data.guid.S+"~"+data.title.N+"~";
var counterview="";
if(data.counterview.S===undefined){
  counterview="ok";
}else{
  counterview=data.counterview.S;
}

var item = data.thumbNailsUrls;
var outerArray = Object.values(item)[0];
var innerObject = outerArray[0];
var image = Object.values(innerObject)[0];


var likescount = data.likescount && (data.likescount.N || data.likescount.S) || "0";
//var url = `profile.html?id=${id}`;
var url = `profile_details.html`;



var Template = '<div id="btn" class="col-lg-4 col-md-6 mb-4">' +
'<div id="carda" class="card h-100">' +
'<br>' +
'<a id="name" class="card-text">' + data.username.S + '</a>' +
'<br>' +
'<a href="#"><img class="card-img-top" src="' + image + '" alt=""></a>' +
'<div class="card-body">' +
'<h4 class="card-title">' +
'<a href="#">' + counterview + '</a>' +
'</h4>' +
'<h5></h5>' +
'<p class="card-text">' + abbreviateNumber(data.title.N) + " views • " + formatDateDifference(data.endTime.S) + "" + '</p>' +
'</div>' +
'<div id="footer" class="card-footer">' +
'<div id="likes">'+
  '<i class="fa fa-thumbs-up"></i>'+
  '<a style="margin-left: 10px;">' + abbreviateNumber(likescount) + "" + '</a>' +
'</div>'+
'<button class="ar-button" onclick="window.app.showChair(\'' + test + '\')"><i class="fas fa-camera"></i></button>' +
'</div>' +
'</div>' +
'<br>' +
'<br>' +
'</div>';




//"https://d2pjrbz7mizc67.cloudfront.net/3c1d6366-eaa0-49a0-bfa9-5481702644b7/hls/avatar.m3u8"
//                '<button class="ar-button" onclick="'+window.app.showChair(1);+'"><i class="fas fa-camera"></i></button>'+

li.innerHTML = Template;

li.setAttribute('id', "btn");

var testObject = data;

// Put the object into storage
li.querySelector("#name").myParam = data.userid.S;

li.querySelector("#name").addEventListener('click', myFunc, false);
var test=data.hlsUrl.S+"~"+data.guid.S+"~"+data.likescount.N+"~";
console.log(test);
li.querySelector("#likes").myParam=test;
li.querySelector("#likes").addEventListener('click', myFunclikes, false);
document.getElementById("home_product").appendChild(li);

    }
    
    function myFunc(evt) {
      var test = evt.currentTarget.myParam;
    var event = new CustomEvent("buttonclick", { "detail": test });
      document.dispatchEvent(event);
    }
    function myFunclikes(evt) {
      var likes = evt.currentTarget.myParam;
    var event = new CustomEvent("buttonlikes", { "detail": likes });
      document.dispatchEvent(event);
    }



    function loadProductsRow(data){

var li = document.createElement('li');
var file = "https://"+data.srcBucket.S+".s3."+AWS.config.region+".amazonaws.com/"+data.srcVideo.S;
var test=data.hlsUrl.S+"~"+data.guid.S+"~"+data.title.N+"~";
var counterview="";
if(data.counterview.S===undefined){
  counterview="ok";
}else{
  counterview=data.counterview.S;
}

var item = data.thumbNailsUrls;
var outerArray = Object.values(item)[0];
var innerObject = outerArray[0];
var image = Object.values(innerObject)[0];


var likescount = data.likescount && (data.likescount.N || data.likescount.S) || "0";

          var Template= '<div id="btn" class="col-lg-4 col-md-6 mb-4">'+
            '<div id="carda" onclick="window.app.PlayVideo(\'' + test + '\')" class="card h-100">'+
              '<a href="#"><img class="card-img-top" src="'+image+'" alt=""></a>'+
              '<div class="card-body">'+
                '<h4 class="card-title">'+
                  '<a>'+ counterview+'</a>'+
                '</h4>'+
                '<h5></h5>'+
                '<p class="card-text">'+ abbreviateNumber(data.title.N)+" views"+'</p>'+
              '</div>'+
              '<div id="footer" class="card-footer">'+
                '<small class="text-muted">&#9733; &#9733; &#9733; &#9733; &#9734;</small>'+
                '<button class="ar-button"><i class="fas fa-camera"></i></button>'+
             '</div>'+
              
            '</div>'+
          '</div>';
//"https://d2pjrbz7mizc67.cloudfront.net/3c1d6366-eaa0-49a0-bfa9-5481702644b7/hls/avatar.m3u8"
//                '<button class="ar-button" onclick="'+window.app.showChair(1);+'"><i class="fas fa-camera"></i></button>'+

li.innerHTML = Template;

li.setAttribute('id', "btn");

li.querySelector("#btn").myParam = data;



document.getElementById("ar_product").appendChild(li);

    }

    function formatDateDifference(dateString) {
      const date = new Date(dateString);
      const currentTime = new Date();
      const diff = currentTime.getTime() - date.getTime();
    
      const minutes = diff / 1000 / 60;
      if (minutes < 1) return "il y a moins d'une minute";
      if (minutes < 60) return `il y a ${Math.round(minutes)} minutes`;
    
      const hours = minutes / 60;
      if (hours < 24) return `il y a ${Math.round(hours)} heures`;
    
      const days = hours / 24;
      if (days < 30) return `il y a ${Math.round(days)} jours`;
    
      const months = days / 30;
      if (months < 12) return `il y a ${Math.round(months)} mois`;
    
      const years = months / 12;
      return `il y a ${Math.round(years)} ans`;
    }
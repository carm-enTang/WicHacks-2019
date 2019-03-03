/*global $*/
/*global responsiveVoice*/
/*global webkitSpeechRecognition*/

// chrome://flags/#autoplay-policy must be "no user gesture required"

var data = [];
var cart = [];
var query;
var firstrun=true;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function introduction(){ if(firstrun){
	firstrun=false;
	responsiveVoice.speak("Welcome to our site! Our goal is to help you easily shop for groceries online. What grocery would you like to shop for?");
	await sleep(1000);
	while(responsiveVoice.isPlaying()){ await sleep(100); }
	startDictation();
	console.log("listening");
}}

function readData(){
	responsiveVoice.speak("Here are the results for " + query);
	for(var j = 0; j < data.length;j++){
		responsiveVoice.speak(data[j]);
	}
}

function runSerch(){
	data = [];
	query =  $("input").val();
	var tt;
	var p
	var settings = {
	  "async": false,
	  "crossDomain": true,
	  "url": "https://api.wegmans.io/products/search?query="+query+"&api-version=2018-10-18&subscription-key=ee199fdfe5a748f5af39308164b845e2",
	  "method": "GET",
	  "headers": {
	    "cache-control": "no-cache",
	    "Postman-Token": "6d2edf61-1888-41e0-8d66-696a5730e677"
	  }
	}
	$.ajax(settings).done(function (response) {
	  tt = response;
	});
		for(var i = 0; i<Math.min(10,tt.results.length); i++){
	    	settings.url = "https://api.wegmans.io/products/"+tt.results[i].sku+"/prices?api-version=2018-10-18&subscription-key=ee199fdfe5a748f5af39308164b845e2"
	        $.ajax(settings).done(function (response) {
	  			p = response.stores[0].price;
			});
	        data[i] = tt.results[i].name + ": $" + p;
	    }
	//alert(data);
	var txt = "";
	for(var j = 0; j < data.length;j++){
		txt = txt + "\n"+ data[j];
	}
	document.getElementById('results').innerHTML = txt;
	
	readData();
	menu();
}

function startDictation() {

    if (window.hasOwnProperty('webkitSpeechRecognition')) {

      var recognition = new webkitSpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.lang = "en-US";
      recognition.start();

      recognition.onresult = function(e) {
        document.getElementById('transcript').value
                                 = e.results[0][0].transcript;
        console.log(document.getElementById('transcript').value);
        recognition.stop();
       // document.getElementById('labnol').submit();
        runSerch();
      };

      recognition.onerror = function(e) {
        recognition.stop();
      }

    }
  }


function menuDictation() {

    if (window.hasOwnProperty('webkitSpeechRecognition')) {

      var recognition = new webkitSpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.lang = "en-US";
      recognition.start();
	var tmp;
      recognition.onresult = function(e) {
        tmp = e.results[0][0].transcript;
	tmp = tmp.toLowerCase();
        console.log(document.getElementById('transcript').value);
        recognition.stop();
      };

      recognition.onerror = function(e) {
	tmp = "ERROR";
        recognition.stop();
      }
	return tmp;
    }
  }




async function menu(){
	var user = "";	
	var options = "If you would like to add an item to the cart, say 'add (item name) to cart'." + 
	"If you would like to hear the search results again, say 'repeat list'." + 
	"If you would like to search another product, say 'search' followed by what you would like to search for.";
	responsiveVoice.speak(options);
	while(true){
		await sleep(1000);
		while(responsiveVoice.isPlaying()){ await sleep(100); }
		user = menuDictation();
		await sleep(1000);
		console.log(user);
		if(user == undefined){
			responsiveVoice.speak("I'm sorry, I didn't hear you please try again." + options);
		}else if(user == "ERROR"){
			responsiveVoice.speak("An error has occurred please try again");
		}else{break;}
	}
	if(user.includes("repeat")){
		readData();	
		menu();
		return;	
	}
	var tmp;	
	if(user.includes("add") && user.includes("to cart")){
		var added = false;
		for(var i = 0; i<data.length;i++){
			tmp = data[i];		
			if(tmp.includes(user.replace("add ","").replace(" to cart",""))){
				cart[cart.length] = data[i];
				added = true;
			}
		}
		if(!added){
			responsiveVoice.speak("I was unable to find that item.");
			menu();
			return;
		}
		while(true){
			responsiveVoice.speak("Would you like to check out? (yes/no)");
			user = menuDictation();
			if(user == "yes"){
				//		[insert checkout thing here]		
				return;
			}else if (user == "no"){
				menu();
				return;
			}
		}
	}
	
	if(user.includes("search")){
		query = user.replace("search","");
		runSerch();
	}
}



/*
function addToCart(item)
{
	if response.contains("cart")
		{ cart.push(item); }
}*/

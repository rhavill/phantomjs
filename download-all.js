var webPage = require('webpage');
var fs = require('fs');
var page = webPage.create();
var util = require("util");
var config = require('./download-all-config');

var loadInProgress = false,
	testindex = 0;
page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.onLoadStarted = function() {
  loadInProgress = true;
  console.log("load started");
};

page.onLoadFinished = function() {
  loadInProgress = false;
  console.log("load finished");
};

var steps = [
  function() {
    //Load Login Page
    page.open(config.loginUrl);
  },
  function(config) {
  	
    //Enter Credentials
    page.evaluate(function(config) {
    	console.log(config.username);
		var	email = document.getElementById('UserEmail');
		var	password = document.getElementById('UserPassword');
		email.value = config.username;
		password.value = config.password;
		return;
    }, config);
  }, 
  function() {
    //Login
	page.evaluate(function() {
		console.log(document.getElementById('UserEmail').value);
		console.log(document.getElementById('UserPassword').value);
	    var loginForm = document.getElementById('UserLoginForm');
	    loginForm.submit();
	    return;
    });
  }, 
  function() {
    // Output content of page to stdout after form has been submitted
    page.evaluate(function() {
    	//console.log('blah');
    	//console.log('text '+ $("body").text());
      	//console.log(document.querySelectorAll('html')[0].outerHTML);
      	var scripts = document.getElementsByTagName('script');
      	for (i=0; i < scripts.length; i++) {
      		console.log(scripts[i].getAttribute("src"))
      	}
    });
  }
];


interval = setInterval(function() {
  if (!loadInProgress && typeof steps[testindex] == "function") {
    console.log("step " + (testindex + 1));
    steps[testindex](config);
    testindex++;
  }
  if (typeof steps[testindex] != "function") {
    console.log("test complete!");
    phantom.exit();
  }
}, 50);
// page.onError = function(msg, trace) {

//   var msgStack = ['ERROR: ' + msg];

//   if (trace && trace.length) {
//     msgStack.push('TRACE:');
//     trace.forEach(function(t) {
//       msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
//     });
//   }

//   console.error(msgStack.join('\n'));

// };


// function login(config) {
// 	var cookie = null;
// 	var data = 
//     page.open(config.loginUrl, 'post', config.loginData, function (status) {
// 	    if (status !== 'success') {
// 	        console.log('Unable to login!');
// 	    } 
// 	    else {
// 	    	console.log(util.inspect(page.cookies));
// 	    	//console.log('CAKEPHP cookie '+page.cookies['CAKEPHP'])
// 	    //	return page.cookie;
// 	    }
// 		page.open(config.logoutUrl, function (status) {
// 		    if (status !== 'success') {
// 		        console.log('Unable to logout!');
// 		    } 
// 		    else {
// 		    	console.log('Logged out.');
// 		    }
// 			phantom.exit();
// 		});
// 	});
// }

// function logout(config) {
// }
// login(config);

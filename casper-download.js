var config = require('./download-all-config');
var fs = require('fs');
var casper = require('casper').create({
  //verbose: true,
  //logLevel: 'debug'
});
casper.userAgent('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:28.0) Gecko/20100101 Firefox/28.0');

casper.on('error', function(msg,backtrace) {
  this.echo("=========================");
  this.echo("ERROR:");
  this.echo(msg);
  this.echo(backtrace);
  this.echo("=========================");
});

casper.on("page.error", function(msg, backtrace) {
  this.echo("=========================");
  this.echo("PAGE.ERROR:");
  this.echo(msg);
  this.echo(backtrace);
  this.echo("=========================");
});

var scripts = [],
	links = [];

function downloadPage() {
	var currentUrl = this.getCurrentUrl();
	var path = currentUrl.replace(config.baseUrl, '');
	// Remove the leading slash "/"
	path = path.substring(1, path.length);
	var parts = path.split('/');
	var fileName = parts.pop();
	var destination = config.downloadDir + '/' + parts.join('/');
	this.echo('Downloading '+path+ ' '+this.getTitle()+' '+destination);
	checkDirectory(destination);
	this.download(currentUrl, destination + '/' + fileName + '.html');

	var scripts = this.evaluate(getScripts);
	this.echo(scripts);
}

function checkDirectory(dir) {
	if (fs.exists(dir)) {
		if (fs.isDirectory(dir)) {
			return true;
		}
		else {
			console.log('Problem: '+dir+' exists as a file.');
			return false;
		}
	}
	else {
		fs.makeTree(dir);
		return true;
	}
}

function getScripts() {
    var scriptElements = document.querySelectorAll('script');
    var scripts = [];
    for (var i=0; i < scriptElements.length; i++) {
    	if (scriptElements[i].getAttribute('src')) {
    		scripts.push(scriptElements[i].getAttribute('src'));
		}    	
    }
    // return Array.prototype.map.call(scripts, function(e) {
    // 	if (e.getAttribute('src')) {
    // 		return e.getAttribute('src');
    // 	}
    // });
	return scripts;
}

function getLinks() {
    var links = document.querySelectorAll('a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}

function downloadPages(baseUrl, paths) {
	for (var i = 0; i < paths.length; i++) {
		var url = baseUrl + paths[i];
		console.log('url '+url);
		casper.thenOpen(url).then(function() {
			// Set the status style based on server status code
			var status = this.status().currentHTTPStatus;
			switch(status) {
				case 200: var statusStyle = { fg: 'green', bold: true }; break;
				case 404: var statusStyle = { fg: 'red', bold: true };
					break;
				default: var statusStyle = { fg: 'magenta', bold: true }; break;
			}
			// Display the spidered URL and status
			// this.echo(this.colorizer.format(status, statusStyle) + ' ' + url);
			this.echo(this.colorizer.format(status, statusStyle) + ' ' + this.getCurrentUrl());
			//var dl = this.evaluate(downloadPage);
			downloadPage.call(this, 'bro');
			// Find links present on this page
			var links = this.evaluate(getLinks);
				
			
			//this.echo(dl);
		});
	}
}

casper.start(config.loginUrl, function () {
  // this.fill(config.loginFormSelector, { config.loginUsernameField: config.username, config.loginPasswordField: config.password },true);
  this.fill('form', { '_username': config.username, '_password': config.password },true);
});
casper.then(function() {
	downloadPages(config.baseUrl, config.downloadPaths);
});
casper.thenOpen(config.logoutUrl, function() {
	this.echo('Logged out.');
});	
// // casper.then(function() {
// //     this.evaluateOrDie(function() {
// //     	console.log(document.body.innerText);
// //         return document.body.innerText;
// //     }, 'Login failed');
// // });
// // casper.start(config.baseUrl, function() {
// //     this.echo(this.getTitle());
// // });

// casper.thenOpen(config.baseUrl, function() {
//     //this.echo(this.getTitle());
//     console.log(this.getHTML());
//     //this.download(this.getCurrentUrl(), 'temp.html');
//     scripts = this.evaluate(getScripts);

// });

casper.run(function() {
    // echo results in some pretty fashion
    //this.echo(scripts.length + ' scripts found:');
    //this.echo(' - ' + scripts.join('\n - ')).
    for (var i = 0; i < scripts.length; i++) {
    	//this.echo(scripts[i].code);
    }
    this.exit();
});
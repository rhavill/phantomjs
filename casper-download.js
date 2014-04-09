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
	checkDirectory(destination);
	this.download(currentUrl, destination + '/' + fileName + '.html');

	var scripts = this.evaluate(getScripts);
	downloadAssets.call(this, scripts);
}

function downloadAssets(urls) {
	for (var i=0; i < urls.length; i++) {
		if (urls[i].indexOf('http://') !== 0) {
			urls[i] = config.baseUrl + urls[i];
		}	
		var path = urls[i].replace(config.baseUrl, '');
		//console.log('url:'+urls[i], 'path:'+path);
		// Remove the leading slash "/"
		path = path.substring(1, path.length);
		var parts = path.split('/');
		var fileName = parts.pop();
		var destination = config.downloadDir + '/' + parts.join('/');
		checkDirectory(destination);
		this.download(urls[i], destination + '/' + fileName);
	}
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
		//console.log('url '+url);
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
			if (status == 200) {
				downloadPage.call(this);
				var links = this.evaluate(getLinks);
			}
		});
	}
}

casper.start(config.loginUrl, function () {
	// First, fill-out the login form.
	var cred = {};
	cred[config.usernameField] = config.username;
	cred[config.passwordField] = config.password
   	this.fill(config.loginFormSelector, cred, true);
});
casper.then(function() {
	downloadPages(config.baseUrl, config.downloadPaths);
});
casper.thenOpen(config.logoutUrl, function() {
	this.echo('Logged out.');
});	

casper.run(function() {
    this.exit();
});
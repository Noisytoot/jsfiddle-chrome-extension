Spark.ready(function() {
	// Check if they need to configure the extension
	if(localStorage['username'] === undefined) {
		// Try to grab it automatically
		Spark.ajax('get', 'http://jsfiddle.net/user/get_username/', false, function(username) {
			if(username == '') {
				// Show the 'You need to configure' message
				Spark('div#configure').transition('fadein');
			}
			else {
				// Auto configure the username
				localStorage['username'] = username;
				
				// Load their fiddles
				setupFiddles();
			}
		});
	}
	// Otherwise, load their fiddles
	else {
		setupFiddles();
	}
	
	// Set up the transitions between editing and viewing fiddles
	Spark('a#openCreateFiddle').event('click', function() {
		Spark('div#viewFiddle').transition('fadeout', 300, function() {
			Spark('div#createFiddle').transition('fadein', 300);
		});
	});
	
	Spark('a#openViewFiddle').event('click', function() {
		Spark('div#createFiddle').transition('fadeout', 300, function() {
			Spark('div#viewFiddle').transition('fadein', 300);
		});
	});
});

// Grabs all of the fiddles, builds the html and displays it.
function setupFiddles() {
	// Make the asynchronous AJAX call
	Spark.ajax('GET', 'http://jsfiddle.net/api/user/' + localStorage['username'] + '/demo/list.json', 'limit=100', function(json) {
		// Set up the variables
		var built = '';
		var revision = '';
		
		// Decode the JSON retrieved by the API
		var list = Spark.json('decode', json);
		
		// Loop through all of the fiddles in the list
		for(var l in list) {
			// If there is a history show the latest one (this needs tweeking)
			if(list[l].latest_version > list[l].version) {
				revision = ' (<a href="' + list[l].url + list[l].latest_version + '/" target="_blank">Revision ' + list[l].latest_version + '</a>)'
			}
			else {
				revision = '';
			}
			
			// Build the HTML string
			// Create the li and a to contain the fiddle link
			built += '<li><a href="' + list[l].url + '" target="_blank">';
			
			//  Display the fiddles title and revision (revision set up above) and close the a
			built += '<strong>' + list[l].title + revision + '</strong></a>';
			
			// Add the description with a dash if there is a description
			built += ((list[l].description != '') ? ' - ' + list[l].description : '');
			
			// Break the line and add the preview link
			built += '<br /><a href="javascript:void(0)" class="toggle" id="e' + l + '">Preview</a>';
			
			// Add the iframe with the url as its inner html, this is then loaded into the src via JavaScript when it is shown an
			// If this strange method is not used then it lags when you open it because 30 iframes all load at once
			// Finnaly, we close the li
			built += '<iframe id="e' + l + '" style="display: none">' + list[l].url + list[l].latest_version + '/show/</iframe></li>';
		}
		
		// Drop the built HTML into the UL
		Spark('ul').html(built);
		
		// Fade the fiddles in
		Spark('div#viewFiddle').transition('fadein', 300, function() {
			// Listen for a click of a toggle editor link
			Spark('a.toggle').event('click', function(e) {
				// Get the iframe
				var el = Spark('iframe#' + e.target.id).attribute();
				
				// Check if we need to show or hide
				if(Spark(el).css().display == 'none') {
					// Loop through all of the iframes
					Spark('iframe').each(function(element) {
						// If the current element's display is set to block
						if(Spark(element).css().display == 'block') {
							// Fade it out
							Spark(element).transition('fadeout', 200);
						}
					});
					
					// Load the page
					el.src = el.innerHTML;
					
					// Show the appropriate iFrame
					Spark(el).transition('fadein');
				}
				else {
					// Hide the appropriate iFrame
					Spark(el).transition('fadeout');
				}
			});
		});
	});
}

// This function is run when the framework or dependencies are changed, it appends the forms action
function changeAction(framework, dependencies) {
	// So here we are appending the selected framework
	// If dependencies is not empty we append that too
	Spark('form').attribute({action: 'http://jsfiddle.net/api/post/' + framework + '/' + ((dependencies == '') ? '' : 'dependencies/' + dependencies + '/')});
}
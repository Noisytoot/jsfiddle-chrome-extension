var $ = Spark;





$.ready(function() {


    // Display messages
    function throw_message( msg ) {
			$( '#status' ).html( msg ).css().display = 'block';
      window.setTimeout( function() {
        $( '#status' ).html( '' ).css().display = 'none';
			}, 2000 );
    }
	
	
	// Hashlistener
	window.addEventListener( 'hashchange', function( e ) {
    var hash = window.location.hash.replace( /\#\//, '' );
    
    // If action 'login' show login-field
    if ( hash == 'login' ) {
      $( '#login' ).css().display = 'block';
      $( 'header .action' ).attribute({ 'href' : '#/' });
    
    
    // New fiddle
    } else if ( hash == 'new' ) {
			$('#create').css().display = 'block';
		  $( '#conf' ).css().display = 'none';


    // View existing fiddle
    } else if ( hash == 'fiddles' ) {
			$('#viewFiddle').css().display = 'block';
		
		
		// Logout
		} else if ( hash == 'logout' ) {
		  localStorage.clear();
		  $( '#create' ).css().display = 'none';
		  $( '#conf' ).css().display = 'block';
		  $( 'header .action' ).html( 'Login' );
		  
		  $( 'header fieldset' ).css().display = 'block';
      $( 'header .nav' ).css().display = 'none';
      
      // Show Message
      throw_message( 'You were logged out.' );
		  
		// otherwise
    } else {
      $( '#login' ).css().display = 'none';
      $( 'header .action' ).attribute({ 'href' : '#/login' });
    }
	});
	
	
	// Remove any Hash on load if one is set
	if ( window.location.hash ) {
    window.location.hash = '#';
	}
	
	
	
	
	
	
	// Keypress-event on 'login'
	$( 'header input' ).event( 'keypress', function( e ) {

		// If 'enter'
		if ( e.keyCode == 13 ) {
			// Set username
			localStorage['username'] = e.target.value;
			
			window.location.href = '#/new';
			$( 'header .action' ).html( localStorage['username'] ).attribute({ 'href' : '#/login' });
		  $( '#login' ).css().display = 'none';
      $( 'header fieldset' ).css().display = 'none';
      $( 'header .nav' ).css().display = 'block';
			
			// Show that it was set
			throw_message( 'You are logged in as <em>' + e.target.value + '</em>.' );
		}
	});
	
	
	
	
	
	// Check if they need to configure the extension
	if ( localStorage['username'] === undefined ) {
	
		// Try to grab it automatically
		$.ajax( 'get', 'http://jsfiddle.net/user/get_username/', false, function( username ) {
			if ( username == '' ) {
				// Show the 'You need to configure' message
				$( '#configure' ).transition( 'fadein' );
			} else {
				// Auto configure the username
				localStorage['username'] = username;

				// Load their fiddles
				setupFiddles();
			}
		});
  

  // If username is already defined
	} else if ( localStorage['username'] !== undefined ) {
		$( 'header .action' ).html( localStorage['username'] );
		$( 'header input' ).attribute({ value : localStorage['username'] });
				
		window.location.href = '#/new';
    $( 'header fieldset' ).css().display = 'none';
    $( 'header .nav' ).css().display = 'block';

    
    // Otherwise, load users fiddles
		setupFiddles();
	}
	
	
	
	// If click on link in menu
	$( '#login a' ).event( 'click', function( e ) {
    $( '#login' ).css().display = 'none';
    $( 'header .action' ).attribute({ 'href' : '#/login' });
	});
	
	
	// If click in textarea
	$( '.field textarea' ).event( 'focus', function( e ) {
	  $( e.target.previousElementSibling ).transition( 'fadeout' );
  });
  
	$( '.field textarea' ).event( 'blur', function( e ) {
	  $( e.target.previousElementSibling ).transition( 'fadein' );
  });
	
	
	
	
	
});

// Grabs all of the fiddles, builds the html and displays it.
function setupFiddles() {
	// Make the asynchronous AJAX call
	$.ajax('GET', 'http://jsfiddle.net/api/user/' + localStorage['username'] + '/demo/list.json', 'limit=100', function(json) {
		// Set up the variables
		var built = '';
		var revision = '';
		
		// Decode the JSON retrieved by the API
		var list = $.json('decode', json);
		
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
		// $('ul').html( built );
		
		// Fade the fiddles in
		$('div#viewFiddle').transition('fadein', false, false, function() {
			// Listen for a click of a toggle editor link
			$('a.toggle').event('click', function(e) {
				// Get the iframe
				var el = $('iframe#' + e.target.id).attribute();
				
				// Check if we need to show or hide
				if($(el).css().display == 'none') {
					// Loop through all of the iframes
					$('iframe').each(function(element) {
						// If the current element's display is set to block
						if($(element).css().display == 'block') {
							// Fade it out
							$(element).transition('fadeout');
						}
					});
					
					// Load the page
					el.src = el.innerHTML;
					
					// Show the appropriate iFrame
					$(el).transition('fadein');
				}
				else {
					// Hide the appropriate iFrame
					$(el).transition('fadeout');
				}
			});
		});
	});
}

// This function is run when the framework or dependencies are changed, it appends the forms action
function changeAction(framework, dependencies) {
	// So here we are appending the selected framework
	// If dependencies is not empty we append that too
	$('form').attribute({action: 'http://jsfiddle.net/api/post/' + framework + '/' + ((dependencies == '') ? '' : 'dependencies/' + dependencies + '/')});
}
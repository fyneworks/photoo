


// -------------------------------------------------------------
// 
// Cloudinary
// 
// -------------------------------------------------------------

var cloudi = { cloud_name: 'photoo', api_key: '929151566573869'};
$.cloudinary.config(cloudi);



// -------------------------------------------------------------
// 
// Business Logic
// 
// -------------------------------------------------------------

var photoo = {};

photoo.fb = function(callback){
	return photoo.fb.me(callback);
};

$.extend(photoo.fb, {

	me: function(callback){
		photoo.fb.loggedIn(function(){
			FB.api('/me',function(response){
				callback(response);
			});            
		});
	},

	loggedIn: function(loggedIn, loggedOut){
			FB.getLoginStatus(function(response){
					console.log('FB.getLoginStatus response',response);
					//photoo.fb.state(response);
					if(response && response.authResponse){
							console.log('FB.getLoginStatus response = loggedIn',loggedIn,response);
							if(loggedIn){
								loggedIn();
							}
							//photoo.fb.me(loggedIn);
							//fwx_fb_loggedIn(response);
							//if(loggedIn) loggedIn(response);
					}
					else{
							console.log('FB.getLoginStatus response = loggedOut',loggedOut,response);
							//fwx_fb_loggedOut(response);
							if(loggedOut){
								loggedOut();
							}
							console.log('FB.getLoginStatus response = loggedOut > invoke login');
							photoo.fb.login(loggedIn);
					}
			});
	},

	login: function(callback, options){
			FB.login(
					function(response) {
							if (response.authResponse) {
									
									photoo.fb.me(function(info) {
											//fwx_fb_loggedIn(response, info);
											if(callback){
												callback(response);
											}
									});
							}
							else{
									//user cancelled login or did not grant authorization
									//fwx_fb_working(false);
							}
					},
					$.extend({scope:'email,user_birthday,status_update,publish_stream,user_about_me'}, options || {})
			);   
	},

	logout: function(callback){
		FB.logout(function(response){
			//fwx_fb_loggedOut(response);
			if(callback){
				callback(response);
			}
		});
	},

	state: function(response){
    console.log('photoo.fb.state response', response);
    var b = response && response.authResponse;

    // show hide elements based on login status
    $('.fb-on')[b?'show':'hide']();
    $('.fb-off')[b?'hide':'show']();

    // set active flag
    photoo.fb.active = b;
	},
	
	init: function(callback){
		console.log('photoo>fb> init');
		$.ajaxSetup({ cache: true });

		$.getScript('//connect.facebook.net/en_US/sdk.js', function(){

			// Start FB API
			var ID = '474837086041194';
			if(!ID){
				console.error('Missing Facebook App ID');
				return false;
			}
			else{
				console.log('Facebook loaded', FB);
			}
			FB.init({
				appId: ID, //change the appId to your appId
				status: true, 
				cookie: true,
				xfbml: true,
				oauth: true
			});
			
			// run once with current status and whenever the status changes
			FB.getLoginStatus(photoo.fb.state);
			FB.Event.subscribe('auth.statusChange', photoo.fb.state);  
			
			// universal analytics integration
			FB.Event.subscribe('edge.create', function(targetUrl) {
				//if(window.ga) ga('send', 'social', 'facebook', 'like', targetUrl);
				//if(window._gaq) _gaq.push(['_trackSocial', 'facebook', 'like', targetUrl]);
			});

		});
	},

	load: function(callback){
		console.log('photoo>fb> load');
		var e = document.createElement('script'); e.async = true;
				e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
		document.getElementById('fb-root').appendChild(e);

	}

});

window.fbAsyncInit = function(){
	photoo.fb.init();
};
$(document).ready(function() {
	photoo.fb.load();
});

/* 

(function() {
var e = document.createElement('script'); e.async = true;
		e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
document.getElementById('fb-root').appendChild(e);
}());

<div id="fb-root"></div>

*/



// -------------------------------------------------------------
// 
// EVENTS
// 
// -------------------------------------------------------------

$(function(){

	$('body')

		.off('click.select-flag')
		.on('click.select-flag', '#photoo-overlay-area .flags img', function(event){
			event.preventDefault();

			var e = $(event.currentTarget);
			var ovr = e.data('ovr').replace('/',':')+ '';
			console.log('ovr',ovr);
			var img = $('#photoo-overlay-area .photo');
			console.log('img',img);
			var uid = img.data('uid');
			console.log('uid',uid);

			img.attr('src',
				$.cloudinary.url(
					uid + ".png",
					{
						gravity: "center",
						overlay: ovr,
						type: "facebook"
					}
				)
			);

		})

		.off('click.facebook-login')
		.on('click.facebook-login', '.facebook-login', function(event){
			event.preventDefault();

			photoo.fb.me(function(user){

				user.name = user.name || user.first_name;
				
				var area = $('#photoo-overlay-area').removeClass('dead').addClass('live');

				var hello = area.find('.hello').html('Hi '+ user.name);

				var photo = area.find('.photo').data('uid', user.id).attr('src','https://res.cloudinary.com/photoo/image/facebook/w_300/'+user.id+'.jpg');

				var flags = area.find('.flags').html('');

				$.get(
					$.cloudinary.url('flags',
						{
							format: 'json', 
							type: 'list'
						}),
					function(data){
						if(data && data.resources){
							$.each(data.resources, function(i, r){
								var ovr = r.public_id,
										src = 'https://res.cloudinary.com/photoo/image/upload/w_50/'+ovr+'.png',
										img = $('<img/>')
														.data('ovr',ovr)
														.attr('src',src)
										;
								flags.append(img);
							});
						}
					}
				);

			});

		})

	;

});


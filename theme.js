"use strict";

jQuery(function($) {


	/*-----------------------------------------------------------------------------------*/
	/*	0a. CUSTOM FUNCTIONS
	/*-----------------------------------------------------------------------------------*/
	var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;

    function onYouTubeIframeAPIReady() {
        player = new YT.Player('about-video', {
            events: {
                'onReady': onPlayerReady
            }
        });
    }

    function onPlayerReady() {
        player.playVideo();
        // Mute!
        player.mute();
    }


	var now = new Date(2015,7,30,0,0,0);
    console.log(now);
	var countTo = now.valueOf();    
	$('.timer').countdown(countTo, function(event) {
		$(this).find('.days').text(event.offset.totalDays);
		$(this).find('.hours').text(event.offset.hours);
		$(this).find('.minutes').text(event.offset.minutes);
		$(this).find('.seconds').text(event.offset.seconds);
	});


	/*-----------------------------------------------------------------------------------*/
	/*	00. HELPER FUNCTIONS
	/*-----------------------------------------------------------------------------------*/

	function unLoadSite(time) {
		$('body').removeClass('site-loaded');
		$('.preloader').fadeIn(time);
	}

	function loadSite(time) {
		if( time == "" ) {
			time = 800;
		}
		
		$('body').addClass('site-loaded');
		$('.preloader').fadeOut(time);
	}

	function changeLogo(logo, logoURL, logoLightURL) {
		if( $('body').hasClass('nav-open') ||
			$('body').hasClass('background--dark') &&
			! $('body').hasClass('nav-scroll-active') ) {
			logo.attr('src', logoLightURL);
		} else {
			logo.attr('src', logoURL);
		}
	}

	/*-----------------------------------------------------------------------------------*/
	/*	01. PARALLAX
	/*-----------------------------------------------------------------------------------*/

	$('.parallax').each(function(index, el) {
		$(el).parallax("50%", 0.6);
	});

	/*-----------------------------------------------------------------------------------*/
	/*	02. HEADER NAVIGATION
	/*-----------------------------------------------------------------------------------*/

	// Open/Close navigation

	var logo = "";
	var logoURL = "";
	var logoLightURL = "";

	if( $('.site-logo').attr('data-light') ) {
		logo = $('.site-logo').find('img');
		logoURL = $('.site-logo').find('img').attr('src');
		logoLightURL = $('.site-logo').attr('data-light');

		changeLogo(logo, logoURL, logoLightURL);
	}

	$('.nav-toggle').on('click', function() {
		$('body').toggleClass('nav-open');

		if( $('.site-logo').attr('data-light') ) {
			changeLogo(logo, logoURL, logoLightURL);
		}
	});

	// Close navigation on clicking on a menu link

	$('.nav-menu a').on('click', function() {
		$('body').removeClass('nav-open');
	});

	// Scrolling menu change

	if( $('.nav-sticky').length ) {
		$(window).scroll(function() {
			if ($(window).scrollTop() >= 80) {
				$('body').addClass('nav-scroll-active');
			} else {
				$('body').removeClass('nav-scroll-active');
			}

			if( $('.site-logo').attr('data-light') ) {
				changeLogo(logo, logoURL, logoLightURL);
			}
		});
	}

	// Add scroll animation on anchor links

	$('.nav-menu a[href*=#]:not([href=#]), .tp-caption[href*=#]:not([href=#])').click(function() {
	  if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') 
	      || location.hostname === this.hostname) {
	    var target = $(this.hash);
	    var href = $.attr(this, 'href');
	    var mobile = 0;

	    if( $(window).width() < 992 ) {
	    	mobile = -75;
	    }
	    target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
	    if (target.length) {
	      $('html,body').animate({
	        scrollTop: target.offset().top + mobile
	      }, 1000, function () {
	          window.location.hash = href;
	      });
	      return false;
	    }
	  }
	});

	/*-----------------------------------------------------------------------------------*/
	/*	03. PORTFOLIO
	/*-----------------------------------------------------------------------------------*/

	if( $('.portfolio').length ) {
		var portfolioJSON = $('.portfolio[data-json]');
		var portfolioData = '';
		var $portfolio = $('.portfolio');

		if( portfolioJSON.length ) {
			$.ajax({
		    	url: portfolioJSON.attr('data-json'),
				cache: false,
				success: function(data) {
					portfolioData = data;

					var max = data.length,
						filter = [];

					if( max > portfolioJSON.attr('data-page') ) {
						max = portfolioJSON.attr('data-page');
					}

					// Filter

					for(var i=0; i<data.length; i++) {
						for(var j=0; j<data[i].categories.length; j++) {
							if( filter.indexOf(data[i].categories[j]) < 0 ) {
								filter.push(data[i].categories[j]);

								$('.filter ul').append($('<li><button data-filter=".' + data[i].categories[j].toLowerCase().replace(/\s/g, '-') + '">' + data[i].categories[j] + '</button></li>'));
							}
						}
					}

					// New elements

					for(var i=0; i<max; i++) {
						portfolioJSON.append(portfolioItem(data[i]));
					}

					if( max === portfolioData.length ) {
						$('.portfolio-more button').attr('disabled', true);
					}

					portfolioInit();
				}
			});
	    }

	    $('.portfolio-more button').on('click', function() {
			var max   = parseInt(portfolioJSON.attr('data-page'));
			var cur   = parseInt(portfolioJSON.find('.portfolio-item').length);

			if( max + cur >= portfolioData.length ) {
				max = portfolioData.length;
				$(this).attr('disabled', true);
			} else {
				max += cur;
			}

	    	for(var i=cur; i<max; i++) {
				$portfolio.isotope( 'insert', portfolioItem(portfolioData[i]) );
	    	}

	    	 $('.portfolio').imagesLoaded( function() {
	    	 	$portfolio.isotope('layout');
	    	 });
	    });

	    if( ! portfolioJSON.length ) {
			portfolioInit();
	    }

	    /* External Portfolio AJAX Links */

	    $('[data-portfolio-external-url]').on('click', function(e) {
	    	var temp = $('.portfolio-item a[href="' + $(this).attr('href') + '"]');

	    	if( temp.length ) {
	    		temp.click();

		    	e.preventDefault;
		    	return false;
	    	} else {
	    		portfolioAJAX($(this), e, true);
	    	}
	    });
	}

	function portfolioItem(data) {
		// Item classes
		var itemClass = 'portfolio-item';

		if( data.large ) {
			itemClass += ' portfolio-large';
		}

		for(var j=0;j<data.categories.length;j++) {
			itemClass += ' ' + data.categories[j].toLowerCase().replace(/\s/g, '-');
		}

		// Create all the parts
		var item = $('<article>', { 'class': itemClass })
			.append($('<a>',      { 'href': data.url }).on('click', function(e) {
				portfolioAJAX( $(this), e );
			}).append($('<img>',    { 'src': data.image, 'alt': data.name }))
			.append($('<div>',    { 'class': 'hover' })
			.append($('<div>',    { 'class': 'hover-content' })
			.append($('<h5>',     { 'html': data.name }))
			.append($('<span>',   { 'html': data.categories.join(' / ') }))))
		);

		return item;
	}

	function portfolioAJAX(org, e, external) {
		if( !org.hasClass('porftolio-post-close') ) {
			unLoadSite(100);
		}
		
		$.ajax({
		  url: org.attr('href'),
		  cache: false,
		  success: function(html) {
		    $('body').append('<div class="portfolio-content">' + html + '</div>');

			$('.porftolio-post-close').on('click', function() {
				$('body').removeClass('portfolio-ajax-active');
			});

			$('.porftolio-post-prev, .portfolio-nav .prev').on('click', function(e) {
				if( external ) {
					$('.portfolio-item:last-of-type').find('a').click();
				} else {
					org.parent().prev().find('a').click();
				}

				e.preventDefault();
				return false;
			});

			$('.porftolio-post-next, .portfolio-nav .next').on('click', function(e) {
				if( external ) {
					$('.portfolio-item:first-of-type').find('a').click();
				} else {
					org.parent().next().find('a').click();
				}

				e.preventDefault();
				return false;
			});

		    $('portfolio-content').imagesLoaded(function() {
				$('body').addClass('portfolio-ajax-active');
				
				loadSite(500);

				waypointsAnimations('.portfolio-content', 'bottom-in-view');
		    });
		    
		  }
		});

		e.preventDefault(); 
		return false;
	}

    function portfolioInit() {
		var layoutMode = 'masonry';
		if( $('.portfolio-4-columns').length ) {
			layoutMode = 'fitRows';
		}
		var $portfolio = $('.portfolio').imagesLoaded( function() {
			$portfolio.isotope({
				itemSelector: '.portfolio-item',
				layoutMode: layoutMode
			}).isotope('layout');
		});

		$('.filter').on( 'click', 'button', function() {
			var filterValue = $(this).attr('data-filter');
			$portfolio.isotope({ filter: filterValue });

			$('.filter .selected').removeClass('selected');
			$(this).addClass('selected');
		});

		if( $('.portfolio-ajax').length ) {
			$('.portfolio-ajax a').on('click', function(e) {
				portfolioAJAX( $(this), e );
			});
		}
	}

	/*-----------------------------------------------------------------------------------*/
	/*	04. VIDEOS (for background video, either from YouTube or using the video element)
	/*-----------------------------------------------------------------------------------*/

	if( $.isFunction('mb_YTPlayer') ) {
		$(".player").mb_YTPlayer();
	}

	$(".video video").prop("volume", 0);

	/*-----------------------------------------------------------------------------------*/
	/*	05. SLICK CAROUSEL (testimonials, projects)
	/*-----------------------------------------------------------------------------------*/

	$('.projects').slick();
	$('.testimonials').slick({
		dots: true,
		fade: true,
		arrows: false,
		autoplay: true,
		autoplaySpeed: 5000
	});

	/*-----------------------------------------------------------------------------------*/
	/*	06. INSTAGRAM
	/*-----------------------------------------------------------------------------------*/

	$('.instagram').on('didLoadInstagram', function(event, response) {
		var instagram = {};
		var $url = 'https://api.instagram.com/v1/users/' + response.data[0].id.split('_')[1] + '/?access_token=1554589859.71ed503.20f8b92a2d31453a97db5384e33ce3f9';

		$.ajax({
			method : "GET",
			url : $url,
			dataType : "jsonp",
			jsonp : "callback",
			success : function(dataSuccess) {
				instagram.authorPhoto = dataSuccess.data.profile_picture;
				instagram.followers = dataSuccess.data.counts.followed_by;
				instagram.photos = dataSuccess.data.counts.media;
				instagram.username = dataSuccess.data.username;
				instagram.full_name = dataSuccess.data.full_name;

				var data = response.data;
				var tagNames = [];
				var tagNums = [];
				var tags = [];
				instagram.target = event.currentTarget.id;
				instagram.likes = 0;

				for(var i=0; i<data.length; i++) {
					instagram.likes += data[i].likes.count;

					/* Get tag names and how many are there */
					for(var j=0; j<data[i].tags.length; j++) {
						if(tagNames.indexOf(data[i].tags[j]) === -1) {
							tagNames.push(data[i].tags[j]);
							tagNums.push(1);
						} else {
							tagNums[tagNames.indexOf(data[i].tags[j])]++;
						}
					}
				};

				/* Sort tags array */
				for (var i = 0; i < tagNames.length; i++) { tags.push({ 'name': tagNames[i], 'value': tagNums[i] }); }
				tags.sort(function(a, b) { return b.value - a.value; });

				/* Add instagram photos */

				for(var i=0; i<12; i++) {
					$("#" + instagram.target + ' .instagram-images').append('<li style="background-image: url(' + data[i].images.low_resolution.url + ')"></li>');
				}

				/* Add Instagram User Information */
				$("#" + instagram.target + ' .instagram-author-photo').append('<img src="' + instagram.authorPhoto + '" alt="' + instagram.full_name + '" />');
				for(var i=0; i<4; i++) {
					$("#" + instagram.target + ' .instagram-tags').append('<a href="http://www.enjoygram.com/tag/' + tags[i].name + '" target="_blank">#' + tags[i].name + '</a> ');
				}
				$("#" + instagram.target + ' .instagram-author-tag').append('<a href="http://instagram.com/' + instagram.username + '" target="_blank">#' + instagram.username + '</a>');
				$("#" + instagram.target + ' .num-photos span').html(instagram.photos);
				$("#" + instagram.target + ' .num-followers span').html(instagram.followers);
				$("#" + instagram.target + ' .num-likes span').html(instagram.likes);
				$("#" + instagram.target + ' .instagram-follow').attr('href', 'http://instagram.com/' + instagram.username);
			}
		});
	});

	/*-----------------------------------------------------------------------------------*/
	/*	07. BLOG MASONRY
	/*-----------------------------------------------------------------------------------*/

	if( $('.blog-masonry').length ) {
		var $portfolio = $('.blog-masonry').imagesLoaded( function() {
			$portfolio.isotope({
				itemSelector: '.blog-masonry > div',
				layoutMode: 'masonry'
			});
		});
	}

	/*-----------------------------------------------------------------------------------*/
	/*	08. Preloader
	/*-----------------------------------------------------------------------------------*/

	$('.site').imagesLoaded( function() {
		loadSite();
	});

	setTimeout(loadSite, 10000);

	/*-----------------------------------------------------------------------------------*/
	/*	09. FORMS
	/*-----------------------------------------------------------------------------------*/

	var formElement = $('form[data-form="contact-form"]');

	if( formElement.length ) {
		formElement.validate({
			 submitHandler: function(form) {
			 	$('#contact-form-message').remove();
			 	
		        try {
					$.ajax({
						type: 'POST',
						url: 'http://withcamp.kr/php/mail.php',
						data: {
							form : formElement.serialize(),
						}
					}).success(function(msg) {
						formElement.append('<label id="contact-form-message" class="success">' + msg + '</label>');
					});
		        } catch(e) { console.log(e); }

				return false;
			 }
		});
	}

	$('form[data-form="submit"] input').keypress(function (e) {		
		if (e.which == 13) {
			$(this).parent().submit();
			e.preventDefault(); 
			return false;
		}
	});

	function waypointsAnimations(context, offset) {
		if( $('.animate').length ) {
			$('.animate').waypoint({
			  handler: function() {
			    var el = $(this.element);
			    if( ! el.hasClass('animated') ) {
				    el.addClass('animated');

					if( el.hasClass('counter') ) {
						el.find('span').each(function () {
						    $(this).prop('Counter',0).animate({
						        Counter: $(this).attr('data-val')
						    }, {
						        duration: 3000,
						        easing: 'swing',
						        step: function (now) {
						            $(this).text(Math.ceil(now));
						        }
						    });
						});
					}
				}
			  },
			  offset: offset,
			  context: context
			});
		}
	}
	waypointsAnimations(window, 'bottom-in-view');

	/*-----------------------------------------------------------------------------------*/
	/*	10. Fullscreen Section
	/*-----------------------------------------------------------------------------------*/

	function sectionFs(sectionSelector) {
		if( $(window).height() > 400 ) {
			$(sectionSelector).height($(window).height());
		} else {
			$(sectionSelector).css('height', '');
		}
	}

	var sectionSelector = '.section-fs';

	if( $('.section-scroll').length ) {
		if ( $('.section-fs').eq(0).hasClass('background-dark') ) {
			$('body').addClass('background--dark');
		}

		$(".section-fs-container").onepage_scroll({
			sectionContainer: '.section-fs',
			loop: false,
			updateURL: true,
			afterMove: function(index) {
				if( $('.section-fs').eq(index).hasClass('background-dark') ) {
					$('body').addClass('background--dark');
				} else {
					$('body').removeClass('background--dark');
				}
			}
		});

		$('[data-nav="sections"] a').on('click', function() {
			$('.onepage-pagination [href="' + $(this).attr('href') + '"]').click();
		});

		//uses document because document will be topmost level in bubbling
		$(document).on('touchmove',function(e){
			if( $(window).height() > 400 ) {
				e.preventDefault();
			}
		});
		//uses body because jquery on events are called off of the element they are
		//added to, so bubbling would not work if we used document instead.
		$('body').on('touchstart','.scrollable',function(e) {
		  if (e.currentTarget.scrollTop === 0) {
		    e.currentTarget.scrollTop = 1;
		  } else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
		    e.currentTarget.scrollTop -= 1;
		  }
		});
		//prevents preventDefault from being called on document if it sees a scrollable div
		$('body').on('touchmove','.scrollable',function(e) {
		  e.stopPropagation();
		});

		sectionSelector += ', .section-fs-container';
	}

	if( $('.section-fs').length ) {
		sectionFs(sectionSelector);

		$( window ).resize(function() {
			sectionFs(sectionSelector);
		});
	}

	/*-----------------------------------------------------------------------------------*/
	/*	11. IE9 Placeholders
	/*-----------------------------------------------------------------------------------*/

	$.support.placeholder = ('placeholder' in document.createElement('input'))
	if (!$.support.placeholder) {
		$("[placeholder]").focus(function () {
			if ($(this).val() == $(this).attr("placeholder")) $(this).val("");
		}).blur(function () {
			if ($(this).val() == "") $(this).val($(this).attr("placeholder"));
		}).blur();

		$("[placeholder]").parents("form").submit(function () {
			$(this).find('[placeholder]').each(function() {
				if ($(this).val() == $(this).attr("placeholder")) {
					$(this).val("");
				}
			});
		});
	}
});

/*-----------------------------------------------------------------------------------*/
/*	12. GOOGLE MAPS
/*-----------------------------------------------------------------------------------*/

function map(element, location, zoom) {
	jQuery(element).gmap3({
		map: {
			options: {
				zoom: zoom,
				scrollwheel: false
			}
		},
		getlatlng:{
			address: location,
			callback: function(results) {
			if ( !results ) { return; }
			jQuery(this).gmap3('get').setCenter(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
			jQuery(this).gmap3({
				marker: {
					latLng:results[0].geometry.location,
				}
			});
			}
		}
	});
}
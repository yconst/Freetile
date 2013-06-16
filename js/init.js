;(function($)
{
	$(document).ready(function() 
	{

		// Here all containers are prepared, except for those that hold images.
		// Elements are added to the containers at this stage.
		// First test
		for (i=0;i<40;i++) 
		{
			var w = 64 * (parseInt(Math.random() * 3) + 1) - 1,
				h = 48 * (parseInt(Math.random() * 3) + 1) - 1;
			$('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('.first.test');
		}

		for (i=0;i<1;i++) 
		{
			var w = 64 * (parseInt(Math.random() * 3) + 1) - 1,
				h = 48 * (parseInt(Math.random() * 3) + 1) - 1;
			$('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('.second.test');
		}

		for (i=0;i<10;i++) 
		{
			var w = 64 * (parseInt(Math.random() * 4) + 1) - 1,
				h = 24 * (parseInt(Math.random() * 4) + 1) - 1;
			$('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('.third.test');
		}

		for (i=0;i<2000;i++) 
		{
			var w = 4 * (parseInt(Math.random() * 9) + 1) - 1,
				h = 3 * (parseInt(Math.random() * 9) + 1) - 1;
			$('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('.fourth.test');
		}

		// Make sure the "empty" test is actually empty and call freetile on it.
		$( '.empty.test' ).empty();
        $( '.empty.test' ).freetile(
        {
            callback: function() { $( '.empty.test' ).text( 'Callback from empty container.' ); }
        });

        // Call the testpack function on all non-image containers.
		$('#freetile-demo').children('div').first().each(function()
		{
			$(this).testpack();
		});

	});

	// "testpack" is the main testing function that sequentially calls
	// freetile on every container (using the callback function of the previous
	// freetile instance).
	// If there are no more containers, it calls "testimages", a similar function
	// responsible for testing image containers (below).
	$.fn.testpack = function() 
	{
		var $this = $(this);
		var start = new Date();
		$this.freetile(
		{
			animate: true,
			elementDelay: 10,
			callback: function() 
			{
				var time = new Date() - start,
					prev = $this.prevAll('h4').first();
				prev.html(prev.html() + " (" + time + "ms)");
				var nxt = $this.nextAll('div:not(.images)').first();
				if (nxt.length)
				{
					nxt.testpack();
				}
				else
				{
					$('.images.test').first().testimages();
				}
			}
		});
	}

	// "testimages" is a testing function that handles image containers.
	// It is called as a result of testpack not finding any more normal
	// containers. It's difference is that it first has to fetch and append
	// content from a remote url, before using freetile to pack it.
	$.fn.testimages = function() 
	{
		// Testing image containers
		var $this = $(this);
		$.getJSON('http://apex.yconst.com/feed.json')
		.error(function()
		{
			$this.removeClass('loading').text('Images failed to load.');
		})
		.success(function( data )
		{
		    // proceed only if we have data
		    if ( !data ) 
		    {
		    	$this.removeClass('loading').text('No images found.');
		    	return;
		    }

		    var items = [];
		    var pages = data.pages;

		    if ($this.hasClass('ignore-load-check'))
		    {
		    	pages = pages.slice(0, 9);
		    }
		    else
		    {
		    	pages = pages.slice(9, 18);
		    }
		    for ( var i=0, len = pages.length; i < len; i++ ) 
		    {
		    	var page = pages[i];
		    	items.push(
		    		'<div class="item image"><a href="' + page.url + '"><img src="' + page.thumb + '" /></a></div>'
		    		);
		    }
		    $this.removeClass('loading').append( items.join('') );

		    if ($this.hasClass('ignore-load-check'))
		    {
		    	$this.children().addClass('ignore-load-check').css({'width' : '300px', 'height' : '162px'});
		    }
		    var start = new Date();
			$this.freetile(
			{
				animate: true,
				elementDelay: 10,
				callback: function() 
				{
					var time = new Date() - start,
					prev = $this.prevAll('h4').first();
					prev.html(prev.html() + " (" + time + "ms)");
					var nxt = $this.nextAll('div.images').first();
					if (nxt.length)
					{
						nxt.testimages();
					}
				}
			});
		});
	}

})(jQuery)




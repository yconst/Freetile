;(function($){
	$(document).ready(function() {

		// First test
		for (i=0;i<40;i++) {
			var w = 64 * (parseInt(Math.random() * 3) + 1) - 1,
				h = 48 * (parseInt(Math.random() * 3) + 1) - 1;
			$('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('.first.test');
		}

		for (i=0;i<1;i++) {
			var w = 64 * (parseInt(Math.random() * 3) + 1) - 1,
				h = 48 * (parseInt(Math.random() * 3) + 1) - 1;
			$('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('.second.test');
		}

		for (i=0;i<20;i++) {
			var w = 64 * (parseInt(Math.random() * 4) + 1) - 1,
				h = 48 * (parseInt(Math.random() * 4) + 1) - 1;
			$('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('.third.test');
		}

		for (i=0;i<2000;i++) {
			var w = 4 * (parseInt(Math.random() * 9) + 1) - 1,
				h = 3 * (parseInt(Math.random() * 9) + 1) - 1;
			$('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('.fourth.test');
		}

		$( '.empty.test' ).empty();
        $( '.empty.test' ).freetile({
            callback: function() { $( '.empty.test' ).html( 'Callback from empty container.' ); }
        });

		$('#freetile-demo').children('div').first().each(function()
		{
			$(this).testpack();
			
		});
	});

	$.fn.testpack = function() {
		var $this = $(this);
		var start = new Date();
		$this.freetile({
			animate: true,
			elementDelay: 10,
			callback: function() {
				var time = new Date() - start;
				$this.prev().html($this.prev().html() + " (" + time + "ms)");
				var nxt = $this.nextAll('div').first();
				if (nxt)
				{
					nxt.testpack();
				}
			}
		});
	}
})(jQuery)


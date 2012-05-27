;(function($){
	$(document).ready(function() {
		for (i=0;i<40;i++) {
			var w = 96 * (parseInt(Math.random() * 2) + 1) - 2,
				h = 48 * (parseInt(Math.random() * 3) + 1) - 2;
			$('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('#freetile-demo');
		}
		$('#freetile-demo').freetile({
			animate: true,
			elementDelay: 10
		});
	});
})(jQuery)
				

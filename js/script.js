$(window).load(function(){

	var contact_height = $('.contact').height() - 5; // the 5px of padding at the top creates a nice top border
	// var def_body_margin_top = $(document.body).css('margin-top');
	var transition_time = 200;

	// initialize and show hire-me bar
	$('.contact').css('top', 0 - contact_height).show();

	$('.hire-me').click(function(){
		$(document.body).toggleClass('show-hire-me')
		manage_contact(contact_height, transition_time);
		return false;
	});

	function manage_contact(height, speed){
		if ( $(document.body).hasClass('show-hire-me') ) {
			// SHOW
			$(document.body).animate({ marginTop: height }, speed);
			$('.contact').animate({ top: 0 }, speed);

		} else {
			// HIDE
			$(document.body).animate({ marginTop: 0 }, speed);
			$('.contact').animate({ top: 0 - height }, speed);
		}
	}

	// when window resizes, make sure the contact section doesn't get crazy
	$(window).resize(function(){
		contact_height = $('.contact').height() - 5;
		manage_contact(contact_height, 0);
	});

	$("a[rel*=leanModal]").leanModal({ overlay: 0.5, closeButton: ".modal-close" });

	// need a resize fix for leanModal

	// $('.modal').wrapInner('<div class="bd" />');
	$('.modal .hd').append('<a href="#modal-close" class="modal-close">&#0215;</a>');

});


// leanModal v1.1 by Ray Stone - http://finelysliced.com.au
// Dual licensed under the MIT and GPL

(function($){
 
	$.fn.extend({ 
		 
		leanModal: function(options) {
 
			var defaults = {
				top: 100,
				overlay: 0.5,
				closeButton: null
			}
			
			var overlay = $("<div id='lean_overlay'></div>");

			$("body").append(overlay);
				 
			options =  $.extend(defaults, options);
 
			return this.each(function() {
			
				var o = options;
			   
				$(this).click(function(e) {

			  	var modal_id = $(this).attr("href");

				$("#lean_overlay").click(function() { 
					 close_modal(modal_id);
				});
				
				$(o.closeButton).click(function() {
					 close_modal(modal_id);
				});
						 	
			  	var modal_height = $(modal_id).outerHeight();
			  	var modal_width = $(modal_id).outerWidth();

				$('#lean_overlay').css({ 'display' : 'block', opacity : 0 });

				$('#lean_overlay').fadeTo(200,o.overlay);

				$(modal_id).css({ 
					'display' : 'block',
					'position' : 'fixed',
					'opacity' : 0,
					'z-index': 11000,
					'left' : 50 + '%',
					'margin-left' : -(modal_width/2) + "px",
					// 'top' : o.top + "px"
				});


				$(modal_id).fadeTo(200,1);
					e.preventDefault();
				});

			});

			function close_modal(modal_id){
				$("#lean_overlay").fadeOut(200);
				$(modal_id).css({ 'display' : 'none' });
			}
		}
	});
	 
})(jQuery);

// if user resizes, do magic to fix it
$(window).resize(function() {
	$(".modal").css({
		'left' : 50 + '%',
		'margin-left' : -( $('.modal').outerWidth()/2 ) + "px"
	});
});
// center the overlay
// $(modal_id).css({"left":50+"%","margin-left":-(modal_width/2)+"px","top":o.top+"px"});
//css({"display":"block","position":"fixed","opacity":0,"z-index":11000,"left":50+"%","margin-left":-(modal_width/2)+"px","top":o.top+"px"})




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
	
	// temp disable as links don't work yet
	$('.projects li a').click(function(){
		return false;
	});
	
});

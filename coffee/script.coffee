contactHeight = $('.contact').height() - 5 # the 5px of padding at the top creates a nice top border
# def_body_margin_top = $(document.body).css('margin-top')
transitionTime = 200

manageContact = (height, speed) ->
	if $(document.body).hasClass('show-hire-me')
		# SHOW
		$(document.body).animate({ marginTop: height }, speed)
		$('.contact').animate({ top: 0 }, speed)

	else
		# HIDE
		$(document.body).animate({ marginTop: 0 }, speed)
		$('.contact').animate({ top: 0 - height }, speed)


jQuery ->

	# initialize and show hire-me bar
	$('.contact').css('top', 0 - contactHeight).show()

	$('.hire-me').click (e) ->
		e.preventDefault
		$(document.body).toggleClass('show-hire-me')
		manageContact(contactHeight, transitionTime)

	# when window resizes, make sure the contact section doesn't get crazy
	$(window).resize ->
		contactHeight = $('.contact').height() - 5
		manageContact(contactHeight, 0)

	# temp disable as links don't work yet
	$('.projects li a').click (e) ->
		e.preventDefault

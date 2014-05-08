// Generated by CoffeeScript 1.4.0
(function() {
  var contactHeight, manageContact, transitionTime;

  contactHeight = $('.contact').height() - 5;

  transitionTime = 200;

  manageContact = function(height, speed) {
    if ($(document.body).hasClass('show-hire-me')) {
      $(document.body).animate({
        marginTop: height
      }, speed);
      return $('.contact').animate({
        top: 0
      }, speed);
    } else {
      $(document.body).animate({
        marginTop: 0
      }, speed);
      return $('.contact').animate({
        top: 0 - height
      }, speed);
    }
  };

  jQuery(function() {
    var viewer;
    $('.contact').css('top', 0 - contactHeight).show();
    $('.hire-me').click(function(e) {
      e.preventDefault;
      $(document.body).toggleClass('show-hire-me');
      return manageContact(contactHeight, transitionTime);
    });
    $(window).resize(function() {
      contactHeight = $('.contact').height() - 5;
      return manageContact(contactHeight, 0);
    });
    $('.projects li a').click(function(e) {
      return e.preventDefault();
    });
    viewer = {
      node: $('.sites .viewer'),
      show: function() {
        return this.node.show();
      },
      hide: function() {
        return this.node.hide();
      }
    };
    $('.projects > li > a').click(function(e) {
      e.preventDefault();
      return viewer.show();
    });
    return $('a.close-viewer').click(function(e) {
      e.preventDefault();
      return viewer.hide();
    });
  });

}).call(this);

(() => {
  var contactHeight, manageContact, transitionTime;

  contactHeight = $('.contact').height() - 5;

  transitionTime = 200;

  manageContact = (height, speed) => {
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

  jQuery(() => {
    var viewer;
    $('.contact').css('top', 0 - contactHeight).show();
    $('.hire-me').click((e) => {
      e.preventDefault;
      $(document.body).toggleClass('show-hire-me');
      return manageContact(contactHeight, transitionTime);
    });
    $(window).resize(() => {
      contactHeight = $('.contact').height() - 5;
      return manageContact(contactHeight, 0);
    });
    $('.projects li a').click((e) => {
      return e.preventDefault();
    });
    viewer = {
      node: $('.sites .viewer'),
      show: () => {
        return this.node.show();
      },
      hide: () => {
        return this.node.hide();
      }
    };
    $('.projects > li > a').click((e) => {
      e.preventDefault();
      return viewer.show();
    });
    return $('a.close-viewer').click((e) => {
      e.preventDefault();
      return viewer.hide();
    });
  });

}).call(this);

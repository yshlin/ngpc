'use strict';

(function() {
  let $sideNav = $('aside');
  let $header = $('header');
  let $scrollTip = $('#scroll-tip');
  //var sections = ['about', 'announcements', 'activities', 'contact'];
  let sections = ['about', 'live', 'contact'];
  let tipContents = ['禮拜直播', '聯絡資訊'];//['最新消息', '聚會訊息', '聯絡資訊'];
  $.localScroll({duration: 200, lazy: true});
  $(document.body).find('> section').waypoint({
    handler: function(direction) {
      let navIndex = sections.indexOf(this.element.id);
      if ('up' === direction && navIndex > 0) {
        navIndex--;
      }
      let currentSection = sections[navIndex];
      $sideNav.find('a').attr('class', '');
      $sideNav.find('#nav-' + currentSection).attr('class', 'active');
      //$header.localScroll({target: '#'+currentSection+'-nav'});
      $header.scrollTo({top: navIndex * 60, left: 0}, 100);
      if (3 <= navIndex) {
        $scrollTip.css('opacity', 0);
      }
      else {
        $scrollTip.attr('href', '#' + sections[navIndex + 1]);
        $scrollTip.css('opacity', 1);
        $scrollTip.find('#tip-content').text(tipContents[navIndex]);
      }
    },
    offset: 60
  });
  //hide icon when no content
  $('.newsspeaker, .newstime, .newslocation, .grouptime, .grouplocation').each(function() {
    let $this = $(this);
    if ('' === $this.text()) {
      $this.parent().hide();
    }
  });
  //expand blocks when exceed
  $('.news, .group').each(function() {
    let $this = $(this);
    if ($this.height() > 720) {
      $this.parent().parent().css({
        'padding-bottom': '60px',
        'height': 'auto'
      });
    } else if (0 === $this.children().size()) {
      $this.text('目前尚無資料，請靜待更新。');
    }
  });
})();

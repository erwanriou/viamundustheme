jQuery(document).ready(function($) {
  $("#block-viamundus-main-menu li").hover(function(){
    $(this).find(".sub-menu-item").toggle();
  });
});

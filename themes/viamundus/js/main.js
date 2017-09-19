jQuery(document).ready(function($) {
  // The function to make toggle the main menu
  $("#block-viamundus-main-menu li").hover(function(){
    $(this).find(".sub-menu-item").toggle();
  });
  // Fonction to make changer name on other the project block in front page
  $(function(){
    var prev;

    $('.front-title-project-field a').hover(function(){
      prev = $(this).text();
      $(this).text("Discover This Project!");
    }, function(){
      $(this).text(prev);
    });
  });
  // Fonction to change css style of the image on hover the "discover this project!"" button
  $("#block-views-block-projects-block-1 .project-column").hover(function(){
    $(this).find(".front-image-project-field").css("filter", "opacity(0.5)");
  }, function(){
    $(this).find(".front-image-project-field").css("filter", "opacity(1)");
  });

});

;
/**
 * @file
 * JavaScript API for the History module, with client-side caching.
 *
 * May only be loaded for authenticated users, with the History module enabled.
 */

(function ($, Drupal, drupalSettings, storage) {

  'use strict';

  var currentUserID = parseInt(drupalSettings.user.uid, 10);

  // Any comment that is older than 30 days is automatically considered read,
  // so for these we don't need to perform a request at all!
  var thirtyDaysAgo = Math.round(new Date().getTime() / 1000) - 30 * 24 * 60 * 60;

  // Use the data embedded in the page, if available.
  var embeddedLastReadTimestamps = false;
  if (drupalSettings.history && drupalSettings.history.lastReadTimestamps) {
    embeddedLastReadTimestamps = drupalSettings.history.lastReadTimestamps;
  }

  /**
   * @namespace
   */
  Drupal.history = {

    /**
     * Fetch "last read" timestamps for the given nodes.
     *
     * @param {Array} nodeIDs
     *   An array of node IDs.
     * @param {function} callback
     *   A callback that is called after the requested timestamps were fetched.
     */
    fetchTimestamps: function (nodeIDs, callback) {
      // Use the data embedded in the page, if available.
      if (embeddedLastReadTimestamps) {
        callback();
        return;
      }

      $.ajax({
        url: Drupal.url('history/get_node_read_timestamps'),
        type: 'POST',
        data: {'node_ids[]': nodeIDs},
        dataType: 'json',
        success: function (results) {
          for (var nodeID in results) {
            if (results.hasOwnProperty(nodeID)) {
              storage.setItem('Drupal.history.' + currentUserID + '.' + nodeID, results[nodeID]);
            }
          }
          callback();
        }
      });
    },

    /**
     * Get the last read timestamp for the given node.
     *
     * @param {number|string} nodeID
     *   A node ID.
     *
     * @return {number}
     *   A UNIX timestamp.
     */
    getLastRead: function (nodeID) {
      // Use the data embedded in the page, if available.
      if (embeddedLastReadTimestamps && embeddedLastReadTimestamps[nodeID]) {
        return parseInt(embeddedLastReadTimestamps[nodeID], 10);
      }
      return parseInt(storage.getItem('Drupal.history.' + currentUserID + '.' + nodeID) || 0, 10);
    },

    /**
     * Marks a node as read, store the last read timestamp client-side.
     *
     * @param {number|string} nodeID
     *   A node ID.
     */
    markAsRead: function (nodeID) {
      $.ajax({
        url: Drupal.url('history/' + nodeID + '/read'),
        type: 'POST',
        dataType: 'json',
        success: function (timestamp) {
          // If the data is embedded in the page, don't store on the client
          // side.
          if (embeddedLastReadTimestamps && embeddedLastReadTimestamps[nodeID]) {
            return;
          }

          storage.setItem('Drupal.history.' + currentUserID + '.' + nodeID, timestamp);
        }
      });
    },

    /**
     * Determines whether a server check is necessary.
     *
     * Any content that is >30 days old never gets a "new" or "updated"
     * indicator. Any content that was published before the oldest known reading
     * also never gets a "new" or "updated" indicator, because it must've been
     * read already.
     *
     * @param {number|string} nodeID
     *   A node ID.
     * @param {number} contentTimestamp
     *   The time at which some content (e.g. a comment) was published.
     *
     * @return {bool}
     *   Whether a server check is necessary for the given node and its
     *   timestamp.
     */
    needsServerCheck: function (nodeID, contentTimestamp) {
      // First check if the content is older than 30 days, then we can bail
      // early.
      if (contentTimestamp < thirtyDaysAgo) {
        return false;
      }

      // Use the data embedded in the page, if available.
      if (embeddedLastReadTimestamps && embeddedLastReadTimestamps[nodeID]) {
        return contentTimestamp > parseInt(embeddedLastReadTimestamps[nodeID], 10);
      }

      var minLastReadTimestamp = parseInt(storage.getItem('Drupal.history.' + currentUserID + '.' + nodeID) || 0, 10);
      return contentTimestamp > minLastReadTimestamp;
    }
  };

})(jQuery, Drupal, drupalSettings, window.localStorage);
;
/**
 * @file
 * Marks the nodes listed in drupalSettings.history.nodesToMarkAsRead as read.
 *
 * Uses the History module JavaScript API.
 *
 * @see Drupal.history
 */

(function (window, Drupal, drupalSettings) {

  'use strict';

  // When the window's "load" event is triggered, mark all enumerated nodes as
  // read. This still allows for Drupal behaviors (which are triggered on the
  // "DOMContentReady" event) to add "new" and "updated" indicators.
  window.addEventListener('load', function () {
    if (drupalSettings.history && drupalSettings.history.nodesToMarkAsRead) {
      Object.keys(drupalSettings.history.nodesToMarkAsRead).forEach(Drupal.history.markAsRead);
    }
  });

})(window, Drupal, drupalSettings);
;
!function(a,b,c){"use strict";function d(d,e){function k(){h.randomize&&!f.hasClass("slick-initiliazed")&&n(),f.on("setPosition.sl",function(a,b){o(b)}),a(".media--loading",f).closest(".slide__content").addClass("is-loading"),"blazy"===h.lazyLoad&&b.blazy&&f.on("beforeChange.sl",function(){var c=a(".b-lazy:not(.b-loaded)",f);c.length&&b.blazy.init.load(c)})}function l(){var c=(f.slick("getSlick"),f.find(".media--player").length);f.parent().on("click.sl",".slick-down",function(b){b.preventDefault();var c=a(this);a("html, body").stop().animate({scrollTop:a(c.data("target")).offset().top-(c.data("offset")||0)},800,h.easing||"swing")}),h.mouseWheel&&f.on("mousewheel.sl",function(a,b){return a.preventDefault(),f.slick(b<0?"slickNext":"slickPrev")}),f.on("lazyLoaded lazyLoadError",function(a,b,c){m(c)}),c&&(f.on("afterChange.sl",p),f.on("click.sl",".media__icon--close",p),f.on("click.sl",".media__icon--play",q))}function m(b){var c=a(b),d=c.closest(".media--background"),e=c.closest(".slide")||c.closest(".unslick");c.parentsUntil(e).removeClass(function(a,b){return(b.match(/(\S+)loading/g)||[]).join(" ")}),d.length&&(d.css("background-image","url("+c.attr("src")+")"),d.find("> img").remove(),d.removeAttr("data-lazy"))}function n(){f.children().sort(function(){return.5-Math.random()}).each(function(){f.append(this)})}function o(a){var b=a.slideCount<=h.slidesToShow,c=b||h.arrows===!1;if(f.attr("id")===a.$slider.attr("id"))return h.centerPadding&&"0"!==h.centerPadding||a.$list.css("padding",""),b&&a.$slideTrack.width()<=a.$slider.width()&&a.$slideTrack.css({left:"",transform:""}),g[c?"addClass":"removeClass"]("visually-hidden")}function p(){f.removeClass("is-paused"),f.find(".is-playing").length&&f.find(".is-playing").removeClass("is-playing").find(".media__icon--close").click()}function q(){f.addClass("is-paused").slick("slickPause")}function r(c){return{slide:c.slide,lazyLoad:c.lazyLoad,dotsClass:c.dotsClass,rtl:c.rtl,appendDots:".slick__arrow"===c.appendDots?g:c.appendDots||a(f),prevArrow:a(".slick-prev",g),nextArrow:a(".slick-next",g),appendArrows:g,customPaging:function(a,d){var e=a.$slides.eq(d).find("[data-thumb]")||null,f='<img alt="'+b.t(e.attr("alt"))+'" src="'+e.data("thumb")+'">',g=e.length&&c.dotsClass.indexOf("thumbnail")>0?'<div class="slick-dots__thumbnail">'+f+"</div>":"";return a.defaults.customPaging(a,d).add(g)}}}var j,f=a("> .slick__slider",e).length?a("> .slick__slider",e):a(e),g=a("> .slick__arrow",e),h=f.data("slick")?a.extend({},c.slick,f.data("slick")):c.slick,i=!("array"!==a.type(h.responsive)||!h.responsive.length)&&h.responsive;if(i)for(j in i)i.hasOwnProperty(j)&&"unslick"!==i[j].settings&&(i[j].settings=a.extend({},c.slick,r(h),i[j].settings));f.data("slick",h),h=f.data("slick"),k(),f.slick(r(h)),l(),f.hasClass("unslick")&&f.slick("unslick"),a(e).addClass("slick--initialized")}b.behaviors.slick={attach:function(b){a(".slick",b).once("slick").each(d)}}}(jQuery,Drupal,drupalSettings);
;

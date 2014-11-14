'use strict';

var CartConst = function() {};

// animate.css
CartConst.ANIMATE_END_EVENT = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

// nav
CartConst.NAV_TRIGGER_HINT_X = 150;
CartConst.NAV_TRIGGER_HINT_Y = 150;

// height
CartConst.PAGE_HEADER_HEIGHT = 80;
CartConst.PAGE_FOOTER_HEIGHT = 100;

// cookie token
CartConst.TOKEN_NAME = 'CART-TOKEN';

// database
CartConst.DB_NAME = 'CartDatabase';
CartConst.HTML_DB_NAME = 'CartHtmlDatabase';

// upload
CartConst.UPLOAD_TYPES = ['image/png', 'image/gif', 'image/jpeg'];

module.exports = CartConst;
// ==UserScript==
// @name         SC Tools
// @version      2.0.1
// @description  Useful tools for dropping.
// @author       CAC
// @downloadURL  https://github.com/CAC27/SC-Tools/raw/master/SC-Tools.user.js
// @icon         https://socialclub.rockstargames.com/favicon.ico
// @match        https://socialclub.rockstargames.com/*
// @match        https://*.socialclub.rockstargames.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// ==/UserScript==

var baseURL = window.location.href.match(/^(https:\/\/(\w\w\.|es-mx\.)?socialclub\.rockstargames\.com).*$/)[1];
var sc = /^[a-z\.\-A-Z_\d]{6,16}$/;
// -- Set default values if first run of script --
var defaultTrue = ['checkBlocked', 'stats', 'delete', 'accept', 'reject', 'quickadd', 'messages', 'auto', 'friendcheck'];
for (var i in defaultTrue) {
    if (GM_getValue(defaultTrue[i]) === undefined) {
        GM_setValue(defaultTrue[i], true);
    }
}
var defaultFalse = ['debug', 'settings-link', 'silent', 'delete2', 'limit'];
for (var i in defaultFalse) {
    if (GM_getValue(defaultFalse[i]) === undefined) {
        GM_setValue(defaultFalse[i], false);
    }
}
if (GM_getValue('droplist') === undefined) {
    GM_setValue('droplist', []);
}
var auto = false;
var autoPaused = false;
/*var friends = [];
var blocked = [];
var requests = [];*/

//setup();

//function setup() {
    //load SweetAlert
    try {
        if (GM_getValue('silent')) { //replace sweetalert w/ dummy function
            unsafeWindow.swal = function(options, callback) {
                if (callback) {
                    callback(true);
                }
            };
        } else {
            $('head').append('<link id="sct-sacss" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.css"></link>');
            $('head').append('<script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js"></script>');
        }
    } catch (err) {
        console.error("Error during script loader:\n\n"+err.stack);
        return false;
    }
    //get login info
    var verificationToken; var userNickname = ''; var isLoggedIn = false;
    try {
        verificationToken = unsafeWindow.siteMaster.aft.replace('<input name="__RequestVerificationToken" type="hidden" value="', '').replace('" />', '').trim();
        userNickname = unsafeWindow.siteMaster.authUserNickName;
        isLoggedIn = unsafeWindow.siteMaster.isLoggedIn;
    } catch (err) {
        console.error("SC Tools - Error retrieving account data:\n\n"+err.stack);
        return false;
    }
    if (!userNickname || !isLoggedIn) {
        console.info('SC Tools - Script aborted because user is not logged in.');
        return false;
    }
    setTimeout(main, 1000);
//}

function main() {
    //start contstructing the page
    $('head').append('<style id="sct_style">.sctb { margin-bottom: 8px; margin-right: 5px; } input[type="checkbox"].SCTools { -webkit-appearance: none; width: 16px; height: 16px; background: #CCC; border: 2px solid #BBB; margin: -10px 6px 9px -1px;}a:hover > input[type="checkbox"].SCTools { -webkit-appearance: none; width: 16px; height: 16px; background-color: #DDD; border: 2px solid #CCC; margin: -10px 6px 9px -1px;}input.SCTools[type="checkbox"]:checked { background-image: url(https://www.degoudenton.nl/skin/frontend/default/degoudenton/images/checkmark-orng.png);} span.off { color: red; } span.on { color: green; } span.paused { color: brown; }</style>');
    $('#footerNav').append('<li id="sct-cred">Social Club tool by <a href="https://github.com/CAC27">CAC</a>'+(GM_getValue('debug') ? " (debug mode)" : "")+'</li>');

    // -- Do appropriate actions for the page --
    if (window.location.href.match(/https:\/\/(\w\w\.|es-mx\.)?socialclub\.rockstargames\.com\/tools.*/)) {
        showDroplist();
        showButtons('droplist');
		if (GM_getValue('debug'))
			console.log('Showing droplist.');
    } else if (window.location.href.match(/https:\/\/(\w\w\.|es-mx\.)?socialclub\.rockstargames\.com\/settings\/tools.*/)) {
        showSettings();
        showButtons('settings');
		if (GM_getValue('debug'))
			console.log('Showing settings.');
    } else {
        showButtons();
		if (GM_getValue('debug'))
			console.log('Showing buttons.');
    }
}


// --- Page functions ---
function showDroplist() {
    $('.alertBox.notFound').replaceWith('<div id="sctools"><div id="droplist" class="activePanel"> <div class="gridPanel sct" id="droplist_info"> <h3 class="sct">Edit Droplist</h3> <p class="sct">This is designed to accept dropBot messages:<br><br> <b>Discord:</b> someName - <b>ID:</b> 123456789012345678 - <b>SC:</b> socialClubName - <b>Drops Attended:</b> x<br><i>(one dropee per line)</i> <br><br>So just directly copy and paste them. <br><br>Note that the button functions change if you have a droplist. </p> <div id="droplist_input_wrapper"> <textarea id="droplist_input" placeholder="Discord: CAC - ID: 246107833295175681 - SC: ¯\\_(ツ)_/¯ - Drops Attended: 19\nDiscord: YellowHeart - ID: 225093001641197569 - SC: 🤔 - Drops Attended: 70"></textarea> <a class="btn btnGold btnrounded sctb2" href="#" id="sct-add">add</a> <a class="btn btnGold btnRounded sctb2" href="#" id="sct-remove">remove</a> </div></div><div class="gridPanel sct" id="current_droplist"> <h3 class="sct">Current Droplist</h3> <p class="sct">This is a list of your dropees, including some info about them.<br><br>It will be in the format:<br>SC name | Discord name | Total money | Rank | Drops attended.<br><br><i>Note: Stats (rank/cash) will be unavailable for some players, due to privacy settings.</i> </p> <div id="droplist_wrapper"> <ul id="current_list">   <li class="empty">Loading droplist...</li> </ul> <a class="btn btnGold btnrounded sctb2" href="#" id="sct-clear">clear</a><a class="btn btnGold btnrounded sctb2" href="#" id="sct-reffrd">refresh friends</a></div></div></div></div>');
    $('head').append('<style id="sctools_style">h3.sct { color: white; padding: 5px; } p.sct { color: #bbb; padding: 10px; } textarea#droplist_input { color: #fff; width: 99%; min-height: 300px; margin: 5px; background: #222; padding:  5px; border: 2px solid #444; border-radius: 10px; } a.btn.btngold.btnrounded.sctb2 { margin: 5px; } .gridPanel.sct { padding: 10px !important; } div#current_droplist { float: right; width: 59%; } div#droplist_info { float: left; width: 39%; } .empty, .gray { color: #666; } .total { text-align: right; } ul#current_list { color: #fff; background: #222; padding: 10px; margin: 5px; } #current_list li { padding:  5px; border-bottom: 2px solid #666; } .unknown { color: #FB0; } #current_list .bl { color: #F00; } #current_list a.bl:hover { color: #F33; } .fail { color: #F70 } #current_list .friend { color: #49c3ff } #current_list .friend:hover { color: #7aebff; } .sctb-16 { float: right; margin-left: 3px; height: 16px; width: 16px; background-size: 16px; display: inline-block; transition: 150ms; } .sctb-16:hover { filter: brightness(1.5); cursor: pointer; } #current_list > li > img { display: inline; height: 22px; margin: -3px 6px -7px -5px; } #current_list .pending { color: #00de00; } #current_list .pending:hover { color: #54ff54; } .me { color: magenta; } #current_list a { color: #fff; } #current_list a:hover { color: #bbb; }'+
        '.sct-del { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAIhIAACISAFlEbUFAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAHNSURBVHja7Ne9axRBGMfxz94diQlnSGN8AQXFQlCxsBUrFQVFUUvFzj9Bi2ssPBDs/BPyBwgBXyE2VloElKigIgFf0EIUVBSJcW2eg2VZs+txG0XuB8sMv5md/c7sM7vzJGmagk6no0QTuIhjWI2fufYGvuEOzuHtcoN1u13QUl1XcKakzyROYS0OVBm0KsAaHI36PKajnkSZYgnHsQf7sB2P+wHYha0xICxiS8wOHuAuxnP3fcX6AEhwEhuxKtqbeI37vwMYx27cQHsZ6NNxlelCgZfiBG4HsEam8WzMrK0+JbiKTjZyexqxchopegU38Rnfo0xreHAbY5grApiPaxQHgzId4NKnsfyfynbBZGyziRpWYCce5b9eRZGarlQwNPxlVQV4F/t3f+xheI4jES/3wpvDIRzGk0ECfMEMZrEQ3kdcC6A3GdBbuI73gwRICupl3v8VA0OAIcAQYAjwzwOkdQMkmWN4K3NvK+c1M2Wz38QkKfipbMLDSMemwtuBpzH7deHtxYuob+gXYBE/CvptznmjkbBkNVbg9bQUY5e+gg94VkO8vcLLqjFwqQaAy5E9V0pOZ+K4dR7bIqD+NNJ7R/GFyKynizr9GgBEeldN2USYxwAAAABJRU5ErkJggg==); }'+
        '.sct-rel { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAK5SURBVHja7NddiBZlFAfw3+uuxkqmm4U35UUQ5lVgSmxs+UHBstCFERQoiZiC1IVgHwTlshiJiGKKBdnHhQq6GBVIXij4BYsR7na3QqFXoYGw7WZs6+72dnNGhmHed2a2CxH9w8DM85yZ/5nn/J9zzlOr1+vuJGa4w2iF3t7eMrazsBzdWIrH8FDM3cTvGMCPOIOxJt/agr97enoOtpZ08g28g8UNbB7GQnTgLVzBXnyB8YztdmzFN2VC8BTO4asm5Hl4AvvwE55JjW/Dh5iIS7MV6MJRzC0gq6PWYO5pXMAaPInelPZamjnQhe/xQM7cAH7Az/gjHJgfZN14IfPdNvTlOFlr5MAiHMkhHwodnAzSLE5jN5ZgJ17Mij1n5XI18HmIKo0+LAuFFyWOAbyEj0pvwxTWYGUO+esliLN4sGA+NwRvZ55/xcZpkH+GzQXCrWcdmInHM4YfYLQi+ddYX2DzLyazGpjAsdRzf6i9CvYE+Qj+zLlGImuO4p+8ELyP82iPbThZgbwF+7ELUw3C1pIKwVieA5PT+OsEU7h611XD+w4kGpgdqbdW4p3ZuF5RoG1YHfffpXuFxIH3sBaPhJgaoR2HsK7ijx7GK3H/LV7NOjAnKlpR6T2BTRXJV6TIRcVcEJX0tgZaSuihL5ZxvAL5zKiQaVzDcFaE9YJ8/yVeqxj3pCYsyYx9iltVd8FwReJZ4fSbmfFBHJjONnw3WqvnStiuwkVsyIyPhUNTCjqVJK1OxZ8k6Awn+kOMg7gRc49G8/kyns3ZzvXYOQNFDUmCT4KsD/MyK9YZV1mMRVt/vFkmrKW83hXt86no8/v/R6IbjLAdL0rFM2I19kRSSnA5TkMboikti9+iu+rAL2VS8RA+xo4cm8nocg7j+Ugky1JHsxr+iqPZpWhczyYNRxFq9/zp+L8BAOz5m71fnJ1fAAAAAElFTkSuQmCC); }'+
        '.sct-rel12 { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAK4SURBVHja7NddiBZlFAfw3+vuKit9aUY35kUQ2lWwKbGhfYiBCF4ogoKi2JYQeSFoilCBKEVIiyUVVKsXKuiyooLkhUJpsCjhbncGRV2FBYLtlrx+vNvbzRkZhnnfmdkuROoPAzPPc2b+Z57zf845T63ZbLqXmOIeoxNeHRgoYzsVL2IZ5mM2Hoq5v/ArRvAVvka9zbe24MaBvr4vOks6uR7b8HQLm5mYg168iZ+xD5/jVsZ2N7biYJkQzMN5DLQhz8OT+BiX8Gxq/F28jTtxabcCS3EUDxeQNVFrMfcMvsVaPIVdKe11tHNgKU5iWs7cCE7hO/weDjwaZMvwQua73RjMcbLWyoG5OJJDfiV0cCZIsziHD9GDD7AkK/aclcvVwGchqjQGsSAUXpQ4RvAK3im9DVNYi5dzyNeUIM7igYL53BBszjz/iNcnQf4p3igQbjPrQBeeyBjuxHhF8gPYWGDzNxpZDdzBsdTzcKi9CvqDfAx/5FxjkTXHcTMvBDtwATNiGzYqkHdgP/ZiokXYOlIhqOc50JjEXyeYwC/3XTX834FEA9Mj9dZKvDMdv1UUaDdWxP2JdK+QOLAd6zArxNQKM3AIGyr+6GGsjPvjWJV14MGoaEWl9zQ2VSR/KUUuKubjUUnvaqCjhB4GYxlvVSDvigqZxlVcz4qwWZDvv8TqinFPakJPZuwj3K66C65XJJ4aTr+WGR/FJ5PZhm9Fa/V8CdvFuIi+zHg9HJpQ0KkkaXUi/iTBwnBiOMQ4imsx91g0n8vxXM52bsbOGSlqSBK8F2SDeCSzYgvjKot6tPVD7TJhLeX13mifz0afP/wvEt1ohG2oKBVPidXoj6SU4Ic4DfVFU1oWP0V31Yvvy6TiK9iD93NsGtHlHMaiSCQLUkezGv6Mo9nlaFy/SRqOItT+86fjfwYA+LGbvXXSQ8QAAAAASUVORK5CYII=); }'+
        '.sct-addfrd { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAPMSURBVHjaxJc7b9tWFMevRLtLnaFp4D2zeC9JyRYpinqQl7xXH6FG2uymKLlyQlmxasWURSpAi3TO1HyDpGvQNEAyZQiQoR6Dbg6aoICRKW0HdhBlMzIfiq0gwwEoUsT53fP4n0MAmyj7OQ3AJmJgEy2lGWtCMGvzvJdiTCpA4AgUOoVV0RZlaadERFuS853CKmyii4IkA7AmzCCLW6nu1X4iLjkiLvFDdlQb1H7k28IKa8LMpwDIwiZarg3qv1KP+sbIOGN0TH11X32IWtxy8P/FAbAmBOVb5W/inJ9AeNQv9eSNc6YiMQJAva0+oB5JBCAu8dV99QGy0EIBslyLX8JD/SVx0wHwUH/Jtfilc6QhHgBZHMBD/GI+APwCWRxYGABrwsza9rpqjIyjeQCMkXEk2qJ6jm6IiwAE9UH9floBhguxPqj/ApvRhTgjYJl5IgCUvtL7GABlt7wT1Qlci2eKtsiLXcmQuhIWtvKXQz7jU1DoFK7qB/qrOVPwau3G+tXZFLAmBMJW/ivikr+oR/3GuOGXd5VeCDS+DXObEMg9+fqcOnA9t3nm9EwAsGqMjGPikkmk+soot8lO/SYLUdEWa/MAiLZYDYcfWRwIugLkvy9cMkbG36cAlT3YRCfPk4QoI2zlrxgj43VcGohLfP1Af823hSvQRJlp+uSeTPAQ/6Y52mPs4GfGyPh3OkP0A/1PzdEea472e31Qv5c2jEB5V9mOnQUe9at71Q5snqrgpIArdxrjhk896lOP+jND7OQ+9eg/aQBZvi0s6wf64WwUAgU85Nr8F9A8FSDWhKDyw4IAYBMxyOKA5uAnUQCag58EuWTCHSTaEsXOJAWaoz0zRsZ/USlQ97V7aQBTSX4eHQH8PEaC5ytCK74ImalyiV1JIS55FwVAXPJOtMVyaEVjLtSGrAkzrAkBsjgg2mJO6Stj4pJj4iYK0XF1r+at3yjmkMV9ILesCQHfFi6HhUjpV84KEWtCJrfJAr4trCj9yjV1X31EPfo+TQVnovFec7RH8q3yt8KW8CVrQgDNySnXbxZ50ZYM0ZZwvlP4UIpZE2b4tgBKPXkDD/HhtGrncRwFErTsH3JP3giW1mziMOLbAtAc7e5FHMeB1Aa1n5GFsgmFzgC5J19rjBsLcRwlVHJP/i5hX2QAHuKnizp5VCQ0Bz9FLS4uCgygHn3zKZyHRvWbYAcAcQBvZ6VyURYU5Fu+LXwdkwYGFG+KgtQt0YlJ9PR6+ltqSN1SyKRGyr3p+w1pp0QL22uFxJ0w6qNz0Za2lE4L5LPY/wMAHDsi5Xdo+xYAAAAASUVORK5CYII=); }'+
        '.sct-accreq { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAB3VBMVEV5WSB6WSB6WiB6WiF6WyB7WiB7WiF7WyB7WyF8WyF8XCF8XCJ+XiN6WiB6WiF7WiF7WyF6WiB6WiF7WiF7WyF8XCF8XSJ6WiF7WiF7WyB7WyF9XSJ7WyF9XSN7WyF8XSJ+XiR9XiN/XyR8XCJ+XiN+XiSAYCWAYSZ/XyR+XyR/XySAYSZ+XiR+XiN/YCR/XyR/XyWAYSWBYSaBYSWCYyeDZCeFZSmDZCiEZSmEZSmBYiaFZSmFZimFZimFZiqFZimEZSmCYyeFZSmFZimGZiqFZiqGZyuIaSyFZimGZyqGZyuGZyqJaiyHaCuIaSuIaSuKbC6IaSyIaSyHaCuIaSuMbi+Jai2Kay2Jay2Kay6Kay6KbC6Kay6Mbi+KbC6KbC6LbC6NbjCMbTCQcjKNbjCObzGPcTKObzGObzCPcDGPcTKNbzCPcDGQcjORcjORczSQcTKQcjOQcTOQcjOQcjOQcjORczOQcjORcjORcjORczORczORczORczSTdTWRczSSdDSSdTSTdTWSdDSTdTWUdjaSdTWTdTWUdTWUdjaTdTWVdzaTdTWVdzeTdTWTdTWUdjaUdjaUdjaVdzaVdzeTdTWTdTWTdTWUdjWUdjaVdzaVdzeVeDeWeDeWeDjVexrzAAAAl3RSTlMAAAAAAAAAAAAAAAAAAQEBAQICAgICAgMDAwMDBAQFBQUGCwwMDA0NERISEhMUFBYWFhYhISsrMDAxMzo6Ozw+P0FBQ0NFRkZHR0dIWFlZW1tcXV5ecXJ3eHh9fYSGh4iIi4yOj5mZn6CvsLG6ury8vb2+vr/CwsPDycnN0NDU1dXd3d/m5ufn6enq6uvr7fDw8vj4+fr7t+6TDgAAAbxJREFUeAGF0vdX1TAUwPG+q2I0xKF1GIN7KO69t7hxD3FvxaGgOBQVB7gHOAz33fr+VtNxe3ogyPe39nxObpo0CPsp0IaDONMjnYMBYum6HeuXCOgDqOmXOhCx4+IM5QXhpFtk46Kbk0MfgH2RTaN68AHRWM4ANg7xgLDmBTJ4XhN6gGzNQav0ALWlPQftW1VvMOgGWY6uD+ZzG5YDaCiAEyXjmri6bnvthHzEstfdPOLN8ngEzPlIlZMlBiY4yp9JR4J4NCz6jnQm0AxgM88obwJjhkox+xvSKSFFBkYsfI/phHcLhhu1817zk9+Ib5sfXOXLguOUTjgm3MP5ChG6iH4xGDXlVbwEtk0d7cCF3kDLlgS0SPdC7brb9PiPG9F0/xqDUD5NwDPpVjBuc7PcJk9X8SY1lDZ2JaBrA4COXywufKYCufJcZ3ZSnWdXSFAG5n6gSkNyUOOCmQdv/0TL4Y87h6aB1qvqts0b74Cqrm8jtMWw/HK/GAngFnKg+nLUbXuGdGWMzq77wF/rKzoMGXiEXoAPx+oUfLZ+8Km2KgVf0Rt9mT8wBWt2p+0t5J72rOV/EvqKQaj/3z9DAyY6YZOwMAAAAABJRU5ErkJggg==); }'+
        '.sct-rejreq, .sct-cancel { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABvFBMVEV5WSB6WSB6WiB6WiF6WyB7WiB7WiF7WyB7WyF8WyF8XCF8XCJ+XiN/XySAYCWBYSaDZCiJaiyKay2NbjCObzCRczSUdjaWeDd5WSB6WiB7WiF7WyF6WiB6WiF7WiF7WyF8XCF8XSJ6WiF7WiF7WyF7WyF9XSN7WyF8XSJ+XiR9XiN/XyR8XCJ+XiN+XiR/XyR+XiR+XiN/YCSAYSWBYSaBYSWCYyeDZCeFZSmEZSmBYiaFZSmFZimFZimFZiqFZimEZSmCYyeFZSmGZyuIaSyFZimGZyqGZyuGZyqJaiyHaCuIaSuIaSuKbC6IaSyIaSyHaCuIaSuMbi+Jai2Kay2Kay6Mbi+KbC6KbC6LbC6NbjCMbTCQcjKNbjCObzGPcTKObzGObzCPcDGPcTKNbzCPcDGQcjORcjORczSSdDWTdTWUdjaVdzeQcTKQcTOQcjOTdTWQcjOQcjORczORcjORczORczORczORczSTdTWRczSSdDSSdTSTdTWTdTWUdjaSdTWTdTWTdTWVdzaTdTWVdzeUdjaUdjaUdjaVdzaVdzeTdTWUdjWUdjaUdzaVdzaVdzeVeDeWeDeWeDhOpfWTAAAAi3RSTlMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAgICAgICAwMDBAQFBQUGCwwMDBITFBQWFiEhKysxMzo6Ozw+P0FBRkZHR0dIWFlZW1tcXV5ecXJ3eIaHiIiLjI6PmZmfoK+wsbq6vLy9vb29vr6+vr/CwsnJzdDQ1NXV3d3m5ufn6urr6/Dy+Pj5miLbKwAAAbJJREFUeAGF0feb0jAYwPHee3rGy6nnUIxF4gi49957iHvvIW4LVhyoqOBQUGsklX/YpklqHwne97eSz5PwJg4dI4flTSDL/xNLwCBav23f9nUI+gCy/GqTc968soJYAV10VwSy8M5iagNwJAxUogg2gEodDXhpogXQwmtuwKsCtQBcS0ANWwDZ00hAYy/pBeNvi8Akbk3oBXA+Bc4NxCuu69IEkA3vfpoj3m8kMUBD4P4d0zltxhSnHLnMsnjGKDBmAOw2Z3R2RRc1jPGk6ZlZowgjDdy1H7k64cOaOXmy/6H/tOx5j33/hnksOKu2EGdQ9HGpK7hMiB8GzF3yVm7B60tzEbjcFVL8SgGGqzGo4ugHcuBBxfe88qPKk5sGUPwiBi9xTr4dxsPTMjOnJH+SwcDOdgzaOwCYHHMhTJ08W49JAG++2NI31bqwCQOJCBpE6iYXOCuP3/vOAxP/dv/EMmCMUsokICPFutDLhnTeHEVZ81gj10K9eZqI6/OYBsd+B7bCk6DBc24F/Nl8psDnwA4+rRpS4Cu3Jr6sHqfAloOqw6mir0NbzRTQLwMo+39/AEeeG1TI8cfxAAAAAElFTkSuQmCC); }'+
        '.sct-delfrd { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABrVBMVEVyMidzMydzMyh0Myh0NCd0NCh0NCl0NSl1NCl1NSh1NSl3Nyt3OCt4OSx5OSx6Oi2AQDKBQTOCQzWDRDWKSzuOTz+PUD9yMidzMyd0Myh0NChzMyd0Myh0NCh1NSh1NilzMyd0NCh0NCh2Nip0NCh1Nil3Nyt2Nyp4OCt1NSl3Nyt4OCx3Nyt3Nyp4OCt5Oix6Oi16Oi17PC98PC9+PjB9PTB6Oy5+PjF+PjF+PzF+PjF9PjB7Oy5+PjF/QDKBQTN+PjF/PzF/PzJ/QDJ/PzKCQjSAQTOBQTOBQTODRDaBQjSBQTOAQTOBQTOFRjeCQzWDQzSDRDWFRjeDRDWDRDaERTaGRziFRjeJSjuGRziHRziISTqHRziHRziISDmISTmISTqGRziISDqJSjuKSjuKSzuLTDyNTj6OTz+JSjqJSjuKSzuLTDyJSjuJSjuKSzuKSzuKSzuKSzyMTT2KSzuKSzyLTDyLTDyMTT2MTT2NTj6LTD2MTT2MTT2OTz6MTT2OTz+NTj6NTj6NTj6OTz6OTz+MTT2NTj2NTj6NTz6OTz6OTz+OUD+PUD+PUEB4t45IAAAAhnRSTlMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQECAgICAgMDBAQFBQUGCwwMEhMUFBYWISErKzEzOjs8Pj9BQUZGR0dHR0hYWVlbW1xdXl5xcnd4hoeIiIuMjo+ZmZ+gr6+wsbq6vLy9vb2+vr6+v8LCyc3Q1NXV1d3d5ubn5+rq6+vw8vj4+apmHc4AAAGnSURBVHgBhdH3l0tBFAfwd9cOdla3GNbgZhVWL6zeRe+9d5FHSKKQKCR4Ri7+ZvPevJu8IxO+v82Zz5l7vncC/Z8EmONAnNxfwTboE+vGdo+tFdADqBWX68aY+qVR5QV68V2K4vy8s0T7AByiyIXy4APiVisF5vaAB+iRqmFQHdEeICttUJEeoHbW2qC2S3WD/psUcehGfzeAsxlwxtWwa8bOiPVvvvOItxuSEShgnO7UDE5yTToRxNeIMG2SQmQAO4jBdjtB2syYNTRZSpGCeWveGzfh3eq5ObXnYfikUHj8NAyv8WfBaXIPnBL2cOE3kTGGiL4xGF762sQPvFo234KLDvzIAJSlBJQk2lJ7HxRDO+JRsXidgZblBJSTRQspB2bOHpoq5AQHEGBbMwHNrX2Arub0KXPSmgombjrfSDfVOLdRgkoWJdyiFgWjR+99NRHHfLl/bDkg8qrVYP4l8XVKWi8Ojx/mzxq8QvwNGUJXF2AKjvyKfKHjkILnxgvMs4XowMfIDz6sFA58Nt7Qp1XgwOZ9+5MczMSeDmzhFtArDDT+O38A3xENkFUgKTYAAAAASUVORK5CYII=); }'+
		'.sct-bl { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEyUlEQVR42qVXS28TVxQ+iAVqC2mqqkqzsOiqLTVJnDjEsT1j82h4xPE4y0gVaiukqvyD/gOIxx47D5yHSUMJgUKrLts97bpIUEWipq26oiSoLKhA0AL9vskQ3RkP4weLT3ce957z3XPOPfcceSayhSfbtsm5/VGpHBmWmWMJmRpN2uMsUMrq3XifKI1pFYxXi1m9Btx2UOM3599E0Uh1T2Pt4siQzEEWn6cySake2iePt2936WyGQASCq1CyUcjqzwjT4KjA+83Q73LN/OFYX9sEpo8lOsqZpAWBDym0VZhAcUx/iE1YINDREoEzR+M92PG1Bkr+Be4TfG4w9xqI9DQkQHyVjmqT4+l1P0HWmEa/WzBrbiqjhfEcIhAjH8yMJrJ4LmLXN02ftXkjtV49NKR59ckfb72xhV9CXeHyaHIDk70C1koZ7cTC4dhO+FaqIzHbr1BIwGIJIC4WnitH46/C9x8XjFTN5RLInBpNbHzf/17vD5F35TnkfKpfVgCYftdkLn2DE73soeQUFFM4T0MQAUR9XJZgahB4E2tXJnMpF4nT4+m15f3Rzi8PRIWwF84C8FEpwIdPoegLQHDE7GNZBqEXETi7ScD+t6L3m3nDTQL65q7Ee+QbADsnk8G9mPyoUWQ/J1EAMAYSyOfScknrk+u730ZcDVzAuxpL/0HvIL6LLMKc5Yy2ZLpY6vTf6SASCrje1wKLHw5JFUBMdEL+766gzKWuACJg0wUh99SfcMenFEplzZDAN8jZfK7AGpeSfXI50StfY8QzR1r6I09wP1gYie2WM0fiE6bin1Im+RtM84rix0ASXiBY6VIGtgvn0wM7kNx+hQ5Vxkmab94j3KIQC3AItESCa6jw2+GeOmDH+bybwGUcp8RPW6yQz5cPRLOrer8AXNAWCfiWMQHfD6tgis941t7gAjVhPMYR28PzDqhnvWUStGLZDX57nzqUdeuc/Jci7D6sEMKu1Z23RiIYIepQ1v0dSMDBy5EwdFUWCfzjJXBLdQHy/R6eXQWMEy5uhwTrCfg+TiCDxsO8OVUX4BgO/6geDSSNDHO5ApLgqWjLEtNuAuN1QYiiY9595epFH0WOCVuPiYLbBdOueQaOYYWJyH3n38KudywfHBQVSwf3cQdSaD8wX8O3P9X/0P25wPxdyP331NsKWes4bysHTKsEjyYFwR2tk8DzZ55/D5Bt32HCoBtcl1EeFwfeO3F3i4mkksfIcgqMeeFwTatHlBdbrf4ySot8Fwtzd3th+keePL26jJxuOf4/6yHA0WqeBOF/HV/UIwTTpOWthi6gmMDkQAJEyRuwmySeKrKCCpIBG7gDWJJdxwTVTLTECsurpUYEDPvIMeUyhfOSO1UwfHe/dlGLvL6qRXDfRJorSllgIj98woIzgACTDhuQnUhcJ1DErvlY4C7QC4iD+rL8nFqW1zcaN4EiFGShOAyECBBgSTeOy6ZUxDE2fbomfL+DuZo3Zvw7o5dvTFTlNPvPs5DJKqvQDIF5u59LdLCtYntlttuaoa2DnOIMWjPGT6lZAnObBDiyoLSbUzacZlBzqowI5A3EwyJqi74Fp4doi0AFI1tspzDpxvcJS2nPIey2gxqS2VX+4xwEbfcCKyB7A8EE/gflNxbOCMltVgAAAABJRU5ErkJggg==); }'+
		'.sct-ubl { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFBklEQVR4Aa1XW29UVRRekhiiYmmChvShEXywlzlz6VymL/0D2jSSGKVYoZdqL1wobafj8Aswkk4vZS6dttDSDtByAeObvKHPkkis0UETntCWyAMGAir1+3ZO2z2HMzPM4MOXc3LO2Wt9Z61v7bW2rIls4N8tL8m5dkNmDtVJqs8ryX6fpI56ZQqIhQIVyWO+5vigP47rjVOhQObUUOAuwXs+47tJfDMRDlbgKrPdbpk5XKfsJPr9Mtflkicvb8nyWZAArh4YnpoYCqwCa8R4mFcT9s/ucc3pgx43bJVGYLLPWxYf8Edh7BGNFgsSQmQeITJRECgrisDU4TonQnuzgJO/gQcE7wt8exMknAUJEOfajIaxSP2KnaHYoJ95jyJC7yf7/Q7cVxKpo75aRKwJfzwM/Gy3duzz4Mpcl7vB6k/u7N4OALu2y0/GG47EMd8qPs42EA4sIx2dZ3o92+KDAZnr9ghFBucKU0e8Mg2xQai8vorct2JNJjslwbUkbH/T+Lbr+ru75fp7ACAXDjgU0u3G66OR+lvjVucAnJyAqGDcK/EQCbhzEqB+5j9zCQjswNr50cimPdoeOV6/nO4wyhc6nEJwsQLYjeTJ4VM4iiiH4aCqkMSAPyeBs10kEFTvFg84TtKxLs7UEW/i6t4qufZRlSjRLXQ6DXz8GKzzKtskAePKcV4C45F6udRSIz+63pTzbcbC2HokwkpL/8CvH89FZns8/JsZ5EhnmcGHX+QjoQPrSWKTQLdKgdqI5gBoohxR+E23A0JL0Jpw0c6JUOC+/hIl026GOPI8JOiMznlPnVz+uEauNFfL5X01vOeVkW6x6OvhmR73Wwwdts7N/MQHfL+eb3O8chZCQr4LkrACYmVKKexstDq2olR/0SONku0VlFfSUnJRPBOWmymkokhMIKxwJl99WPUMUMZfIuz6+kWW03cbrBCBdIezaWl/rSx9UiuzvR4YLJ4E8ktNMPc6GO1Gy9pbwk6mPXyC7ldDRROq1nXFF0EiHvIzujqYnmr60FKwQgK/a8YeAJWIhKXUSiMB29a1lfShrfszJwEdL0QCgJZMKAJ/WQnc1lMAodSwdnUgFTRQPAmQT/X5OJQQ1IWDnVNPAXP9LepzQ4Snez2N3Mt1gATqvIRIgADJr2sK+trzjAgTljKEI7ZUsaDkdGCNnoJxS8kv6huRScB/G3+9lZuJDjzjbPgimngNz+7o7+G7RxD+ndgB7+vd6kKrsf/q3mrRcWVftUyjtmGopHTgvsvy7iGa1i4Iow4Doy+rGY2hcYBY+ejxehLkxsJ5jo2GzhmJYkuUjS1jbUaAyNcfvMPGYaBFPsbf64vS6Q4XHJJ9UNAbNgmYkSiGBGDfji9iy70EwHhUjwKBLfkkNIG85yYQs0kJnJDE01zTMiKYuKYPJES6Q41kP+gt0xwi5oEd858WJoCSY1WtX0+AiN3fL19sqd3OHwdshtJ+26E0g2bSxoEzHwFuOpiWt032+Tqx9y/bROAe4ALERBFjOdhz5AaG8YdNcKjG8hgAAgbu96DZjHBnRZjtDil/4LsGy/5ifzCZ/h8PJnSOsH+PqDnNKaswgZmDqhWXYTSL8ngFI6UdzYbU0WwYqSnjVhx/bgKHFAF1Re7NwynyFy58OMUVCK5i/EpB7W40N4EmpDQCWDTbYx5CcDzH8+aYdjyHw7smMhDvDb7jN9g3KuDY/IH8BP4Djn+jjMpd6RcAAAAASUVORK5CYII=); }'+
    '</style>');
    //if (GM_getValue('friendcheck'))
        //$('#droplist_wrapper').append('');
    //load friends, block list, requests
    /*var frd = !GM_getValue('friendcheck');
    var req = frd;
    var block = !GM_getValue('checkBlocked');
    if (frd && req && block) {
        refreshList();
        return;
    }

    function listDone(result, type) {
        if (result === false) {
            result = [];
        }
        if (type == 'frd') { frd = true; friends = result; }
        if (type == 'block') { block = true; blocked = result; }
        if (type == 'req') { req = true; requests = result; }
        if (frd && req && block) {
            refreshList();
        }
    }

    if (!frd) setTimeout(function() {
        getFriends(function(result) {
            listDone(result, 'frd');
        });
    }, 1000);
    if (!block) setTimeout(function() {
        getBlocked(function(result) {
            listDone(result, 'block');
        });
    }, 2000);
    if (!req) setTimeout(function() {
        getRequests(function(result) {
            listDone(result, 'req');
        });
    }, 3000);
	setTimeout(function() {
		refreshList();//$('#sct-reffrd').click();
	}, 500);*/refreshList();
}
function showSettings() {
    $('.span1col > *').remove(); // cut: <li> <input type="checkbox" id="friendcheck" class="sct-settings">Check friends list<span class="info">Show friends with blue names on droplist. It may take a couple extra seconds to load the list.</span></li>
    $('.span1col').append('<div id="sct-settings-main" class="commonPageContainer gridPanel"> <h1>Settings</h1><ul id="primary_settings"> <li> <input type="checkbox" id="debug" class="sct-settings">Debug mode<span class="info">Show more info in the console. Mainly for development, but also useful for bug reporting.</span></li><li> <input type="checkbox" id="checkBlocked" class="sct-settings">Check blocked players<span class="info">If this option is checked, blocked players will be skipped when sending friend requests.\nOtherwise the player will automatically be unblocked if you quick-add them.</span></li><li> <input type="checkbox" id="stats" class="sct-settings">Check stats <span class="info">Retrieve stats, most notably amount of money, for players, and display it in the droplist.</span></li><li> <input type="checkbox" id="silent" class="sct-settings">Silent mode <span class="orange">*</span><span class="info">Don\'t show any popups/alerts/confirmations. Not recommended.</span></li><li> <input type="checkbox" id="limit" class="sct-settings">Personal limit - <input id="limitVal" type="number"><span> mil</span><span class="info">Set a personal limit of how much money is too much for joining your drop.<br><i>This won\'t affect the amount turning red for 500m+ (aka blacklist-worthy.)</i><br>To edit: uncheck the box, change the number, then check it again. Minimum: 10m, maximum: 499m.</span></li><li> <input type="checkbox" id="pfps" class="sct-settings">Show profile pics<span class="info">Show (social club) profile pics for users in the droplist. Shouldn\'t affect performance.</span></li></ul> <span class="footer"><span class="orange">*</span> Will only take effect once the page is reloaded.</span></div>');
    $('.span1col').append('<div id="sct-settings-buttons" class="commonPageContainer gridPanel"> <h1>Buttons</h1> <span>Enable/disable the buttons at the top. You likely won\'t find all of them to be useful.</span><ul id="button_settings"> <li> <input id="auto" class="sct-settings" type="checkbox">Auto-accept <span class="blue">*</span></li><li> <input type="checkbox" id="delete" class="sct-settings">Delete friends / Delete non-dropees</li><li> <input type="checkbox" id="accept" class="sct-settings">Accept requests / Accept dropees</li><li> <input type="checkbox" id="reject" class="sct-settings">Reject requests / Reject non-dropees</li><li> <input type="checkbox" id="quickadd" class="sct-settings">Quick-add user</li><li> <input type="checkbox" id="messages" class="sct-settings">Delete messages</li> <li> <input type="checkbox" id="delete2" class="sct-settings">Delete dropees <span class="blue">*</span></li><li> <input type="checkbox" id="settings-link" class="sct-settings">Settings (link to this page)</li> </ul> <span class="footer"><span class="blue">*</span> Only appears when a droplist is active (the checkbox does work :^) )</span></div>');
    $('head').append('<style>h1 { color:  #fff; } .commonPageContainer.gridPanel { padding: 10px !important; } li { color: #bbb; } span.info { display: block; color: #666; margin-left: 25px; } input.sct-settings {-webkit-appearance: none;width: 16px;height: 16px;background: #333;border: 2px solid #555;margin: 9px 5px 0px 0px;border-radius: 3px;} input.sct-settings:hover { background: #444; border-color: #777; } div#sct-settings-main { width: 59%; float: left; } div#sct-settings-buttons { width: 39%; float: right; } h4 { color: #bbb; } span { color: #bbb; } span.comingSoon { color: #ff6c00; } input.sct-settings:checked { background-image: url(https://www.degoudenton.nl/skin/frontend/default/degoudenton/images/checkmark-orng.png); background-repeat: no-repeat; } input.sct-settings:disabled { background: #000; border-color: #222; pointer-events: none; } input.sct-settings:focus { outline: none; border: 2px solid #555; box-shadow: 0 0 7px 1px rgba(252, 175, 23, 0.5); } span.orange { color: orange; } span.blue { color: #49c3ff } span.footer { display: block; margin-top: 20px; } input#limitVal { background:  #444; border:  2px solid #666; color:  #bbb; border-radius: 3px; padding: 0 2px; width: 27px; } input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }</style>');

    // set everything to proper value on load
    var vList = ["delete", "accept", "reject", "quickadd", "messages", "delete2", "settings-link", "debug", "checkBlocked", "stats", "silent", "auto", "friendcheck", "pfps"];
    for (var i in vList)
        $('#'+vList[i]).prop('checked', GM_getValue(vList[i]));
    if (GM_getValue('limit')) {
        $('#limit').prop('checked', true);
        $('#limitVal').val(GM_getValue('limit')/1000000);
    }
    if (GM_getValue('settings-link'))
        $('<a class="btn btnGold btnRounded sctb" href="/settings/tools" id="sct-settings">settings</a>').prependTo('#page');


    setTimeout(showButtons, 50, 'settings');
    // actually do something when the settings are changed
    $('#page').on('click', '.sct-settings', function() {
        if (this.id == 'auto') toggleAuto();
        var idMap = {
            "auto": "sct-auto",
            "delete": "sct-delfrd",
            "accept": "sct-accreq",
            "reject": "sct-rejreq",
            "quickadd": "sct-qckadd",
            "messages": "sct-delmsg",
            "delete2": "sct-deldrp",
            "settings-link": "sct-settings"
        };
        GM_setValue(this.id, this.checked);
        if (idMap[this.id]) {
            if (this.checked && !document.getElementById(idMap[this.id])) {
                if (this.id == 'settings-link')
                    $('<a class="btn btnGold btnRounded sctb" href="/settings/tools" id="'+idMap[this.id]+'">settings</a>').prependTo('#page');
                else if (this.id == 'auto')
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="'+idMap[this.id]+'">auto-accept <span class="off">[off]</span></a>').prependTo('#page');
                else if (this.id !== 'delete2' || isDL())
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="'+idMap[this.id]+'">'+$(this).parent().text()+'</a>').prependTo('#page');
            } else if (document.getElementById(idMap[this.id])) {
                $('#'+idMap[this.id]).remove();
            }
        } else if (this.id == 'limit') {
            if (!this.checked) {
                $('#limitVal').val('');
                return;
            }
            var n = parseInt( $('#limitVal').val() );
            if (!n || isNaN(n) || n > 499 || n < 10) {
                $('#limit').prop('checked', false);
                GM_setValue('limit', false);
                $('#limitVal').val('');
            } else {
                GM_setValue('limit', n*1000000);
                $('#limitVal').val(GM_getValue('limit')/1000000);
            }
        }
		refreshButtons();
    });
}

function showButtons(pageType) {
    $('#page > .sctb').remove();
    if (pageType === undefined) pageType = 'other';
    if (pageType !== 'settings') {
        $('#loggedIn ul.dropdown-menu').append('<li><a id="sct-set-link" href="/settings/tools" title="SC Tools Settings" class="logoutlink"><i class="scicon-nav_scts"><style>i.scicon-nav_scts:before { content: "\\f119"; }</style></i>SC Tools Settings</a></li>');
        if (GM_getValue('settings-link'))
            $('<a class="btn btnGold btnRounded sctb" href="/settings/tools" id="sct-settings">settings</a>').prependTo('#page');
    }
    if (pageType !== 'droplist') {
        $('<a class="btn btnGold btnRounded sctb" href="/tools" id="sct-sllink">edit droplist</a>').prependTo('#page');
    }
    var btns = [
        { val: "auto", id: "sct-auto", text: 'auto-accept <span class="off">[off]</span>' },
        { val: "delete", id: "sct-delfrd", text: "delete friends" },
        { val: "accept", id: "sct-accreq", text: "accept requests" },
        { val: "reject", id: "sct-rejreq", text: "reject requests" },
        { val: "quickadd", id: "sct-qckadd", text: "quick-add user" },
        { val: "messages", id: "sct-delmsg", text: "delete messages" },
        { val: "delete2", id: "sct-deldrp", text: "delete dropees" }
    ];
    for (var i in btns)
        if (GM_getValue(btns[i].val))
            $('<a class="btn btnGold btnRounded sctb" href="#" id="'+btns[i].id+'">'+btns[i].text+'</a>').prependTo('#page');
	refreshButtons();
}
function refreshButtons() { //changes buttons to match the context
	if (isDL()) {
		$('#sct-delfrd').text('delete non-dropees');
		$('#sct-accreq').text('accept dropees');
		$('#sct-rejreq').text('reject non-dropees');
		$('#sct-auto').show();
		$('#sct-deldrp').show();
	} else {
		$('#sct-delfrd').text('delete friends');
		$('#sct-accreq').text('accept requests');
		$('#sct-rejreq').text('reject requests');
		$('#sct-auto').hide();
		$('#sct-deldrp').hide();
	}
}

function toggleAuto(state) { //can disable from any call, only enabled with timeout ID
    if (state === undefined) {
        state = false;
    } else if (state == 'pause') {
        if (auto) {
            autoPaused = true;
            $('#sct-auto > span').replaceWith('<span class="paused">[paused]</span>');
        }
        return;
    } else if (state == 'unpause') {
        if (auto) {
            autoPaused = false;
            $('#sct-auto > span').replaceWith('<span class="on">[on]</span>');
        }
        return;
    }
    if ( (!GM_getValue('auto') && !auto) || state === auto )
        return false;
    if (!auto && state) {
       auto = state;
    }
    else if (auto && !state) {
        clearInterval(auto);
        auto = false;
        autoPaused = false;
    }
    if (auto) $('#sct-auto > span').replaceWith('<span class="on">[on]</span>');
    else $('#sct-auto > span').replaceWith('<span class="off">[off]</span>');
    // else they are the same, don't change
}

// --- Droplist functions ---

// refresh the visual list
function refreshList() {
    var dl = GM_getValue('droplist');
    $('#current_list > li').remove();
    if (!dl || dl.length === 0) {
        $('#current_list').append('<li class="empty">Nothin\' here, man</li>');
        refreshButtons();
        return;
    }
    for (var i in dl) {
        let friendButton = '';
		let name = '<span class="fail">'+dl[i].sc+'</span>';
		if (dl[i].sc && dl[i].sc.match(sc)) {
            if (dl[i].Relation == 'BlockedByMe' || dl[i].Relation == 'BlockedByThem') {
                name = '<a href="/member/'+dl[i].sc+'" class="bl">'+dl[i].sc+'</a>';
				friendButton = '<span class="sctb-16 sct-ubl"></span>';
            } else if (dl[i].Relation == 'Friend') {
                name = '<a href="/member/'+dl[i].sc+'" class="friend">'+dl[i].sc+'</a>';
                friendButton = '<span class="sctb-16 sct-delfrd"></span>';
            } else if (dl[i].Relation == 'InvitedByMe') {
                name = '<a href="/member/'+dl[i].sc+'" class="pending">'+dl[i].sc+'</a>';
                friendButton = '<span class="sctb-16 sct-cancel"></span>';
            } else if (dl[i].Relation == 'InvitedByThem') {
                name = '<a href="/member/'+dl[i].sc+'" class="pending">'+dl[i].sc+'</a>';
                friendButton = '<span class="sctb-16 sct-rejreq"></span><span class="sctb-16 sct-accreq"></span>';
            } else {
                name = '<a href="/member/'+dl[i].sc+'">'+dl[i].sc+'</a>';
                friendButton = '<span class="sctb-16 sct-addfrd"></span>';
            }

			if (dl[i].Relation !== 'BlockedByMe' && dl[i].Relation !== 'BlockedByThem') {
				friendButton = '<span class="sctb-16 sct-bl"></span>'+friendButton;
            }
			if (!dl[i].scExists) {
				friendButton = '';
				name = '<span class="unknown">'+dl[i].sc+'</span>';
			}
        }
		// '+(dl[i].sc && dl[i].sc.match(sc) ? ' data-sc="'+dl[i].sc+'"' : '')+'
        $('#current_list').append('<li> '+
            (GM_getValue('pfps') && friendButton ? '<img src="https://a.rsg.sc/n/'+dl[i].sc+'/l"/>' : '')+
            //'<span class="gray">SC: </span>'+
            name+
			'<span class="gray"> | Discord: </span>'+dl[i].discord+
            (GM_getValue('stats') ? '<span class="gray"> | </span>💰 '+
                (GM_getValue('limit') && dl[i].rawMoney > GM_getValue('limit') ? '<span class="fail">'+dl[i].money+'</span>' : dl[i].money)
             : '')+
            (GM_getValue('stats') ? '<span class="gray"> | </span>🌐 '+dl[i].rank : '')+
            //'<span class="gray"> | Drops: </span>'+dl[i].drops+ // dropBot has removed this for limited lobbies
            '<span class="sctb-16 sct-del"></span>'+
            (/*GM_getValue('stats') && */dl[i].sc && dl[i].sc.match(sc) ? '<span class="sctb-16 sct-rel"></span>' : '')+
            (/*GM_getValue('stats') && */i % 12 === 0 ? '<span class="sctb-16 sct-rel12"></span>' : '')+friendButton+
        '</li>');
    }
    $('#current_list').append('<li class="total gray">Total dropees: <b>'+$('#current_list > li').length+'</b></li>');
    refreshButtons();
}
function saveList(dl) { //save list with no null/undefined bullshit
    if (!dl || !Array.isArray(dl))
        return false;
    var newList = [];
    for (var i in dl) {
        if (dl[i].sc == '<span class="unknown">???</span>' && dl[i].discord == '<span class="unknown">???</span>')
            continue;
        newList.push(dl[i]);
    }
    GM_setValue('droplist', newList);
    return true;
}
function isDL() {
    return GM_getValue('droplist').length > 0;
}
function isOnDroplist(sc) {
    var dl = GM_getValue('droplist').map(e => { return e.sc.toLowerCase(); });
    sc = sc.toLowerCase();
    return dl.indexOf(sc) > -1;
}
function getDropee(sc) {
    var dl = GM_getValue('droplist').map(e => { return e.sc.toLowerCase(); });
    sc = sc.toLowerCase();
    if (dl.indexOf(sc) > -1)
        return dl[dl.indexOf(sc)];
    else return false;
}
function getDropeeIndex(sc) {
    var dl = GM_getValue('droplist').map(e => { return e.sc.toLowerCase(); });
    sc = sc.toLowerCase();
    return dl.indexOf(sc);
}
/*function refreshMember(index) {
    var dropee = GM_getValue('droplist')[index];
    $('#current_list > li[data-sc="'+dropee.sc+'"]').replaceWith('<li'+(dropee.sc.match(sc) ? ' data-sc="'+dropee.sc+'"' : '')+'> '+
        (GM_getValue('pfps') && dropee.sc.match(sc) ? '<img src="https://a.rsg.sc/n/'+dropee.sc+'/l"/>' : '')+
        '<span class="gray">SC: </span>'+
        (blocked.indexOf(dropee.sc.toLowerCase()) ? '<span class="bl">'+dropee.sc+'</span>' :
            (friendNames.indexOf(dropee.sc.toLowerCase()) > -1 ? '<span class="friend">'+dropee.sc+'</span>' : dropee.sc)
        )+'<span class="gray"> | Discord: </span>'+dropee.discord+
        (GM_getValue('stats') ? '<span class="gray"> | </span>💰 '+
            (GM_getValue('limit') && dropee.rawMoney > GM_getValue('limit') ? '<span class="fail">'+dropee.money+'</span>' : dropee.money)
         : '')+
        (GM_getValue('stats') ? '<span class="gray"> | </span>🌐 '+dropee.rank : '')+
        '<span class="gray"> | Drops: </span>'+dropee.drops+
        '<span class="sctb-16 sct-del"></span>'+
        (GM_getValue('stats') && dropee.sc.match(sc) ? '<span class="sctb-16 sct-rel"></span>' : '')+
        (GM_getValue('stats') && i % 12 === 0 ? '<span class="sctb-16 sct-rel12"></span>' : '')+friendButton+
    '</li>');
}*/

// returns an updated dropee object OR false if error
// dropee is a droplist item - it has {sc, discord, money, rank, drops}
function getStats(dropee, callback) {
    try {
        if (!dropee.sc || !dropee.sc.match(sc)) {
            callback(dropee);
			return false;
        }
        $.ajax({
            url: baseURL+"/games/gtav/career/overviewAjax?character=Freemode&nickname="+dropee.sc+"&slot=Freemode&gamerHandle=&gamerTag=&_="+Date.now(),
                type: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "RequestVerificationToken": verificationToken
                },
            error: function(err){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("overviewAjax AJAX FAIL");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(err);
                    console.groupEnd();
                    console.groupEnd();
                }
                console.error('Error retrieving stats for player '+dropee.sc+'.');
                callback(false);
            },
            success: function(data){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("overviewAjax AJAX OK");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(data);
                    console.groupEnd();
                    console.groupEnd();
                }
                if ( $(data).prop('id') == 'sectionBlockedStats') {
                    console.warn('No stats available for '+dropee.sc+' due to privacy settings.');
                    dropee.rank = '<span class="unknown">???</span>';
                    dropee.money = '<span class="unknown">???</span>';
                } else if ( data.includes("window.SCSettings.nickname = '';") ) {
                    console.warn('Social club account '+dropee.sc+' does not exist.');
                    dropee.sc = '<span class="unknown">'+dropee.sc+'</span>';
                    dropee.rank = '--';
                    dropee.money = '--';
					dropee.scExists = false;
                } else {
                    dropee.rank = parseInt( $(data).find('#freemodeRank > div.rankHex > h3').text() );
                    var cash = parseInt( $(data).find('#cash-value').text().replace(/[^\d]/g, '') );
                    var bank = parseInt( $(data).find('#bank-value').text().replace(/[^\d]/g, '') );
                    dropee.money = Number(cash + bank).toLocaleString();
                    //small note - no commas will appear in safari. but fuck safari anyway

                    dropee.rawMoney = cash + bank;
                    if (dropee.rawMoney > 500000000)
                        dropee.money = '<span class="bl">'+dropee.money+'</span>';

                    if (dropee.rank === 0) {
                        dropee.rank = '<span class="fail">???</span>';
                        dropee.money = '<span class="fail">???</span>';
                    }
                }
                callback(dropee);
            }
        });
    } catch (err) {
        console.error("Error retrieving stats for "+dropee.sc+".");
        callback(false);
        return false;
    }
}

// --- Droplist button functions ---
$('#page').on('click', '#sct-clear', function() {
    saveList([]);
    refreshList();
});

$('#page').on('click', '#sct-reffrd', function() {
	if (GM_getValue('debug'))
		console.log('Fetching friends, requests, and block list.');
	/*var frd = !GM_getValue('friendcheck');
    var req = frd;
    var block = !GM_getValue('checkBlocked');
    if (frd && req && block) {
        refreshList();
        return;
    }
    function listDone(result, type) {
        if (result === false) {
            result = [];
        }
        if (type == 'frd') { frd = true; friends = result; }
        if (type == 'block') { block = true; blocked = result; }
        if (type == 'req') { req = true; requests = result; }
        if (frd && req && block) {
			if (GM_getValue('debug'))
				console.log('Finished fetching friends, requests, and block list.');
            refreshList();
        }
    }

    if (!frd) setTimeout(function() {
        getFriends(function(result) {
            listDone(result, 'frd');
        });
    }, 1000);
    if (!block) setTimeout(function() {
        getBlocked(function(result) {
            listDone(result, 'block');
        });
    }, 2000);
    if (!req) setTimeout(function() {
        getRequests(function(result) {
            listDone(result, 'req');
        });
    }, 3000);*/
	swal({
		title: "Getting info...",
		html: true,
		text: "Getting info (friends list, friend requests, block list etc.)<br>"+
				  "<i>This should only take a few seconds.</i><br>"+
				  '<strong style="font-weight:bold;">Getting <span id="sct-reffrd-text">block list</span>...</strong>',
		imageUrl: "https://i.imgur.com/ckmgnZ3.gif",
		showConfirmButton: false,
		allowOutsideClick: false
	});
	var list = GM_getValue('droplist');
	getBlocked(function(blocked) {
		$('#sct-reffrd-text').text('friend requests');
		setTimeout(getRequests, 1000, function(requests) {
			$('#sct-reffrd-text').text('friends');
			setTimeout(getFriends, 1000, function(friends) {
				var all = [];
				if (blocked) {
					for (var i in blocked) {
						blocked[i].Relationship = "BlockedByMe";
					}
					all = all.concat(blocked);
				}
				if (requests) {
					for (var j in requests) {
						requests[j].Relationship = "InvitedByThem";
					}
					all = all.concat(requests);
				}
				if (friends)
					all = all.concat(friends);
				var allNames = all.map(item => {
					return item.Name.toLowerCase();
				});
				for (var k in list) {
					var b = allNames.indexOf(list[k].sc.toLowerCase());
					if (b > -1) {
						list[k].Relation = all[b].Relationship;
						list[k].scExists = true;
						list[k].RockstarId = all[b].RockstarId;
					} else {
						list[k].Relation = "None";
					}
				}
				if (list !== GM_getValue('droplist')) {
					swal({
						title: "Finished!",
						text: "Finished retrieving friend info.",
						type: "success",
						showConfirmButton: false,
						timer: 1000
					});
					saveList(list);
					refreshList();
				} else swal({
					title: "Finished!",
					text: "No change in your friends list/friend requests.",
					type: "success",
					showConfirmButton: false,
					timer: 2000
				});
			});
		});
	});
});

$('#page').on('click', '#sct-add', function() {
    toggleAuto('pause');
    var txt = $('#droplist_input').val();
    $('#droplist_input').val('');
    txt = txt.split('\n');
    var leftovers = false;
    var l = false;
    if (txt.length > 12 && GM_getValue('stats')) {
        l = true;
        leftovers = txt.splice(12, txt.length - 12);
    }
    var list = GM_getValue('droplist');
    var n = 0;
    var done = [];

    function memberDone(member) {
		n++;
		$('#sct-stats-progress-current').text(txt.length - n);

		if (!isOnDroplist(member.sc))
			done.push(member);

		if (n == txt.length) {//done with reqs
			swal({
				title: "Finished!",
				text: "Finished retrieving player stats.<br><i>Refreshing friends list soon...</i>",
				type: "success",
				showConfirmButton: false,
				timer: 1000
			});
			toggleAuto('unpause');

			saveList(list.concat(done));
			refreshList();
			setTimeout( function() {
				$('#sct-reffrd').click();
			}, 1000);
		}
	}

	swal({
		title: "Getting info...",
		html: true,
		text: "Getting stats for players.<br>"+
				  "This should only take a few seconds.<br>"+
				  "<strong id=\"sct-details-progress\" style=\"font-weight:bold;\"><br><br><span id=\"sct-details-progress-current\">"+txt.length+"</span> of "+
				  "<span id=\"sct-details-progress-total\">"+txt.length+"</span> player(s) remaining...</strong>",
		imageUrl: "https://i.imgur.com/ckmgnZ3.gif",
		showConfirmButton: false,
		allowOutsideClick: false
	});

	for (var i in txt) {
		var temp = txt[i].split(/(Discord: )|( - ID: )|( - SC: )|( - Drops Attended: )/).filter(item => {
			return item; //remove undefined and ''
		});
		//if (GM_getValue('debug')) console.log(temp);

		var member = {
			sc: '<span class="unknown">???</span>',
			rank: '<span class="unknown">???</span>',
			money: '<span class="unknown">???</span>',
			rawMoney: 0,
			discord: '<span class="unknown">???</span>',
			drops: '<span class="unknown">???</span>',
			id: '<span class="unknown">???</span>',
			RockstarId: false,
			Relation: false,
			scExists: undefined
		};

		if (temp.indexOf('Discord: ') !== -1)
			member.discord = temp[temp.indexOf('Discord Name: ') + 1];

		if (temp.indexOf(' - ID: ') !== -1)
			member.id = temp[temp.indexOf(' - Discord ID: ') + 1];

		if (temp.indexOf(' - SC: ') !== -1) {
			member.sc = temp[temp.indexOf(' - SC: ') + 1];
			if ( !member.sc.match(sc) ) {
				member.sc = '<span class="fail">'+member.sc+'</span>';
				member.rank = '--';
				member.money = '--';
			} else if ( member.sc.toLowerCase() == userNickname.toLowerCase() ) {
				member.sc = '<span class="me">'+member.sc+'</span>';
				member.rank = '--';
				member.money = '--';
			}
		}

		if (temp.indexOf(' - Drops Attended: ') !== -1)
			member.drops = temp[temp.indexOf(' - Drops Attended: ') + 1];

		//check for dupe by SC
		if (isOnDroplist(member.sc)) {
			console.log('Duplicate dropee '+member.sc+' skipped.');
			memberDone(member);
			continue;
		}
		setTimeout(getStats, 1000*i, member, memberDone);
	}
    if (leftovers) {
        $('#droplist_input').val(leftovers.join('\n'));
    }
});

$('#page').on('click', '#sct-remove', function() {
    var txt = $('#droplist_input').val();
    txt = txt.split('\n');
    var list = GM_getValue('droplist');

    for (var i in txt) {
        var temp = txt[i].split(/(Discord: )|( - ID: )|( - SC: )|( - Drops Attended: )/).filter(item => {
            return item; //remove undefined and ''
        });
        var ids = list.map(item => { return item.id; });
        var s = list.map(item => { return item.sc.toLowerCase(); });
        var sc = temp[temp.indexOf(' - SC: ') + 1].toLowerCase();
        var id = temp[temp.indexOf(' - ID: ') + 1];

        if (s.indexOf(sc) > -1)
            list.splice(s.indexOf(sc), 1);
        else if (ids.indexOf(id) > -1) {
            list.splice(ids.indexOf(id), 1);
        }
    }
    saveList(list);
    refreshList();
    $('#droplist_input').val('');
});

$('#page').on('click', '.sct-rel12', function() {
	var ind = $(this).parent().index();
	var len = $('#current_list > li').length - ind;
	if (len > 12) len = 12;
	toggleAuto('pause');
	//console.log(ind +' '+ len);
	var oldList = GM_getValue('droplist');
	var list = oldList.slice(ind, ind+len);
	//console.log(oldList);
	//console.log(list);
	var n = 0;
	//var oldSCList = list.map(e => { return e.sc; });

	function memberDone(member) {
		n++;
		$('#sct-stats-progress-current').text(list.length - n);

		oldList[n + ind - 1] = member;

		if (n == list.length-1) {//done with reqs
			swal({
				title: "Finished!",
				text: "Finished retrieving player stats.",
				type: "success",
				showConfirmButton: false,
				timer: 1000
			});
			toggleAuto('unpause');

			saveList(oldList);
			refreshList();
		}
	}

	swal({
		title: "Getting info...",
		html: true,
		text: "Getting stats for players.<br>"+
				  "This should only take a few seconds.<br>"+
				  "<strong id=\"sct-details-progress\" style=\"font-weight:bold;\"><br><br><span id=\"sct-details-progress-current\">"+list.length+"</span> of "+
				  "<span id=\"sct-details-progress-total\">"+list.length+"</span> player(s) remaining...</strong>",
		imageUrl: "https://i.imgur.com/ckmgnZ3.gif",
		showConfirmButton: false,
		allowOutsideClick: false
	});

    for (var i in list) {
        setTimeout(getStats, 1000*i, list[i], memberDone);
    }
});

// use .on() here because contents matching the selector change
$('#page').on('click', '.sct-rel', function() {
	var list = GM_getValue('droplist');
    var i = $(this).parent().index();
	//var sc = list[i].sc;//$(this).parent().attr('data-sc');

    if (GM_getValue('debug')) console.log('Fetching stats for SC: '+list[i].sc+' (index: '+i+')');

    if (!list[i].scExists)
        return console.warn('Skipping '+list[i].sc+' ('+list[i].discord+') - They do not have a valid social club name saved.');

	swal({
        title: "Getting stats...",
        html: true,
        text: '<span id="rel-popup-text">Getting stats</span> for '+list[i].sc+'.<br>'+
              '<i>This should only take a second.</i>',
        imageUrl: "https://i.imgur.com/ckmgnZ3.gif",
        showConfirmButton: false,
        allowOutsideClick: false
    });

    getStats(list[i], function(member) {
		if (!member) {
			swal({
                title: "Error",
                text: "Failed to retrieve player stats.",
                type: "error",
                showConfirmButton: true,
                timer: 3000
            });
			return false;
		} else {
			$('#rel-popup-text').text('Getting friend info');
		}
        //if (GM_getValue('debug')) console.log(member);
		getDetails(member, function(member2) {
			swal({
                title: "Finished",
                text: "Finished retrieving player stats and friend info.",
                type: "success",
                showConfirmButton: true,
                timer: 2000
            });
			list[i] = member2;
			saveList(list);
			refreshList();
		});
    });
});

$('#page').on('click', '.sct-del', function() {
    var list = GM_getValue('droplist');
    list.splice($(this).parent().index(), 1);
    saveList(list);
	refreshList();
    //$(this).parent().remove();
	//$('li.total').html('Total dropees: <b>'+( $('#current_list > li').length - 1 )+'</b>');
});

$('#page').on('click', '.sct-accreq, .sct-addfrd, .sct-delfrd, .sct-rejreq, .sct-cancel, .sct-bl, .sct-ubl', function() {
    var i = $(this).parent().index();
    var dl = GM_getValue('droplist');
    var type = {
        'sct-accreq': {
            name: 'confirm',
            title: 'Request accepted',
            errTitle: 'Request not accepted',
            text: 'The friend request you received from '+dl[i].sc+' has been accepted.',
            errText: 'The friend request you received from '+dl[i].sc+' could not be accepted.',
            newRelation: 'Friend'
        },
        'sct-addfrd': {
            name: 'addfriend',
            title: 'Request sent',
            errTitle: 'Request not sent',
            text: 'A friend request has been sent to '+dl[i].sc+'.',
            errText: 'Could not send a friend request to '+dl[i].sc+'.',
            newRelation: 'InvitedByMe'
        },
        'sct-rejreq': {
            name: 'ignore',
            title: 'Request rejected',
            errTitle: 'Request not rejected',
            text: 'The friend request you received from '+dl[i].sc+' has been rejected.',
            errText: 'The friend request you received from '+dl[i].sc+' could not be rejected.',
            newRelation: 'None'
        },
        'sct-delfrd': {
            name: 'delete',
            title: 'Friend removed',
            errTitle: 'Friend not removed',
            text: 'Your friend '+dl[i].sc+' has been removed.',
            errText: 'Your friend '+dl[i].sc+' could not be removed.',
            newRelation: 'None'
        },
        'sct-cancel': {
            name: 'cancel',
            title: 'Request cancelled',
            errTitle: 'Request not cancelled',
            text: 'The friend request you sent to '+dl[i].sc+' has been cancelled.',
            errText: 'The friend request you sent to '+dl[i].sc+' could not be cancelled.',
            newRelation: 'None'
        },
        'sct-bl': {
            name: 'block',
            title: 'User blocked',
            errTitle: 'User not blocked',
            text: 'Successfully blocked '+dl[i].sc+'.',
            errText: 'Failed to block '+dl[i].sc+'.',
            newRelation: 'BlockedByMe'
        },
        'sct-ubl': {
            name: 'unblock',
            title: 'User unblocked',
            errTitle: 'User not unblocked',
            text: 'Successfully unblocked '+dl[i].sc+'.',
            errText: 'Failed to unblock '+dl[i].sc+'.',
            newRelation: 'None'
        }
    }[this.className.split(' ')[1]];
    updateFriend(type.name, dl[i], function(result) {
        if (result) {
            swal({
                allowOutsideClick: true,
                text: type.text,
                title: type.title,
                timer: 2000,
                type: "success",
            });
            dl[i].Relation = type.newRelation;
            saveList(dl);
            refreshList();
        } else {
            swal({
                allowOutsideClick: true,
                text: type.errText,
                title: type.errTitle,
                timer: 2000,
                type: "error",
            });
        }
    });
});

// --- Button functions ---

// -- Delete messages --
$('#page').on('click', '#sct-delmsg', function(e) {
    e.preventDefault();
	var errCount = 0;

    try {
        swal({
            allowEscapeKey: false,
            cancelButtonText: "No",
            closeOnConfirm: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            html: true,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            text: "All messages will be deleted from your inbox.<br /><br />"+
                  "It might take a minute or two, so be patient."+
                  "<strong id=\"sct-delmsg-retrieving\" style=\"font-weight:bold;display:none;\"><br /><br />Retrieving <span id=\"sct-delmsg-retrieving-text\">conversation list</span>..."+
                  "</strong><strong id=\"sct-delmsg-progress\" style=\"font-weight:bold;display:none;\"><br /><br /><span id=\"sct-delmsg-progress-current\">0</span> of "+
                  "<span id=\"sct-delmsg-progress-total\">0</span> message(s) remaining...</strong>",
            title: "Are you sure?",
            type: "warning",
        },
        function(isConfirm) {
            if (isConfirm) {
                toggleAuto('pause');
                $.ajax({
                    url: baseURL+"/Message/GetMessageCount",
                    headers: {
                        "Accept": "application/json",
                        "RequestVerificationToken": verificationToken
                    },
                    error: function(err){
                        if (GM_getValue('debug')) {
                            console.groupCollapsed("GetMessageCount AJAX FAIL");
                            console.group("Request");
                            console.log(this);
                            console.groupEnd();
                            console.group("Response");
                            console.log(err);
                            console.groupEnd();
                            console.groupEnd();
                        }

                        swal({
                            allowOutsideClick: true,
                            text: "Something went wrong while trying to fetch the total amount of messages.",
                            title: err.status+" - "+err.statusText,
                            timer: 5000,
                            type: "error",
                        });
                        toggleAuto('unpause');
                    },
                    success: function(data){
                        if (GM_getValue('debug')) {
                            console.groupCollapsed("GetMessageCount AJAX OK");
                            console.group("Request");
                            console.log(this);
                            console.groupEnd();
                            console.group("Response");
                            console.log(data);
                            console.groupEnd();
                            console.groupEnd();
                        }

                        if (data.Total > 0) {
                            $('#sct-delmsg-progress-current').text(data.Total);
                            $('#sct-delmsg-progress-total').text(data.Total);
                            $('#sct-delmsg-retrieving').show();
                            getAllMessages(function(msgs) {
								$('#sct-delmsg-retrieving').hide();
								$('#sct-delmsg-progress').show();
                                for (var i in msgs) {
                                    setTimeout(deleteMessage, 1000*i, msgs[i], function(status, pos) {
										if (!status) errCount++;
										//console.log((msgs.length-pos-1)+' out of '+msgs.length+' messages remaining');
                                        if (pos == msgs.length-1) {
											swal({
                                                allowOutsideClick: true,
                                                text: (errCount > 0) ? errCount+" messages could not be removed." : "All messages have been deleted from your inbox.",
                                                title: "Messages deleted",
                                                timer: 1000,
                                                type: (errCount > 0) ? "warning" : "success",
                                            });
                                            console.log('All messages deleted.');
											toggleAuto('unpause');
											return;
                                        } else
                                            $('#sct-delmsg-progress-current').text(msgs.length-pos-1);
                                    }, i);
                                }
                            }, data.Total);

                        } else {
                            swal({
                                allowOutsideClick: true,
                                text: "There were no messages to delete.",
                                title: "No messages",
                                timer: 2000,
                                type: "success",
                            });
                            toggleAuto('unpause');
                        }
                    }
                });
            } else {
                return;
            }
        });
    } catch (err) {
        console.error("Error during #sct-delmsg.click():\n\n"+err.stack);
        return;
    }
});

// -- Quick-add User --
$('#page').on('click', '#sct-qckadd', function(e) {
	e.preventDefault();

	try {
		swal({
			allowEscapeKey: false,
			closeOnConfirm: false,
			confirmButtonText: "Add",
			inputPlaceholder: "Social Club username",
			showCancelButton: true,
			showLoaderOnConfirm: true,
			text: 'Please enter the Social Club username you want to add. When you click "Add", the user will automatically be added if it exists.'+
			(GM_getValue('checkBlocked') ? "" : "\n\nNote: You have disabled the blocked users list check. If the user is on your blocked users list, they will be unblocked and sent a friend request."),
			title: "Enter username",
			type: "input",
		},
		function(inputValue){
			if (!inputValue || !inputValue.match(sc)) {
				swal.showInputError("That username is invalid.");
				return false;
			}
			getDetails({sc: inputValue}, function(user) {
				if (!user) {
					swal({
						allowOutsideClick: true,
						text: 'Failed to send a friend request to '+inputValue+'.',
						title: "Error sending request",
						timer: 3000,
						type: "error",
					});
				} else if (GM_getValue('checkBlocked') && (user.Relation == 'BlockedByMe' || user.Relation == 'BlockedByThem')) {
					swal({
						allowOutsideClick: true,
						text: "You have blocked "+user.sc+". Request not sent.",
						title: "User blocked",
						timer: 3000,
						type: "warning",
					});
				} else if (user.scExists) {
					updateFriend('addfriend', user, function(status) {
						if (status) swal({
							allowOutsideClick: true,
							text: "Friend request sent to "+user.sc+".",
							title: "Request sent",
							timer: 1000,
							type: "success",
						});
						else swal({
							allowOutsideClick: true,
							text: "Failed to send friend request to "+user.sc+".",
							title: "Request failed",
							timer: 3000,
							type: "error",
						});
					});
				} else {
					swal({
						allowOutsideClick: true,
						text: 'Social club account '+user.sc+' does not exist.',
						title: "User not found",
						timer: 3000,
						type: "warning",
					});
				}
			});
		});
	} catch (err) {
		console.error("Error during #sct-qckadd.click():\n\n"+err.stack);
		return;
	}
});

// -- Reject Requests --
$('#page').on('click', '#sct-rejreq', function(e) {
    e.preventDefault();
	var errCount = 0;

    try {
        swal({
            allowEscapeKey: false,
            cancelButtonText: "No",
            closeOnConfirm: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            html: true,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            text: "All friend requests"+(isDL() ? ' from non-dropees' : '')+" will be rejected.<br /><br />"+
                  "This will take a few seconds, so be patient."+
                  "<strong id=\"sct-rejreq-retrieving\" style=\"font-weight:bold;display:none;\"><br /><br />Retrieving <span id=\"sct-rejreq-retrieving-text\">friend requests</span>..."+
                  "</strong><strong id=\"sct-rejreq-progress\" style=\"font-weight:bold;display:none;\"><br /><br /><span id=\"sct-rejreq-progress-current\">0</span> of "+
                  "<span id=\"sct-rejreq-progress-total\">0</span> request(s) remaining...</strong>",
            title: "Are you sure?",
            type: "warning",
        },
        function(isConfirm) {
            if (isConfirm) {
                toggleAuto('pause');
                getRequests(function(reqs) {
					if (!reqs) {
						swal({
							allowOutsideClick: true,
							text: 'Failed to fetch friend requests.',
							title: "Error",
							timer: 3000,
							type: "error",
						});
						toggleAuto('unpause');
					} else if (reqs.length === 0) {
						swal({
							allowOutsideClick: true,
							text: 'There were no friend requests to reject.',
							title: "No requests",
							timer: 1000,
							type: "success",
						});
						toggleAuto('unpause');
					} else {
						for (var i in reqs) {
							if (!isDL() || !isOnDroplist(reqs[i].Name))
								setTimeout(updateFriend, 1000*i, 'ignore', reqs[i], function(status, pos) {
									if (!status) errCount++;
									if (pos == reqs.length-1) {
										swal({
											allowOutsideClick: true,
											text: errCount > 0 ? errCount+' friend requests could not be rejected.' :
													'All friend requests'+(isDL() ? ' from non-dropees' : '')+' were rejected.',
											title: "Friend requests rejected",
											timer: 2000,
											type: errCount > 0 ? "warning" : "success",
										});
										toggleAuto('unpause');
									}
								}, i);
							else {
								console.log('Skipped rejecting '+reqs[i].Name+'\'s friend request: They are on the droplist.');
								if (i == reqs.length-1) {
									swal({
										allowOutsideClick: true,
										text: errCount > 0 ? errCount+' friend requests could not be rejected.' :
												'All friend requests'+(isDL() ? ' from non-dropees' : '')+' were rejected.',
										title: "Friend requests rejected",
										timer: 2000,
										type: errCount > 0 ? "warning" : "success",
									});
									toggleAuto('unpause');
								}
							}
						}
					}
				});
            } else {
                return;
            }
        });
    } catch (err) {
        console.error("Error during #sct-rejreq.click():\n\n"+err.stack);
        return;
    }
});

// -- Accept Requests --
$('#page').on('click', '#sct-accreq', function(e) {
    e.preventDefault();
	var errCount = 0;
	var skipCount = 0;

    try {
        swal({
            allowEscapeKey: false,
            cancelButtonText: "No",
            closeOnConfirm: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            html: true,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            text: "All friend requests"+(isDL() ? ' from dropees' : '')+" will be accepted.<br /><br />"+
                  "This will take a few seconds, so be patient."+
                  "<strong id=\"sct-accreq-retrieving\" style=\"font-weight:bold;display:none;\"><br /><br />Retrieving <span id=\"sct-accreq-retrieving-text\">friend requests</span>..."+
                  "</strong><strong id=\"sct-accreq-progress\" style=\"font-weight:bold;display:none;\"><br /><br /><span id=\"sct-accreq-progress-current\">0</span> of "+
                  "<span id=\"sct-accreq-progress-total\">0</span> request(s) remaining...</strong>",
            title: "Are you sure?",
            type: "warning",
        },
        function(isConfirm) {
            if (isConfirm) {
                toggleAuto('pause');
				$('#sct-accfrd-retrieving').show();
                getRequests(function(reqs) {
					$('#sct-accfrd-retrieving').hide();
					$('#sct-accfrd-progress').show();
					if (!reqs) {
						swal({
							allowOutsideClick: true,
							text: 'Failed to fetch friend requests.',
							title: "Error",
							timer: 3000,
							type: "error",
						});
						toggleAuto('unpause');
					} else if (reqs.length === 0) {
						swal({
							allowOutsideClick: true,
							text: 'There were no friend requests to accept.',
							title: "No requests",
							timer: 1000,
							type: "success",
						});
						toggleAuto('unpause');
					} else {
						for (var i in reqs) {
							if (!isDL() || isOnDroplist(reqs[i].Name)) {
								setTimeout(updateFriend, 1000*i, 'confirm', reqs[i], function(status, pos) {
									if (!status) errCount++;
									if (pos == reqs.length-1) {
										swal({
											allowOutsideClick: true,
											text: errCount > 0 ? errCount+' friend requests could not be accepted.' :
													'All friend requests'+(isDL() ? ' from dropees' : '')+' were accepted.',
											title: "Friend requests accepted",
											timer: 2000,
											type: errCount > 0 ? "warning" : "success",
										});
										toggleAuto('unpause');
									} else
										$('#sct-accfrd-progress-current').text(reqs.length-i-1);
								}, i);
							} else {
								console.log('Skipped accepting '+reqs[i].Name+'\'s friend request: They are not on the droplist.');
								skipCount++;
								if (pos == reqs.length-1) {
									swal({
										allowOutsideClick: true,
										text: (errCount > 0 ? errCount+' friend requests could not be accepted.' :
												'All friend requests'+(isDL() ? ' from dropees' : '')+' were accepted.')+
												(isDL() && skipCount > 0 ? '\n\n<b>'+skipCount+'</b> non-dropees were skipped.' : ''),
										html: true,
										title: "Friend requests accepted",
										timer: 2000,
										type: errCount > 0 ? "warning" : "success",
									});
									toggleAuto('unpause');
								} else
									$('#sct-accfrd-progress-current').text(reqs.length-i-1);
							}
						}
					}
				});
            } else {
                return;
            }
        });
    } catch (err) {
        console.error("Error during #sct-accreq.click():\n\n"+err.stack);
        return;
    }
});

// -- Delete Friends --
$('#page').on('click', '#sct-delfrd', function(e) {
    e.preventDefault();
	var errCount = 0;

    try {
        swal({
            allowEscapeKey: false,
            cancelButtonText: "No",
            closeOnConfirm: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            html: true,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            text: "All "+(isDL() ? 'non-dropees' : 'friends')+" will be removed from your friends list.<br><br>"+
                  "This will take a minute, so be patient."+
                  "<strong id=\"sct-delfrd-retrieving\" style=\"font-weight:bold;display:none;\"><br /><br />Retrieving <span id=\"sct-delfrd-retrieving-text\">friends list</span>..."+
                  "</strong><strong id=\"sct-delfrd-progress\" style=\"font-weight:bold;display:none;\"><br><br><span id=\"sct-delfrd-progress-current\">0</span> of "+
                  "<span id=\"sct-delfrd-progress-total\">0</span> friend(s) remaining...</strong>",
            title: "Are you sure?",
            type: "warning",
        },
        function(isConfirm) {
            if (isConfirm) {
                toggleAuto('pause');
				$('#sct-delfrd-retrieving').show();
                getFriends(function(frds) {
					$('#sct-delfrd-retrieving').hide();
					$('#sct-delfrd-progress').show();
					$('#sct-delfrd-progress-total').text(frds.length);
					$('#sct-delfrd-progress-current').text(frds.length);
					if (!frds) {
						swal({
							allowOutsideClick: true,
							text: 'Failed to fetch friends list.',
							title: "Error",
							timer: 2000,
							type: "error"
						});
						toggleAuto('unpause');
					} else if (frds.length === 0) {
						swal({
							allowOutsideClick: true,
							text: 'There were no friends to removet.',
							title: "No friends",
							timer: 1000,
							type: "success",
						});
						toggleAuto('unpause');
					} else {
						for (var i in frds) {
							if (frds[i].Relationship !== 'Friend') {
								console.log('Skipped removing '+frds[i].Name+': They are not your friend.');
								if (i == frds.length-1) {
									swal({
										allowOutsideClick: true,
										text: errCount > 0 ? errCount+' friends could not be removed.' :
												'All '+(isDL() ? ' non-dropee' : ' of your')+' friends were removed.',
										title: "Friends removed",
										timer: 2000,
										type: errCount > 0 ? "warning" : "success",
									});
									toggleAuto('unpause');
								} else
									$('#sct-delfrd-progress-current').text(frds.length-i-1);
							} else if (!isDL() || !isOnDroplist(frds[i].Name)) {
								setTimeout(updateFriend, 1000*i, 'delete', frds[i], function(status, pos) {
									if (!status) errCount++;
									if (pos == frds.length-1) {
										swal({
											allowOutsideClick: true,
											text: errCount > 0 ? errCount+' friends could not be removed.' :
													'All '+(isDL() ? ' non-dropee' : ' of your')+' friends were removed.',
											title: "Friends removed",
											timer: 2000,
											type: errCount > 0 ? "warning" : "success",
										});
										toggleAuto('unpause');
									} else
										$('#sct-delfrd-progress-current').text(frds.length-pos-1);
								}, i);
							} else {
								console.log('Skipped removing '+frds[i].Name+': They are on the droplist.');
								if (i == frds.length-1) {
									swal({
										allowOutsideClick: true,
										text: errCount > 0 ? errCount+' friends could not be removed.' :
												'All '+(isDL() ? ' non-dropee' : ' of your')+' friends were removed.',
										title: "Friends removed",
										timer: 2000,
										type: errCount > 0 ? "warning" : "success",
									});
									toggleAuto('unpause');
								} else
									$('#sct-delfrd-progress-current').text(frds.length-i-1);
							}
						}
					}
				});
            } else {
                return;
            }
        });
    } catch (err) {
        console.error("Error during #sct-delfrd.click():\n\n"+err.stack);
        return;
    }
});

// -- Delete Dropees --
$('#page').on('click', '#sct-deldrp', function(e) {
    e.preventDefault();
	var errCount = 0;

    try {
        swal({
            allowEscapeKey: false,
            cancelButtonText: "No",
            closeOnConfirm: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            html: true,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            text: "All dropees will be removed from your friends list.<br><br>"+
                  "This will take a minute, so be patient."+
                  "</strong><strong id=\"sct-deldrp-progress\" style=\"font-weight:bold;display:none;\"><br><br><span id=\"sct-deldrp-progress-current\">0</span> of "+
                  "<span id=\"sct-deldrp-progress-total\">0</span> dropee(s) remaining...</strong>",
            title: "Are you sure?",
            type: "warning",
        },
        function(isConfirm) {
            if (isConfirm) {
                toggleAuto('pause');
				var frds = GM_getValue('droplist').filter(item => {
					return item.Relation == 'Friend';
				});
				$('#sct-deldrp-progress').show();
				$('#sct-deldrp-progress-total').text(frds.length);
				$('#sct-deldrp-progress-current').text(frds.length);
				if (frds.length === 0) {
					swal({
						allowOutsideClick: true,
						text: 'There are no dropees on your friends list.',
						title: "No friends",
						timer: 2000,
						type: "success"
					});
					toggleAuto('unpause');
				} else {
					for (var i in frds) {
						setTimeout(updateFriend, 1000*i, 'delete', frds[i], function(status, pos) {
							if (!status) errCount++;
							if (pos == frds.length-1) {
								swal({
									allowOutsideClick: true,
									text: errCount > 0 ? errCount+' friends could not be removed.' :
											'All dropees were removed from your friends list.',
									title: "Friends removed",
									timer: 2000,
									type: errCount > 0 ? "warning" : "success"
								});
								toggleAuto('unpause');
							} else
								$('#sct-deldrp-progress-current').text(frds.length-pos-1);
						}, i);
					}
				}
            } else {
                return;
            }
        });
    } catch (err) {
        console.error("Error during #sct-deldrp.click():\n\n"+err.stack);
        return;
    }
});

$('#page').on('click', '#sct-auto', function(e) {
	e.preventDefault();

	try {
		if (auto) return toggleAuto();
		var t = setInterval( function() {
			if (!autoPaused) {

				toggleAuto('pause');
                getRequests(function(reqs) {
					if (!reqs) {
						console.log('[Auto-accept] Failed to get friend requests.');
						toggleAuto('unpause');
					} else if (reqs.length === 0) {
						console.log('[Auto-accept] No friend requests.');
						toggleAuto('unpause');
					} else {
						for (var i in reqs) {
							if (!isDL() || isOnDroplist(reqs[i].Name))
								setTimeout(updateFriend, 1000*i, 'confirm', reqs[i], function(status, pos) {
									if (!status) errCount++;
									if (pos == reqs.length-1) {
										console.log('[Auto-accept] Accepted '+(errCount > 0 ? (reqs.length - pos)+' of '+reqs.length : 'all')+' friend requests.');
										toggleAuto('unpause');
									}
								}, i);
							else {
								errCount++;
								console.log('Skipped accepting '+reqs[i].Name+'\'s friend request: They are not on the droplist.');
								if (i == reqs.length-1) {
									console.log('[Auto-accept] Accepted '+(errCount > 0 ? (reqs.length - i)+' of '+reqs.length : 'all')+' friend requests.');
									toggleAuto('unpause');
								}
							}
						}
					}
				});
			} else if (GM_getValue('debug'))
				console.log('Auto-accept called, but paused.');
		}, 15000);
		toggleAuto(t);
	} catch (err) {
		console.error("Error during #sct-auto.click():\n\n"+err.stack);
		return;
	}
});


// --- Button helper functions ---

// TYPES: addfriend, confirm [accept], ignore [reject], cancel, delete, block, unblock
// `dropee` requires: `RockstarId`
// returns boolean of status
// pos = position in loop (forwarded through async)
function updateFriend(type, dropee, callback, pos) {
    try {
        var dataStr = '{"id":'+dropee.RockstarId+',"op":"'+type+'"'+
            (type == 'addfriend' ? ',"custommessage":""' : '')+
            (type == 'confirm' ? ',"custommessage":"","accept":"true"' : '')+'}';

        $.ajax({
            url: baseURL+"/friends/UpdateFriend",
            type: "PUT",
            data: dataStr,
            headers: {
                "Content-Type": "application/json",
                "RequestVerificationToken": verificationToken
            },
            error: function(err){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("UpdateFriend AJAX FAIL");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(err);
                    console.groupEnd();
                    console.groupEnd();
                }
                callback(false, pos);
            },
            success: function(data){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("UpdateFriend AJAX OK");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(data);
                    console.groupEnd();
                    console.groupEnd();
                }
                callback(data.Status, pos);
            },
            xhr: function() {
                var xhr = jQuery.ajaxSettings.xhr();
                var setRequestHeader = xhr.setRequestHeader;
                xhr.setRequestHeader = function(name, value) {
                    if (name == 'X-Requested-With') return;
                    setRequestHeader.call(this, name, value);
                };
                return xhr;
            }
        });
    } catch (err) {
        console.error("SC Tools - Error during updateFriend():\n\n"+err.stack);
        callback(false);
    }
}

// returns array of names of blocked users
function getBlocked(callback) {
    try {
        $.ajax({
            url: baseURL+"/friends/GetBlockedJson",
            headers: {
                "Accept": "application/json",
                "RequestVerificationToken": verificationToken
            },
            error: function(err){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("GetBlockedJson AJAX FAIL");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(err);
                    console.groupEnd();
                    console.groupEnd();
                }
                callback(false);
            },
            success: function(data){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("GetBlockedJson AJAX OK");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(data);
                    console.groupEnd();
                    console.groupEnd();
                }

                if (data.Status === true) {
                    callback(data.RockstarAccounts);
                } else {
                    callback(false);
                }
            }
        });
    } catch (err) {
        console.error("Error during getBlocked():\n\n"+err.stack);
        callback(false);
    }
}

// returns array of friend data or false
function getFriends(callback, current, pageIndex) {
    try {
        if (pageIndex === undefined) pageIndex = 0;
        if (current === undefined) current = [];
        $.ajax({
            url: baseURL+"/friends/GetFriendsAndInvitesSentJson?pageNumber="+pageIndex+"&onlineService=sc&pendingInvitesOnly=false",
            headers: {
                "Accept": "application/json",
                "RequestVerificationToken": verificationToken
            },
            error: function(err){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("GetFriendsAndInvitesSentJson AJAX FAIL");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(err);
                    console.groupEnd();
                    console.groupEnd();
                }
                callback(false);
            },
            success: function(data){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("GetFriendsAndInvitesSentJson AJAX OK");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(data);
                    console.groupEnd();
                    console.groupEnd();
                }

                if (data.Status === true) {
                    data.RockstarAccounts.forEach(function(e){
                        if (e !== undefined) current.push(e);
                        if (GM_getValue('debug')) console.log(e);
                    });
                } else {
                    console.log("Something went wrong while trying to fetch data from page "+pageIndex+".");
                }

                if (current.length < data.TotalCount) {
                    setTimeout( getFriends, 1000, callback, current, (pageIndex + 1) );
                } else {
                    callback(current);
                }
            }
        });
    } catch (err) {
        console.error("Error during getFriends():\n\n"+err.stack);
        return;
    }
}

// returns array of player data
function getRequests(callback) {
    $.ajax({
        url: baseURL+"/friends/GetReceivedInvitesJson",
        headers: {
            "Accept": "application/json",
            "RequestVerificationToken": verificationToken
        },
        error: function(err){
            if (GM_getValue('debug')) {
                console.groupCollapsed("GetReceivedInvitesJson AJAX FAIL");
                console.group("Request");
                console.log(this);
                console.groupEnd();
                console.group("Response");
                console.log(err);
                console.groupEnd();
                console.groupEnd();
            }
            callback(false);
        },
        success: function(data){
            if (GM_getValue('debug')) {
                console.groupCollapsed("GetReceivedInvitesJson AJAX OK");
                console.group("Request");
                console.log(this);
                console.groupEnd();
                console.group("Response");
                console.log(data);
                console.groupEnd();
                console.groupEnd();
            }
            if (data.Status === false)
                callback(false);
            else {
				callback(data.RockstarAccounts);
			}
        }
    });
}

// params: dropee object, callback [returns updated dropee]
function getDetails(dropee, callback) {
    if (!dropee.sc || !dropee.sc.match(sc)) {
        dropee.scExists = false;
        callback(dropee);
        return;
    }
    $.ajax({
        url: baseURL+"/Friends/GetAccountDetails?nickname="+dropee.sc+"&full=false",
        headers: {
            "Accept": "application/json",
            "RequestVerificationToken": verificationToken
        },
        error: function(err){
            if (GM_getValue('debug')) {
                console.groupCollapsed("GetAccountDetails AJAX FAIL");
                console.group("Request");
                console.log(this);
                console.groupEnd();
                console.group("Response");
                console.log(err);
                console.groupEnd();
                console.groupEnd();
            }
            dropee.scExists = false;
            callback(dropee);
        },
        success: function(data){
            if (GM_getValue('debug')) {
                console.groupCollapsed("GetAccountDetails AJAX OK");
                console.group("Request");
                console.log(this);
                console.groupEnd();
                console.group("Response");
                console.log(data);
                console.groupEnd();
                console.groupEnd();
            }
            dropee.scExists = data.Status;
            if (data.Status === true) {
                dropee.RockstarId = data.RockstarId;
                dropee.Relation = data.Relation;
            }
            callback(dropee);
        }
    });
}

// get list of users that sent you a message/you sent a message to
// returns array of user data, or false
function getMessageList(callback, current, pageIndex) {
    try {
        if (pageIndex === undefined) pageIndex = 0;
        if (current === undefined) current = [];

        setTimeout(function() {
            $.ajax({
                url: baseURL+"/Message/GetConversationList?pageIndex="+pageIndex,
                headers: {
                    "Accept": "application/json",
                    "RequestVerificationToken": verificationToken
                },
                error: function(err){
                    if (GM_getValue('debug')) {
                        console.groupCollapsed("GetConversationList AJAX FAIL");
                        console.group("Request");
                        console.log(this);
                        console.groupEnd();
                        console.group("Response");
                        console.log(err);
                        console.groupEnd();
                        console.groupEnd();
                    }
                    callback(false);
                },
                success: function(data){
                    if (GM_getValue('debug')) {
                        console.groupCollapsed("GetConversationList AJAX OK");
                        console.group("Request");
                        console.log(this);
                        console.groupEnd();
                        console.group("Response");
                        console.log(data);
                        console.groupEnd();
                        console.groupEnd();
                    }

                    data.Users.forEach(function(e){
                        current.push(e);
                    });

                    if (data.HasMore === true) {
                        getMessageList(callback, current, data.NextPageIndex);
                    } else {
                        if (GM_getValue('debug')) console.log("getMessageList() complete.");
                        callback(current);
                    }
                }
            });
        }, 1000);
    } catch (err) {
        console.error("Error during getMessageList():\n\n"+err.stack);
        return;
    }
}

// get all messages for a user
// returns array of message data
// `dropee` requires: `RockstarId`
// last = boolean of whether this is the last user
function getMessages(dropee, callback, last) {
    try {
        $.ajax({
            url: baseURL+"/Message/GetMessages?rockstarId="+dropee.RockstarId,
            headers: {
                "Accept": "application/json",
                "RequestVerificationToken": verificationToken
            },
            error: function(err){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("GetMessages AJAX FAIL");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(err);
                    console.groupEnd();
                    console.groupEnd();
                }
                callback(false, last);
            },
            success: function(data){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("GetMessages AJAX OK");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(data);
                    console.groupEnd();
                    console.groupEnd();
                }
                callback(data.Messages, last);
            }
        });
    } catch (err) {
        console.error("Error during RetrieveAllMessages():\n\n"+err.stack);
        callback(false);
    }
}

// returns boolean for status
// `msg` requires: `ID` and `IsAdminMessage`
// pos = position in loop (forwarded through async)
function deleteMessage(msg, callback, pos) {
    try {
        $.ajax({
            url: baseURL+"/Message/DeleteMessage",
            type: "POST",
            data: '{"messageid":'+msg.ID+',"isAdmin":'+msg.IsAdminMessage+'}',
            headers: {
                "Content-Type": "application/json",
                "RequestVerificationToken": verificationToken
            },
            error: function(err){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("DeleteMessage AJAX FAIL");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(err);
                    console.groupEnd();
                    console.groupEnd();
                }
                callback(false, pos);
            },
            success: function(data){
                if (GM_getValue('debug')) {
                    console.groupCollapsed("DeleteMessage AJAX OK");
                    console.group("Request");
                    console.log(this);
                    console.groupEnd();
                    console.group("Response");
                    console.log(data);
                    console.groupEnd();
                    console.groupEnd();
                }
                callback(data.Status, pos);
            },
            xhr: function() {
                var xhr = jQuery.ajaxSettings.xhr();
                var setRequestHeader = xhr.setRequestHeader;
                xhr.setRequestHeader = function(name, value) {
                    if (name == 'X-Requested-With') return;
                    setRequestHeader.call(this, name, value);
                };

                return xhr;
            }
        });
    } catch (err) {
        console.error("Error during deleteMessage():\n\n"+err.stack);
        return;
    }
}

// returns array of all messages
function getAllMessages(callback, totalCount) {
	if (GM_getValue('debug'))
		console.log('getAllMessages() called - Total messages: '+totalCount+'.');
    var msgs = [];
    getMessageList(function(users) {
        for (var i in users) {
            setTimeout(getMessages, 1000*i, users[i], function(messages, last) {
                msgs = msgs.concat(messages);
				if (GM_getValue('debug'))
					console.log(msgs.length+' messages retrieved.');
                if (last) {
                    callback(msgs);
					if (GM_getValue('debug'))
						console.log('getAllMessages() complete.');
                    return true;
                }
            }, (i == users.length-1));
        }
    });
}

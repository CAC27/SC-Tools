// ==UserScript==
// @name         SC Tools
// @version      1.4
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
//used for language compatibility [Do not delete, it will break the whole script]

// SC regex: /^[a-z.A-Z_\d]{6,16}$/

// -- Set default values if first run of script --
if (GM_getValue('checkBlocked') === undefined) {
    GM_setValue('checkBlocked', false);
}
if (GM_getValue('debug') === undefined) {
    GM_setValue('debug', false);
}
if (GM_getValue('droplist') === undefined) {
    GM_setValue('droplist', []);
}
if (GM_getValue('stats') === undefined) {
    GM_setValue('stats', true);
}
if (GM_getValue('delete') === undefined) {
    GM_setValue('delete', true);
}
if (GM_getValue('accept') === undefined) {
    GM_setValue('accept', true);
}
if (GM_getValue('reject') === undefined) {
    GM_setValue('reject', true);
}
if (GM_getValue('quickadd') === undefined) {
    GM_setValue('quickadd', true);
}
if (GM_getValue('messages') === undefined) {
    GM_setValue('messages', true);
}
if (GM_getValue('settings-link') === undefined) {
    GM_setValue('settings-link', false);
}
if (GM_getValue('silent') === undefined) {
    GM_setValue('silent', false);
}
if (GM_getValue('delete2') === undefined) {
    GM_setValue('delete2', false);
}
if (GM_getValue('auto') === undefined) {
    GM_setValue('auto', true);
}
if (GM_getValue('limit') === undefined) {
    GM_setValue('limit', false);
}

var auto = false;
var autoPaused = false;

// Friend message discarded here as it seemed unnecessary. Could re-add in future.
Init('', GM_getValue('checkBlocked'), GM_getValue('debug'));
function Init(friendMessage, checkBlocked, debug) {

	try {
        if (GM_getValue('silent')) { //replace sweetalert w/ dummy function
            window.swal = function(options, callback) {
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
		return;
	}

	setTimeout(function () {
        try {
            try { //unsafeWindow = compatibility with FF 👌
                var verificationToken = unsafeWindow.siteMaster.aft.replace('<input name="__RequestVerificationToken" type="hidden" value="', '').replace('" />', '').trim();
                var userNickname = unsafeWindow.siteMaster.authUserNickName;
                var isLoggedIn = unsafeWindow.siteMaster.isLoggedIn;
            } catch (err) {
                console.error("Error retrieving account data:\n\n"+err.stack);
                return;
            }

            if (userNickname !== '' && isLoggedIn) {
                $('<li id="sct-cred">Social Club tool by <a href="https://github.com/CAC27" target="_blank">CAC</a>, '+
                  'based on the tool by <a href="https://github.com/Nadermane" target="_blank">Nadermane</a>'+(debug ? " (debug mode)" : "")+'</li>').appendTo('#footerNav');

                // -- Main style --
                $('head').append('<style id="sct_style">.sctb { margin-bottom: 8px; margin-right: 5px; } input[type="checkbox"].SCTools { -webkit-appearance: none; width: 16px; height: 16px; background: #CCC; border: 2px solid #BBB; margin: -10px 6px 9px -1px;}a:hover > input[type="checkbox"].SCTools { -webkit-appearance: none; width: 16px; height: 16px; background-color: #DDD; border: 2px solid #CCC; margin: -10px 6px 9px -1px;}input.SCTools[type="checkbox"]:checked { background-image: url(https://www.degoudenton.nl/skin/frontend/default/degoudenton/images/checkmark-orng.png);} span.off { color: red; } span.on { color: green; } span.paused { color: brown; }</style>');

                // -- Droplist page --
                if (window.location.href.match(/https:\/\/(\w\w\.|es-mx\.)?socialclub\.rockstargames\.com\/tools.*/)) {
                    $('.alertBox.notFound').replaceWith('<div id="sctools"><div id="droplist" class="activePanel"> <div class="gridPanel sct" id="droplist_info"> <h3 class="sct">Edit Droplist</h3> <p class="sct">This is designed to accept dropBot messages:<br><br> <b>Discord Name:</b> someName <b>ID:</b> 1234567890 - <b>SC:</b> socialClubName - <b>Drops Attended:</b> x<br><i>(one dropee per line)</i> <br><br>So just directly copy and paste them. <br><br>Note that the button functions change if you have a droplist. </p> <div id="droplist_input_wrapper"> <textarea id="droplist_input" placeholder="Discord: CAC - SC: ¯\\_(ツ)_/¯ - Drops attended: 19\nDiscord: YellowHeart - SC: 🤔 - Drops Attended: 70"></textarea> <a class="btn btnGold btnrounded sctb2" href="#" id="sct-add">add</a> <a class="btn btnGold btnRounded sctb2" href="#" id="sct-remove">remove</a> </div></div><div class="gridPanel sct" id="current_droplist"> <h3 class="sct">Current Droplist</h3> <p class="sct">This is a list of your dropees, including some info about them.<br><br>It will be in the format:<br>SC name | Discord name | Total money | Rank | Drops attended.<br><br><i>Note: Stats (rank/cash) will be unavailable for some players, due to privacy settings.</i> </p> <div id="droplist_wrapper"> <ul id="current_list">   <li class="empty">Tumbleweeds...</li> </ul> <a class="btn btnGold btnrounded sctb2" href="#" id="sct-clear">clear</a></div></div></div></div>');
                    $('head').append('<style id="sctools_style">h3.sct { color: white; padding: 5px; } p.sct { color: #bbb; padding: 10px; } textarea#droplist_input { color: #fff; width: 99%; min-height: 300px; margin: 5px; background: #222; padding:  5px; border: 2px solid #444; border-radius: 10px; } a.btn.btngold.btnrounded.sctb2 { margin: 5px; } .gridPanel.sct { padding: 10px !important; } div#current_droplist { float: right; width: 59%; } div#droplist_info { float: left; width: 39%; } .empty, .gray { color: #666; } ul#current_list { color: #fff; background: #222; padding: 10px; margin: 5px; } #current_list li { padding:  5px; border-bottom: 2px solid #666; } .unknown { color: #FB0; } .bl { color: #F00; } .fail { color: #F70 } /*.rank { background: url(/images/games/GTAV/player-rank.png) no-repeat; background-size: 30px; padding: 4px 3px; }*/ .sctb-16 { float: right; height: 16px; width: 16px; background-size: 16px; display: inline-block; transition: 150ms; } .sctb-16:hover { filter: brightness(1.5); cursor: pointer; }'+
                        '.sct-del { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAIhIAACISAFlEbUFAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAHNSURBVHja7Ne9axRBGMfxz94diQlnSGN8AQXFQlCxsBUrFQVFUUvFzj9Bi2ssPBDs/BPyBwgBXyE2VloElKigIgFf0EIUVBSJcW2eg2VZs+txG0XuB8sMv5md/c7sM7vzJGmagk6no0QTuIhjWI2fufYGvuEOzuHtcoN1u13QUl1XcKakzyROYS0OVBm0KsAaHI36PKajnkSZYgnHsQf7sB2P+wHYha0xICxiS8wOHuAuxnP3fcX6AEhwEhuxKtqbeI37vwMYx27cQHsZ6NNxlelCgZfiBG4HsEam8WzMrK0+JbiKTjZyexqxchopegU38Rnfo0xreHAbY5grApiPaxQHgzId4NKnsfyfynbBZGyziRpWYCce5b9eRZGarlQwNPxlVQV4F/t3f+xheI4jES/3wpvDIRzGk0ECfMEMZrEQ3kdcC6A3GdBbuI73gwRICupl3v8VA0OAIcAQYAjwzwOkdQMkmWN4K3NvK+c1M2Wz38QkKfipbMLDSMemwtuBpzH7deHtxYuob+gXYBE/CvptznmjkbBkNVbg9bQUY5e+gg94VkO8vcLLqjFwqQaAy5E9V0pOZ+K4dR7bIqD+NNJ7R/GFyKynizr9GgBEeldN2USYxwAAAABJRU5ErkJggg==); }'+
                        '.sct-rel { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAK5SURBVHja7NddiBZlFAfw3+uuxkqmm4U35UUQ5lVgSmxs+UHBstCFERQoiZiC1IVgHwTlshiJiGKKBdnHhQq6GBVIXij4BYsR7na3QqFXoYGw7WZs6+72dnNGhmHed2a2CxH9w8DM85yZ/5nn/J9zzlOr1+vuJGa4w2iF3t7eMrazsBzdWIrH8FDM3cTvGMCPOIOxJt/agr97enoOtpZ08g28g8UNbB7GQnTgLVzBXnyB8YztdmzFN2VC8BTO4asm5Hl4AvvwE55JjW/Dh5iIS7MV6MJRzC0gq6PWYO5pXMAaPInelPZamjnQhe/xQM7cAH7Az/gjHJgfZN14IfPdNvTlOFlr5MAiHMkhHwodnAzSLE5jN5ZgJ17Mij1n5XI18HmIKo0+LAuFFyWOAbyEj0pvwxTWYGUO+esliLN4sGA+NwRvZ55/xcZpkH+GzQXCrWcdmInHM4YfYLQi+ddYX2DzLyazGpjAsdRzf6i9CvYE+Qj+zLlGImuO4p+8ELyP82iPbThZgbwF+7ELUw3C1pIKwVieA5PT+OsEU7h611XD+w4kGpgdqbdW4p3ZuF5RoG1YHfffpXuFxIH3sBaPhJgaoR2HsK7ijx7GK3H/LV7NOjAnKlpR6T2BTRXJV6TIRcVcEJX0tgZaSuihL5ZxvAL5zKiQaVzDcFaE9YJ8/yVeqxj3pCYsyYx9iltVd8FwReJZ4fSbmfFBHJjONnw3WqvnStiuwkVsyIyPhUNTCjqVJK1OxZ8k6Awn+kOMg7gRc49G8/kyns3ZzvXYOQNFDUmCT4KsD/MyK9YZV1mMRVt/vFkmrKW83hXt86no8/v/R6IbjLAdL0rFM2I19kRSSnA5TkMboikti9+iu+rAL2VS8RA+xo4cm8nocg7j+Ugky1JHsxr+iqPZpWhczyYNRxFq9/zp+L8BAOz5m71fnJ1fAAAAAElFTkSuQmCC); }'+
						'.sct-rel12 { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAK4SURBVHja7NddiBZlFAfw3+vuKit9aUY35kUQ2lWwKbGhfYiBCF4ogoKi2JYQeSFoilCBKEVIiyUVVKsXKuiyooLkhUJpsCjhbncGRV2FBYLtlrx+vNvbzRkZhnnfmdkuROoPAzPPc2b+Z57zf845T63ZbLqXmOIeoxNeHRgoYzsVL2IZ5mM2Hoq5v/ArRvAVvka9zbe24MaBvr4vOks6uR7b8HQLm5mYg168iZ+xD5/jVsZ2N7biYJkQzMN5DLQhz8OT+BiX8Gxq/F28jTtxabcCS3EUDxeQNVFrMfcMvsVaPIVdKe11tHNgKU5iWs7cCE7hO/weDjwaZMvwQua73RjMcbLWyoG5OJJDfiV0cCZIsziHD9GDD7AkK/aclcvVwGchqjQGsSAUXpQ4RvAK3im9DVNYi5dzyNeUIM7igYL53BBszjz/iNcnQf4p3igQbjPrQBeeyBjuxHhF8gPYWGDzNxpZDdzBsdTzcKi9CvqDfAx/5FxjkTXHcTMvBDtwATNiGzYqkHdgP/ZiokXYOlIhqOc50JjEXyeYwC/3XTX834FEA9Mj9dZKvDMdv1UUaDdWxP2JdK+QOLAd6zArxNQKM3AIGyr+6GGsjPvjWJV14MGoaEWl9zQ2VSR/KUUuKubjUUnvaqCjhB4GYxlvVSDvigqZxlVcz4qwWZDvv8TqinFPakJPZuwj3K66C65XJJ4aTr+WGR/FJ5PZhm9Fa/V8CdvFuIi+zHg9HJpQ0KkkaXUi/iTBwnBiOMQ4imsx91g0n8vxXM52bsbOGSlqSBK8F2SDeCSzYgvjKot6tPVD7TJhLeX13mifz0afP/wvEt1ohG2oKBVPidXoj6SU4Ic4DfVFU1oWP0V31Yvvy6TiK9iD93NsGtHlHMaiSCQLUkezGv6Mo9nlaFy/SRqOItT+86fjfwYA+LGbvXXSQ8QAAAAASUVORK5CYII=); }'+
                    '</style>');
                } else {
                    $('<a class="btn btnGold btnRounded sctb" href="/tools" id="sct-sllink">edit droplist</a>').prependTo('#page');
                }

                // -- Script settings page --
                if (window.location.href.match(/https:\/\/(\w\w\.|es-mx\.)?socialclub\.rockstargames\.com\/settings\/tools.*/)) {
                    $('.span1col > *').remove();
                    $('.span1col').append('<div id="sct-settings-main" class="commonPageContainer gridPanel"> <h1>Settings</h1><ul id="primary_settings"> <li> <input type="checkbox" id="debug" class="sct-settings">Debug Mode <span class="orange">*</span><span class="info">Show more info in the console. Mainly for development, but also useful for bug reporting.</span></li><li> <input type="checkbox" id="checkBlocked" class="sct-settings">Check blocked players <span class="orange">*</span><span class="info">If this option is checked, blocked players will be skipped when sending friend requests. Otherwise the player will automatically be unblocked if you quick-add them.</span></li><li> <input type="checkbox" id="stats" class="sct-settings">Check stats <span class="info">Retrieve stats, most notably amount of money, for players, and display it in the droplist.</span></li><li> <input type="checkbox" id="silent" class="sct-settings">Silent mode <span class="orange">*</span><span class="info">Don\'t show any popups/alerts/confirmations. Not recommended.</span></li><li> <input type="checkbox" id="limit" class="sct-settings">Personal limit - <input id="limitVal" type="number"><span> mil</span><span class="info">Set a personal limit of how much money is too much for joining your drop.<br><i>This won\'t affect the amount turning red for 500m+ (aka blacklist recommendation.)</i><br>To edit: uncheck the box, change the number, then check it again.</span></li></ul> <span class="footer">Items with a <span class="orange">*</span> will only take effect once the page is reloaded.</span></div>');
                    $('.span1col').append('<div id="sct-settings-buttons" class="commonPageContainer gridPanel"> <h1>Buttons</h1> <span>Enable/disable the buttons at the top. You likely won\'t find all of them to be useful.</span><ul id="button_settings"> <li> <input id="auto" class="sct-settings" type="checkbox">Auto-accept</li><li> <input type="checkbox" id="delete" class="sct-settings">Delete friends / Delete non-dropees</li><li> <input type="checkbox" id="accept" class="sct-settings">Accept requests / Accept dropees</li><li> <input type="checkbox" id="reject" class="sct-settings">Reject requests / Reject non-dropees</li><li> <input type="checkbox" id="quickadd" class="sct-settings">Quick-add user</li><li> <input type="checkbox" id="messages" class="sct-settings">Delete messages</li> <li> <input type="checkbox" id="delete2" class="sct-settings">Delete dropees</li><li> <input type="checkbox" id="settings-link" class="sct-settings">Settings (link to this page)</li> </ul> </div>');
                    $('head').append('<style>h1 { color:  #fff; } .commonPageContainer.gridPanel { padding: 10px !important; } li { color: #bbb; } span.info { display: block; color: #666; margin-left: 25px; } input.sct-settings {-webkit-appearance: none;width: 16px;height: 16px;background: #333;border: 2px solid #555;margin: 9px 5px 0px 0px;border-radius: 3px;} input.sct-settings:hover { background: #444; border-color: #777; } div#sct-settings-main { width: 59%; float: left; } div#sct-settings-buttons { width: 39%; float: right; } h4 { color: #bbb; } span { color: #bbb; } span.comingSoon { color: #ff6c00; } input.sct-settings:checked { background-image: url(https://www.degoudenton.nl/skin/frontend/default/degoudenton/images/checkmark-orng.png); background-repeat: no-repeat; } input.sct-settings:disabled { background: #000; border-color: #222; pointer-events: none; } input.sct-settings:focus { outline: none; border: 2px solid #555; box-shadow: 0 0 7px 1px rgba(252, 175, 23, 0.5); } span.orange { color: orange; } span.footer { display: block; margin-top: 20px; } input#limitVal { background:  #444; border:  2px solid #666; color:  #bbb; border-radius: 3px; padding: 0 2px; width: 27px; } input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }</style>');
                } else {
                    $('#loggedIn ul.dropdown-menu').append('<li><a id="sct-set-link" href="/settings/tools" title="SC Tools Settings" class="logoutlink"><i class="scicon-nav_scts"><style>i.scicon-nav_scts:before { content: "\\f119"; }</style></i>SC Tools Settings</a></li>');
                    if (GM_getValue('sct-settings'))
                        $('<a class="btn btnGold btnRounded sctb" href="/settings/tools" id="sct-settings">settings</a>').prependTo('#page');
                }
                $('#page').on('click', '.sct-settings', function() {
                    //if ( $(this).has('.comingSoon') ) return;
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
                        changeText();
                    } else if (this.id == 'limit') {
						if (!this.checked) {
							$('#limitVal').val('');
							return;
						}
						var n = parseInt( $('#limitVal').val() );
						if (!n || isNaN(n) || n > 499 || n < 50) {
							$('#limit').prop('checked', false);
							GM_setValue('limit', false);
							$('#limitVal').val('');
						} else {
							GM_setValue('limit', n*1000000);
							$('#limitVal').val(GM_getValue('limit')/1000000);
						}
					}
                });
                // set everything to proper value
                var vList = ["delete", "accept", "reject", "quickadd", "messages", "delete2", "settings-link", "debug", "checkBlocked", "stats", "silent", "auto"];
                for (var i in vList)
                    $('#'+vList[i]).prop('checked', GM_getValue(vList[i]));
				if (GM_getValue('limit')) {
					$('#limit').prop('checked', true);
					$('#limitVal').val(GM_getValue('limit')/1000000);
				}
                if (GM_getValue('settings-link'))
                    $('<a class="btn btnGold btnRounded sctb" href="/settings/tools" id="sct-settings">settings</a>').prependTo('#page');

                // - Show droplist + change buttons if necessary -
                setTimeout(refresh, 50);

                // -- Functions to be used throughout script --
                function refresh(dl) {
                    if(!dl) dl = GM_getValue('droplist');
                    $('#current_list > li').remove();

                    var newList = [];
                    for (var i in dl) {
                        if ( dl[i] && (dl[i].sc || dl[i].discord) ) { //filter empty members
                            $('#current_list').append('<li'+(dl[i].sc == '<span class="unknown">???</span>' ? '' : ' data-sc="'+dl[i].sc+'"')+'> '+
                                 '<span class="gray">SC:</span> '+dl[i].sc+
                                 ' <span class="gray">| Discord:</span> '+dl[i].discord+
                                 (GM_getValue('stats') ? ' <span class="gray">|</span> 💰 '+
									  (GM_getValue('limit') && dl[i].rawMoney > GM_getValue('limit') ? '<span class="fail">'+dl[i].money+'</span>' : dl[i].money)
								  : '')+
                                 (GM_getValue('stats') ? ' <span class="gray">|</span> 🌐 '+dl[i].rank : '')+
                                 ' <span class="gray">| Drops:</span> '+dl[i].drops+
                                 '<span class="sctb-16 sct-del"></span>'+
                                 (GM_getValue('stats') ? '<span class="sctb-16 sct-rel"></span>' : '')+
								 (GM_getValue('stats') && i % 12 == 0 ? '<span class="sctb-16 sct-rel12"></span>' : '')+
                            '</li>');
                            newList.push(dl[i]);
                        }
                    }
                    GM_setValue('droplist', newList); //save list with no null/undefined bullshit
                    if (!dl || dl.length === 0) {
                        $('#current_list').append('<li class="empty">Nothin\' here, man</li>');
                    }
                    changeText();
                }

                function isDL() {
                    return GM_getValue('droplist') && GM_getValue('droplist').length > 0;
                }

                function isOnDroplist(sc) {
                    var dl = GM_getValue('droplist').map(e => { return e.sc.toLowerCase(); });
                    sc = sc.toLowerCase();
                    //if (debug) console.log('Checking if '+sc+' is on this list: \n'+dl);
                    return dl.indexOf(sc) > -1;
                }

                function changeText() { //changes button/dialog text to match the context
                    if (isDL()) {
                        $('#sct-delfrd').text('delete non-dropees');
                        $('#sct-accreq').text('accept all dropees');
                        $('#sct-rejreq').text('reject non-dropees');
                    } else {
                        $('#sct-delfrd').text('delete friends');
                        $('#sct-accreq').text('accept requests');
                        $('#sct-rejreq').text('reject requests');
                    }
                }

                function getStats(member, callback, delay) {
                    if (member.sc == '<span class="unknown">???</span>') {
                        console.warn('This person doesn\'t have a social club name saved, so no stats.');
                        callback(member);
                        return;
                    }
                    if (debug) console.log('Delay: '+delay);
                    setTimeout( function() {
                        try {
                            $.ajax({
                                url: baseURL+"/games/gtav/career/overviewAjax?character=Freemode&nickname="+member.sc+"&slot=Freemode&gamerHandle=&gamerTag=&_="+Date.now(),
                                    type: "GET",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                error: function(err){
                                    if (debug) {
                                        console.groupCollapsed("overviewAjax AJAX FAIL");
                                        console.group("Request");
                                        console.log(this);
                                        console.groupEnd();
                                        console.group("Response");
                                        console.log(err);
                                        console.groupEnd();
                                        console.groupEnd();
                                    }
                                    console.error('Error retrieving stats for player '+member.sc+'.');
                                    callback(member);
                                },
                                success: function(data){
                                    if (debug) {
                                        console.groupCollapsed("overviewAjax AJAX OK");
                                        console.group("Request");
                                        console.log(this);
                                        console.groupEnd();
                                        console.group("Response");
                                        console.log(data);
                                        console.groupEnd();
                                        console.groupEnd();
                                    }
                                    if ( $(data).prop('id') == 'sectionBlockedStats' ) {
                                        console.warn('No stats available for '+member.sc+' due to privacy settings.');
                                        member.rank = '<span class="unknown">???</span>';
                                        member.money = '<span class="unknown">???</span>';
                                    } else {
                                        /*if (debug) {
                                            //console.log(data);
                                            console.log( $(data).find('#freemodeRank > div.rankHex > h3').text() );
                                            console.log( parseInt( $(data).find('#cash-value').text().replace(/[^\d]/g, '') ) );
                                            console.log( parseInt( $(data).find('#bank-value').text().replace(/[^\d]/g, '') ) );
                                        }*/

                                        member.rank = parseInt( $(data).find('#freemodeRank > div.rankHex > h3').text() );
                                        var cash = parseInt( $(data).find('#cash-value').text().replace(/[^\d]/g, '') );
                                        var bank = parseInt( $(data).find('#bank-value').text().replace(/[^\d]/g, '') );
                                        member.money = Number(cash + bank).toLocaleString();
                                        //small note - no commas will appear in safari. but fuck safari anyway

                                        member.rawMoney = cash + bank;
										if (member.rawMoney > 500000000)
                                            member.money = '<span class="bl">'+member.money+'</span>';

                                        if (member.rank === 0) {
                                            member.rank = '<span class="fail">???</span>';
                                            member.money = '<span class="fail">???</span>';
                                        }
                                    }
                                    callback(member);
                                }
                            });
                        } catch (err) {
                            if (debug) console.error("Error retrieving player stats:\n\n"+err.stack);
                            else console.error("Error retrieving player stats.");
                            callback(member);
                            return;
                        }
                    }, delay);
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

                // -- Droplist functions --
                $('#sct-clear').click(function() {
                    refresh([]);
                });

                $('#sct-add').click(function() {
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
                    var newList = GM_getValue('droplist');
                    var n = 0;

                    function memberDone(member) {
                        n++;
                        $('#sct-stats-progress-current').text(txt.length - n);
                        //if (debug) console.log(member);
                        if (!isOnDroplist(member.sc))
                            newList.push(member);

                        if (n == txt.length) {//done with reqs
                            if (GM_getValue('stats') && l) swal({
                                title: "Whoa, slow down there.",
                                text: "You'll need to wait about 20 seconds to add more people, otherwise stats won't work because rate limits.",
                                type: "warning",
                                showConfirmButton: true,
                                timer: 5000
                            });
                            else swal({
                                title: "Finished!",
                                text: "Finished retrieving player stats.",
                                type: "success",
                                showConfirmButton: false,
                                timer: 1000
                            });
                            toggleAuto('unpause');
                            refresh(newList);
                        }
                    }

                    if (GM_getValue('stats'))
                    swal({
                        title: "Getting stats...",
                        html: true,
                        text: "Getting stats (most notably, money) for players.<br>"+
                                  "<i>This should only take a minute if you added a reasonable number of people.</i><br>"+
                                  "<strong id=\"sct-stats-progress\" style=\"font-weight:bold;\"><br><br><span id=\"sct-stats-progress-current\">"+txt.length+"</span> of "+
                                  "<span id=\"sct-stats-progress-total\">"+txt.length+"</span> player(s) remaining...</strong>",
                        imageUrl: "https://i.imgur.com/ckmgnZ3.gif",
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });

                    for (var i in txt) {
                        var temp = txt[i].split(/(Discord Name: )|( ID: )|( - SC: )|( - Drops Attended: )/).filter(item => {
                            return item; //remove undefined and ''
                        });
                        if (debug) console.log(temp);

                        var member = {
                            sc: '<span class="unknown">???</span>',
                            rank: '<span class="unknown">???</span>',
                            money: '<span class="unknown">???</span>',
                            discord: '<span class="unknown">???</span>',
                            drops: '<span class="unknown">???</span>'
                        };

                        if (temp.indexOf('Discord Name: ') !== -1)
                            member.discord = temp[temp.indexOf('Discord Name: ') + 1];

                        if (temp.indexOf(' - SC: ') !== -1)
                            member.sc = temp[temp.indexOf(' - SC: ') + 1];

                        if (temp.indexOf(' - Drops Attended: ') !== -1)
                            member.drops = temp[temp.indexOf(' - Drops Attended: ') + 1];

                        if (GM_getValue('stats') && member.sc !== '<span class="unknown">???</span>') {
                            //check for dupe by SC
                            if (isOnDroplist(member.sc)) {
                                n++;
                                console.log('Duplicate dropee skipped.');

                                if (n == txt.length) {//done with reqs (only used here when last is a dupe)
                                    if (l) swal({
                                        title: "Whoa, slow down there.",
                                        text: "You'll need to wait about 30 seconds to add more people, otherwise stats won't work because rate limits.",
                                        type: "warning",
                                        showConfirmButton: true,
                                        timer: 5000
                                    });
                                    else swal({
                                        title: "Finished!",
                                        text: "Finished retrieving player stats.",
                                        type: "success",
                                        showConfirmButton: false,
                                        timer: 1000
                                    });
                                    toggleAuto('unpause');
									refresh(newList);
                                }
                                continue;
                            }
                            var time = 1000 * i;

                            getStats(member, memberDone, time);
                        }
                        else memberDone(member);
                    }
                    if (leftovers && GM_getValue('stats')) {
                        $('#droplist_input').val(leftovers.join('\n'));
                    }
                });

                $('#sct-remove').click(function() {
                    var txt = $('#droplist_input').val();
                    txt = txt.split('\n');
                    var list = GM_getValue('droplist');

                    for (var i in txt) {
                        var temp = txt[i].split(/(Discord Name: )|( ID: )|( - SC: )|( - Drops Attended: )/).filter(item => {
                            return item; //remove undefined and ''
                        });
                        var d = list.map(item => { return item.discord; });
                        var s = list.map(item => { return item.sc.toLowerCase(); });
                        var sc = temp[temp.indexOf(' - SC: ') + 1].toLowerCase();
                        var di = temp[temp.indexOf('Discord Name: ') + 1];

                        if (s.indexOf(sc) > -1)
                            list.splice(s.indexOf(sc), 1);
                        else if (d.indexOf(di) > -1) {
                            list.splice(d.indexOf(di), 1);
                        }
                    }
                    refresh(list);
                    $('#droplist_input').val('');
                });

				$('#current_list').on('click', '.sct-rel12', function() {
					var ind = $(this).parent().index();
					var len = $('#current_list > li').length - ind;
					if (len > 12) len = 12;
					toggleAuto('pause');
					console.log(ind +' '+ len);
					var oldList = GM_getValue('droplist');
                    var list = oldList.slice(ind, ind+len);
					console.log(oldList);
					console.log(list);
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

                            refresh(oldList);
                        }
                    }

                    swal({
                        title: "Getting stats...",
                        html: true,
                        text: "Getting stats (most notably, money) for players.<br>"+
                                  "<i>This should only take a minute if you added a reasonable number of people.</i><br>"+
                                  "<strong id=\"sct-stats-progress\" style=\"font-weight:bold;\"><br><br><span id=\"sct-stats-progress-current\">"+list.length+"</span> of "+
                                  "<span id=\"sct-stats-progress-total\">"+list.length+"</span> player(s) remaining...</strong>",
                        imageUrl: "https://i.imgur.com/ckmgnZ3.gif",
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });

                    for (var i in list) {
                        var member = list[i];
                        if (member.sc !== '<span class="unknown">???</span>') {
                            getStats(member, memberDone, 1000*i);
                        }
                        else memberDone(member);
                    }
                });

                // use .on() here because contents matching the selector change
                $('#current_list').on('click', '.sct-rel', function() {
                    var list = GM_getValue('droplist');
                    var sc = $(this).parent().attr('data-sc');
                    var i = $(this).parent().index();

                    if (debug) console.log('fetching stats for SC: '+sc+' (index: '+i+')');

                    if (!sc)
                        return console.warn('This person doesn\'t have a social club name saved, so no stats.');

                    function done(member) {
                        if (debug) console.log(member);
                        list[i] = member;
                        refresh(list);
                    }
                    getStats(list[i], done, 0);
                });

                $('#current_list').on('click', '.sct-del', function() {
                    var list = GM_getValue('droplist');
                    var i = $(this).parent().index();

                    //if (debug) console.log('Deleting: '+this);

                    list.splice(i,1);

                    if (list !== GM_getValue('droplist')) {
                        refresh(list);
                    }
                });

                // -- Main functions --
                // - Delete messages
                if (GM_getValue('messages')) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-delmsg">delete messages</a>').prependTo('#page');
                }
                $('#page').on('click', '#sct-delmsg', function(e) {
                    e.preventDefault();

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
                                  "This process may take up to several minutes. Please be patient for it to be completed before browsing away from this page."+
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
                                        if (debug) {
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
                                        if (debug) {
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
                                            RetrieveAllMessageUsers([]);
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "There were no messages to delete.",
                                                title: "No messages",
                                                timer: 5000,
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

                // - Quick-add user -
                if (GM_getValue('quickadd')) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-qckadd">quick-add user</a>').prependTo('#page');
                }
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
                            (checkBlocked ? "" : "\n\nNote: You have disabled the blocked users list check. If the user is on your blocked users list, they will be unblocked and sent a friend request.")+
                            (friendMessage.trim() === '' ? '' : "\n\nNote: You have set a custom friend request message, which will get sent to the user."),
                            title: "Enter username",
                            type: "input",
                        },
                        function(inputValue){
                            if (inputValue === false) return false;

                            if (inputValue.trim() === "") {
                                swal.showInputError("The username field can't be empty.");
                                return false;
                            }

                            if (inputValue.trim().match(new RegExp("([^A-Za-z0-9-_\.])"))) {
                                swal.showInputError("The username field contains invalid characters.");
                                return false;
                            }

                            if (inputValue.trim().length < 6) {
                                swal.showInputError("The username field can't be shorter than 6 characters.");
                                return false;
                            }

                            if (inputValue.trim().length > 16) {
                                swal.showInputError("The username field can't be longer than 16 characters.");
                                return false;
                            }

                            if (inputValue.trim().toLowerCase() === userNickname.toLowerCase()) {
                                swal.showInputError("You can't add yourself as a friend.");
                                return false;
                            }

                            $.ajax({
                                url: baseURL+"/Friends/GetAccountDetails?nickname="+inputValue.trim()+"&full=false",
                                headers: {
                                    "Accept": "application/json",
                                    "RequestVerificationToken": verificationToken
                                },
                                error: function(err){
                                    if (debug) {
                                        console.groupCollapsed("GetAccountDetails AJAX FAIL");
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
                                        text: 'Something went wrong while trying to check whether "'+inputValue.trim()+'" exists or not.',
                                        title: err.status+" - "+err.statusText,
                                        timer: 5000,
                                        type: "error",
                                    });
                                },
                                success: function(data){
                                    if (debug) {
                                        console.groupCollapsed("GetAccountDetails AJAX OK");
                                        console.group("Request");
                                        console.log(this);
                                        console.groupEnd();
                                        console.group("Response");
                                        console.log(data);
                                        console.groupEnd();
                                        console.groupEnd();
                                    }

                                    if (data.Status === true) {
                                        if (checkBlocked) {
                                            RetrieveBlockedList(data);
                                        } else {
                                            AddFriend(data);
                                        }
                                    } else {
                                        swal({
                                            allowOutsideClick: true,
                                            text: 'The nickname "'+inputValue+'" doesn\'t exist.',
                                            title: "User not found",
                                            timer: 5000,
                                            type: "warning",
                                        });
                                    }
                                }
                            });
                        });
                    } catch (err) {
                        console.error("Error during #sct-qckadd.click():\n\n"+err.stack);
                        return;
                    }
                });

                // - Reject requests -
                if (GM_getValue('reject')) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-rejreq">reject requests</a>').prependTo('#page');
                }
                $('#page').on('click', '#sct-rejreq', function(e) {
                    e.preventDefault();

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
                            text: "All friend requests you have received will be rejected.<br /><br />"+
                                  "This process may take up to several minutes. Please be patient for it to be completed before browsing away from this page."+
                                  "<strong id=\"sct-rejreq-progress\" style=\"font-weight:bold;display:none;\"><br /><br /><span id=\"sct-rejreq-progress-current\">0</span> of "+
                                  "<span id=\"sct-rejreq-progress-total\">0</span> friend request(s) remaining...</strong>",
                            title: "Are you sure?",
                            type: "warning",
                        },
                        function(isConfirm) {
                            if (isConfirm) {
								toggleAuto('pause');
                                var children = [];

                                $.ajax({
                                    url: baseURL+"/friends/GetReceivedInvitesJson",
                                    headers: {
                                        "Accept": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                    error: function(err){
                                        if (debug) {
                                            console.groupCollapsed("GetReceivedInvitesJson AJAX FAIL");
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
                                            text: "Something went wrong while trying to fetch the total amount of friend requests.",
                                            title: err.status+" - "+err.statusText,
                                            timer: 5000,
                                            type: "error",
                                        });
                                        toggleAuto('unpause');
                                    },
                                    success: function(data){
                                        if (debug) {
                                            console.groupCollapsed("GetReceivedInvitesJson AJAX OK");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(data);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        if (data.Status === true && data.TotalCount > 0) {
                                            $('#sct-rejreq-progress-current').text(data.TotalCount);
                                            $('#sct-rejreq-progress-total').text(data.TotalCount);
                                            $('#sct-rejreq-progress').show();

                                            data.RockstarAccounts.forEach(function(e) {
                                                children.push(e);
                                            });

                                            if (children.length == data.TotalCount) {
                                                RemoveFriend(children, true);
                                            }
                                        } else if (data.Status === true && data.TotalCount === 0) {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "There were no friend requests to reject.",
                                                title: "No friend requests",
                                                timer: 5000,
                                                type: "success",
                                            });
                                            toggleAuto('unpause');
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "Something went wrong while trying to fetch friend request data.",
                                                title: "Something went wrong",
                                                timer: 5000,
                                                type: "error",
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
                        console.error("Error during #sct-rejreq.click():\n\n"+err.stack);
                        return;
                    }
                });

                // - Accept requests -
                if (GM_getValue('accept')) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-accreq">accept requests</a>').prependTo('#page');
                }
                $('#page').on('click', '#sct-accreq', function(e) {
                    e.preventDefault();

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
                            text: "All friend requests you have received will be accepted.<br /><br />"+
                                  "This process may take up to several minutes. Please be patient for it to be completed before browsing away from this page."+
                                  "<strong id=\"sct-accreq-progress\" style=\"font-weight:bold;display:none;\"><br /><br /><span id=\"sct-accreq-progress-current\">0</span> of "+
                                  "<span id=\"sct-accreq-progress-total\">0</span> friend request(s) remaining...</strong>",
                            title: "Are you sure?",
                            type: "warning",
                        },
                        function(isConfirm) {
                            if (isConfirm) {
								toggleAuto('pause');
                                var children = [];

                                $.ajax({
                                    url: baseURL+"/friends/GetReceivedInvitesJson",
                                    headers: {
                                        "Accept": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                    error: function(err){
                                        if (debug) {
                                            console.groupCollapsed("GetReceivedInvitesJson AJAX FAIL");
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
                                            text: "Something went wrong while trying to fetch the total amount of friend requests.",
                                            title: err.status+" - "+err.statusText,
                                            timer: 5000,
                                            type: "error",
                                        });
                                        toggleAuto('unpause');
                                    },
                                    success: function(data){
                                        if (debug) {
                                            console.groupCollapsed("GetReceivedInvitesJson AJAX OK");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(data);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        if (data.Status === true && data.TotalCount > 0) {
                                            $('#sct-accreq-progress-current').text(data.TotalCount);
                                            $('#sct-accreq-progress-total').text(data.TotalCount);
                                            $('#sct-accreq-progress').show();

                                            data.RockstarAccounts.forEach(function(e) {
                                                children.push(e);
                                            });

                                            if (children.length == data.TotalCount) {
                                                AcceptFriend(children, true);
                                            }
                                        } else if (data.Status === true && data.TotalCount === 0) {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "There were no friend requests to accept.",
                                                title: "No friend requests",
                                                timer: 5000,
                                                type: "success",
                                            });
                                            toggleAuto('unpause');
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "Something went wrong while trying to fetch friend request data.",
                                                title: "Something went wrong",
                                                timer: 5000,
                                                type: "error",
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
                        console.error("Error during #sct-accreq.click():\n\n"+err.stack);
                        return;
                    }
                });

                // - Delete friends -
                if (GM_getValue('delete')) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-delfrd">delete friends</a>').prependTo('#page');
                }
                $('#page').on('click', '#sct-delfrd', function(e) {
                    e.preventDefault();

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
                            text: "All friends will be removed from your friend list.<br /><br />"+
                                  "This process may take up to several minutes. Please be patient for it to be completed before browsing away from this page."+
                                  "<strong id=\"sct-delfrd-retrieving\" style=\"font-weight:bold;display:none;\"><br /><br />Retrieving friends..."+
                                  "</strong><strong id=\"sct-delfrd-progress\" style=\"font-weight:bold;display:none;\"><br /><br /><span id=\"sct-delfrd-progress-current\">0</span> of "+
                                  "<span id=\"sct-delfrd-progress-total\">0</span> friend(s) remaining...</strong>",
                            title: "Are you sure?",
                            type: "warning",
                        },
                        function(isConfirm) {
                            if (isConfirm) {
								toggleAuto('pause');
                                $.ajax({
                                    url: baseURL+"/friends/GetFriendsAndInvitesSentJson?pageNumber=0&onlineService=sc&pendingInvitesOnly=false",
                                    headers: {
                                        "Accept": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                    error: function(err){
                                        if (debug) {
                                            console.groupCollapsed("GetFriendsAndInvitesSentJson AJAX FAIL");
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
                                            text: "Something went wrong while trying to fetch the total amount of friends.",
                                            title: err.status+" - "+err.statusText,
                                            timer: 5000,
                                            type: "error",
                                        });
                                        toggleAuto('unpause');
                                    },
                                    success: function(data){
                                        if (debug) {
                                            console.groupCollapsed("GetFriendsAndInvitesSentJson AJAX OK");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(data);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        if (data.Status === true && data.TotalCount > 0) {
                                            $('#sct-delfrd-progress-current').text(data.TotalCount);
                                            $('#sct-delfrd-progress-total').text(data.TotalCount);
                                            $('#sct-delfrd-retrieving').show();

                                            RetrieveAllFriends([]);
                                        } else if (data.Status === true && data.TotalCount === 0) {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "There were no friends to delete.",
                                                title: "No friends",
                                                timer: 5000,
                                                type: "success",
                                            });
                                            toggleAuto('unpause');
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "Something went wrong while trying to fetch friend data.",
                                                title: "Something went wrong",
                                                timer: 5000,
                                                type: "error",
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
                        console.error("Error during #sct-delfrd.click():\n\n"+err.stack);
                        return;
                    }
                });
                
                // - Delete dropees -
                if (isDL() && GM_getValue('delete2')) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-deldrp">delete dropees</a>').prependTo('#page');
                }
                $('#page').on('click', '#sct-deldrp', function(e) {
                    e.preventDefault();

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
                            text: "All dropees will be removed from your friend list.<br /><br />"+
                                  "This process may take up to several minutes. Please be patient for it to be completed."+
                                  "<strong id=\"sct-delfrd-retrieving\" style=\"font-weight:bold;display:none;\"><br /><br />Retrieving friends..."+
                                  "</strong><strong id=\"sct-delfrd-progress\" style=\"font-weight:bold;display:none;\"><br /><br /><span id=\"sct-delfrd-progress-current\">0</span> of "+
                                  "<span id=\"sct-delfrd-progress-total\">0</span> friend(s) remaining...</strong>",
                            title: "Are you sure?",
                            type: "warning",
                        },
                        function(isConfirm) {
                            if (isConfirm) {
								toggleAuto('pause');
                                $.ajax({
                                    url: baseURL+"/friends/GetFriendsAndInvitesSentJson?pageNumber=0&onlineService=sc&pendingInvitesOnly=false",
                                    headers: {
                                        "Accept": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                    error: function(err){
                                        if (debug) {
                                            console.groupCollapsed("GetFriendsAndInvitesSentJson AJAX FAIL");
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
                                            text: "Something went wrong while trying to fetch the total amount of friends.",
                                            title: err.status+" - "+err.statusText,
                                            timer: 5000,
                                            type: "error",
                                        });
                                        toggleAuto('unpause');
                                    },
                                    success: function(data){
                                        if (debug) {
                                            console.groupCollapsed("GetFriendsAndInvitesSentJson AJAX OK");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(data);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        if (data.Status === true && data.TotalCount > 0) {
                                            $('#sct-delfrd-progress-current').text(data.TotalCount);
                                            $('#sct-delfrd-progress-total').text(data.TotalCount);
                                            $('#sct-delfrd-retrieving').show();

                                            RetrieveAllFriends([], undefined, true);
                                        } else if (data.Status === true && data.TotalCount === 0) {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "There were no friends to delete.",
                                                title: "No friends",
                                                timer: 5000,
                                                type: "success",
                                            });
                                            toggleAuto('unpause');
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "Something went wrong while trying to fetch friend data.",
                                                title: "Something went wrong",
                                                timer: 5000,
                                                type: "error",
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
                        console.error("Error during #sct-delfrd.click():\n\n"+err.stack);
                        return;
                    }
                });
                
                // - Auto-accept -
                if (GM_getValue('auto')) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-auto">auto-accept <span class="off">[off]</span></a>').prependTo('#page');
                }
                $('#page').on('click', '#sct-auto', function(e) {
                    e.preventDefault();

                    try {
                        if (auto) return toggleAuto();
                        var t = setInterval( function() {
							if (!autoPaused) {
                                var children = [];

                                $.ajax({
                                    url: baseURL+"/friends/GetReceivedInvitesJson",
                                    headers: {
                                        "Accept": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                    error: function(err){
                                        if (debug) {
                                            console.groupCollapsed("GetReceivedInvitesJson AJAX FAIL");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(err);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }
                                        console.error("[Auto-accept] Error fetching the total amount of friend requests.\n"+err.status+" - "+err.statusText);
                                    },
                                    success: function(data){
                                        if (debug) {
                                            console.groupCollapsed("GetReceivedInvitesJson AJAX OK");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(data);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        if (data.Status === true && data.TotalCount > 0) {
                                            data.RockstarAccounts.forEach(function(e) {
                                                children.push(e);
                                            });
                                            if (children.length == data.TotalCount) {
                                                AcceptFriend(children, true);
                                            }
                                        } else if (data.Status === true && data.TotalCount === 0) {
                                            console.log("[Auto-accept] There were no friend requests to accept.");
                                        } else {
                                            console.error("[Auto-accept] Error fetching friend request data.");
                                        }
                                    }
                                });
							} else if (debug) console.log('Auto-accept called, but paused.');
                        }, 15000);
                        toggleAuto(t);
                    } catch (err) {
                        console.error("Error during #sct-auto.click():\n\n"+err.stack);
                        return;
                    }
                });

                // -- Helper functions for main functions above --
                function RetrieveAllMessageUsers(source, pageIndex) {
                    try {
                        if (pageIndex === undefined) pageIndex = 0;

                        setTimeout(function() {
                            $.ajax({
                                url: baseURL+"/Message/GetConversationList?pageIndex="+pageIndex,
                                headers: {
                                    "Accept": "application/json",
                                    "RequestVerificationToken": verificationToken
                                },
                                error: function(err){
                                    if (debug) {
                                        console.groupCollapsed("GetConversationList AJAX FAIL");
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
                                        text: "Something went wrong while trying to fetch the conversation list.",
                                        title: err.status+" - "+err.statusText,
                                        timer: 5000,
                                        type: "error",
                                    });
                                    toggleAuto('unpause');
                                },
                                success: function(data){
                                    if (debug) {
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
                                        source.push(e);
                                    });

                                    if (data.HasMore === true) {
                                        RetrieveAllMessageUsers(source, data.NextPageIndex);
                                    } else {
                                        if (debug) console.log("RetrieveAllMessageUsers() complete.");

                                        $('#sct-delmsg-retrieving-text').text("messages");

                                        RetrieveAllMessages(source);
                                    }
                                }
                            });
                        }, 1000);
                    } catch (err) {
                        console.error("Error during RetrieveAllMessageUsers():\n\n"+err.stack);
                        return;
                    }
                }

                function RetrieveAllMessages(source, target) {
                    try {
                        if (target === undefined) target = [];

                        setTimeout(function() {
                            var item = source.pop();
                            if (item === undefined) {
                                if (debug) console.log("RetrieveAllMessages() SKIP undefined");
                                RetrieveAllMessages(source, target);
                                return;
                            }

                            if (debug) {
                                console.groupCollapsed("RetrieveAllMessages() POP");
                                console.group("Item");
                                console.log(item);
                                console.groupEnd();
                                console.groupEnd();
                            }

                            $.ajax({
                                url: baseURL+"/Message/GetMessages?rockstarId="+item.RockstarId,
                                headers: {
                                    "Accept": "application/json",
                                    "RequestVerificationToken": verificationToken
                                },
                                error: function(err){
                                    if (debug) {
                                        console.groupCollapsed("GetMessages AJAX FAIL");
                                        console.group("Request");
                                        console.log(this);
                                        console.groupEnd();
                                        console.group("Response");
                                        console.log(err);
                                        console.groupEnd();
                                        console.groupEnd();
                                    }

                                    if (source.length > 0) {
                                        RetrieveAllMessages(source, target);
                                    } else if (target.length > 0) {
                                        if (debug) console.log("RetrieveAllMessages() complete.");

                                        $('#sct-delmsg-retrieving').hide();
                                        $('#sct-delmsg-progress').show();

                                        RemoveMessage(target);
                                    }
                                },
                                success: function(data){
                                    if (debug) {
                                        console.groupCollapsed("GetMessages AJAX OK");
                                        console.group("Request");
                                        console.log(this);
                                        console.groupEnd();
                                        console.group("Response");
                                        console.log(data);
                                        console.groupEnd();
                                        console.groupEnd();
                                    }

                                    target = target.concat(data.Messages);

                                    if (source.length > 0) {
                                        RetrieveAllMessages(source, target);
                                    } else if (target.length > 0) {
                                        if (debug) console.log("RetrieveAllMessages() complete.");

                                        $('#sct-delmsg-retrieving').hide();
                                        $('#sct-delmsg-progress').show();

                                        RemoveMessage(target);
                                    }
                                }
                            });
                        }, 1000);
                    } catch (err) {
                        console.error("Error during RetrieveAllMessages():\n\n"+err.stack);
                        return;
                    }
                }

                function RemoveMessage(source) {
                    try {
                        setTimeout(function() {
                            var item = source.pop();
                            if (item === undefined) {
                                if (debug) console.log("RemoveMessage() SKIP undefined");
                                RemoveMessage(source);
                                return;
                            }

                            if (debug) {
                                console.groupCollapsed("RemoveMessage() POP");
                                console.group("Item");
                                console.log(item);
                                console.groupEnd();
                                console.groupEnd();
                            }

                            $.ajax({
                                url: baseURL+"/Message/DeleteMessage",
                                type: "POST",
                                data: '{"messageid":'+item.ID+',"isAdmin":'+item.IsAdminMessage+'}',
                                headers: {
                                    "Content-Type": "application/json",
                                    "RequestVerificationToken": verificationToken
                                },
                                error: function(err){
                                    if (debug) {
                                        console.groupCollapsed("DeleteMessage AJAX FAIL");
                                        console.group("Request");
                                        console.log(this);
                                        console.groupEnd();
                                        console.group("Response");
                                        console.log(err);
                                        console.groupEnd();
                                        console.groupEnd();
                                    }

                                    if (item.ScNickname.toLowerCase() === userNickname.toLowerCase()) {
                                        console.error("A message you sent to someone could not be removed. ("+err.status+" - "+err.statusText+")");
                                    } else {
                                        console.error("A message " + item.ScNickname + " sent to you could not be removed. ("+err.status+" - "+err.statusText+")");
                                    }

                                    if (source.length > 0) {
                                        $('#sct-delmsg-progress-current').text(source.length);

                                        RemoveMessage(source);
                                    } else {
                                        swal({
                                            allowOutsideClick: true,
                                            text: "All of the messages in your inbox should have been removed.\n\nYou can see exactly which friends have been removed and which ones haven't by opening the console (F12). To view the changes to your inbox, please browse to your inbox.",
                                            title: "Messages removed",
                                            timer: 5000,
                                            type: "success",
                                        });
                                        toggleAuto('unpause');
                                    }
                                },
                                success: function(data){
                                    if (debug) {
                                        console.groupCollapsed("DeleteMessage AJAX OK");
                                        console.group("Request");
                                        console.log(this);
                                        console.groupEnd();
                                        console.group("Response");
                                        console.log(data);
                                        console.groupEnd();
                                        console.groupEnd();
                                    }

                                    if (data.Status === true) {
                                        if (item.ScNickname != undefined) {
                                            if (item.ScNickname.toLowerCase() === userNickname.toLowerCase()) {
                                                console.info("A message you sent to someone has been removed.");
                                            } else {
                                                console.info("A message " + item.ScNickname + " sent to you has been removed.");
                                            }
                                        } else {
                                            console.info("A message someone sent to you has been removed.");
                                        }
                                    } else {
                                        if (item.ScNickname !== undefined) {
                                            if (item.ScNickname.toLowerCase() === userNickname.toLowerCase()) {
                                                console.info("A message you sent to someone could not be removed.");
                                            } else {
                                                console.info("A message " + item.ScNickname + " sent to you could not be removed.");
                                            }
                                        } else {
                                            console.info("A message someone sent to you could not be removed.");
                                        }
                                    }

                                    if (source.length > 0) {
                                        $('#sct-delmsg-progress-current').text(source.length);

                                        RemoveMessage(source);
                                    } else {
                                        swal({
                                            allowOutsideClick: true,
                                            text: "All of the messages in your inbox should have been removed.\n\n"+
                                                  "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                  " To view the changes to your inbox, please browse to your inbox.",
                                            title: "Messages removed",
                                            timer: 5000,
                                            type: "success",
                                        });
                                        toggleAuto('unpause');
                                    }
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
                        }, 1000);
                    } catch (err) {
                        console.error("Error during RemoveMessage():\n\n"+err.stack);
                        return;
                    }
                }

                function RetrieveAllFriends(source, pageIndex, reverseFilter) {
                    try {
                        if (pageIndex === undefined) pageIndex = 0;
                        if (reverseFilter === undefined) reverseFilter = 0;

                        setTimeout(function() {
                            $.ajax({
                                url: baseURL+"/friends/GetFriendsAndInvitesSentJson?pageNumber="+pageIndex+"&onlineService=sc&pendingInvitesOnly=false",
                                headers: {
                                    "Accept": "application/json",
                                    "RequestVerificationToken": verificationToken
                                },
                                error: function(err){
                                    if (debug) {
                                        console.groupCollapsed("GetFriendsAndInvitesSentJson AJAX FAIL");
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
                                        text: "Something went wrong while trying to fetch data from page "+pageIndex+".",
                                        title: err.status+" - "+err.statusText,
                                        timer: 5000,
                                        type: "error",
                                    });
                                },
                                success: function(data){
                                    if (debug) {
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
                                            if (e !== undefined) source.push(e);
                                        });
                                    } else {
                                        swal({
                                            allowOutsideClick: true,
                                            text: "Something went wrong while trying to fetch data from page "+pageIndex+".",
                                            title: "Something went wrong",
                                            timer: 5000,
                                            type: "error",
                                        });
                                        toggleAuto('unpause');
                                    }

                                    if (source.length < data.TotalCount) {
                                        RetrieveAllFriends(source, (pageIndex + 1), reverseFilter);
                                    } else {
                                        if (debug) console.log("RetrieveAllFriends() complete.");

                                        $('#sct-delfrd-retrieving').hide();
                                        $('#sct-delfrd-progress').show();

                                        RemoveFriend(source, false, reverseFilter);
                                    }
                                }
                            });
                        }, 1000);
                    } catch (err) {
                        console.error("Error during RetrieveAllFriends():\n\n"+err.stack);
                        return;
                    }
                }

                function RemoveFriend(source, isFriendRequestLoop, reverseFilter) {
                    if (debug) console.log('Calling RemoveFriend(): '+(isFriendRequestLoop ? 'Rejecting requests from ' : 'Removing ')+(reverseFilter ? 'dropees' : 'non-dropees OR all players')+'.');
                    try {
                        if (isFriendRequestLoop === undefined) isFriendRequestLoop = false;
                        if (reverseFilter === undefined) reverseFilter = false;

                        setTimeout(function() {
                            var item = source.pop();
                            if (item === undefined) {
                                if (debug) console.log("RemoveFriend() SKIP undefined");
                                RemoveFriend(source, isFriendRequestLoop, reverseFilter);
                                return;
                            }
                            // Droplist filter
                            if (isDL() && ( (isOnDroplist(item.Name) && !reverseFilter) || (!isOnDroplist(item.Name) && reverseFilter) )) {
                                console.log('Skipped removing '+item.Name+' - There is a droplist and they are '+(reverseFilter ? 'not ' : '')+'on it.');
                                if (source.length > 0)
                                    RemoveFriend(source, isFriendRequestLoop, reverseFilter);
                                else if (isFriendRequestLoop) {
                                    swal({
                                        allowOutsideClick: true,
                                        text: "All friend requests you received from non-dropees should have been rejected.\n\n"+
                                              "You can see exactly which friends have been removed and which ones haven't by opening the console (F12).",
                                        title: "Friend requests rejected",
                                        timer: 5000,
                                        type: "success",
                                    });
                                    toggleAuto('unpause');
                                }
                                else {
                                    swal({
                                        allowOutsideClick: true,
                                        text: "All non-dropee friends should have been removed.\n\n"+
                                              "You can see exactly which friends have been removed and which ones haven't by opening the console (F12).",
                                        title: "Friends removed",
                                        timer: 5000,
                                        type: "success",
                                    });
                                    toggleAuto('unpause');
                                }
                                return;
                            }

                            if (debug) {
                                console.groupCollapsed("RemoveFriend() POP");
                                console.group("Item");
                                console.log(item);
                                console.groupEnd();
                                console.groupEnd();
                            }

                            if (item.AllowDelete === true) {
                                $.ajax({
                                    url: baseURL+"/friends/UpdateFriend",
                                    type: "PUT",
                                    data: '{"id":'+item.RockstarId+',"op":"delete"}',
                                    headers: {
                                        "Content-Type": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                    error: function(err){
                                        if (debug) {
                                            console.groupCollapsed("UpdateFriend AJAX FAIL");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(err);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        console.error("Your friend " + item.Name + " could not be removed. ("+err.status+" - "+err.statusText+")");

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-rejreq-progress-current').text(source.length);
                                            } else {
                                                $('#sct-delfrd-progress-current').text(source.length);
                                            }

                                            RemoveFriend(source, false, reverseFilter);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received"+(isDL() ? ' from non-dropees' : '')+" should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your"+(isDL() ? ' non-dropee' : '')+" friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            }
                                        }
                                    },
                                    success: function(data){
                                        if (debug) {
                                            console.groupCollapsed("UpdateFriend AJAX OK");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(data);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        if (data.Status === true) {
                                            console.info("Your friend " + item.Name + " has been removed.");
                                        } else {
                                            console.error("Your friend " + item.Name + " could not be removed.");
                                        }

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-rejreq-progress-current').text(source.length);
                                            } else {
                                                $('#sct-delfrd-progress-current').text(source.length);
                                            }

                                            RemoveFriend(source, false, reverseFilter);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received"+(isDL() ? ' from non-dropees' : '')+" should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your"+(isDL() ? ' non-dropee' : '')+" friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            }
                                        }
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
                            } else if (item.AllowCancel === true) {
                                $.ajax({
                                    url: baseURL+"/friends/UpdateFriend",
                                    type: "PUT",
                                    data: '{"id":'+item.RockstarId+',"op":"cancel"}',
                                    headers: {
                                        "Content-Type": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                    error: function(err){
                                        if (debug) {
                                            console.groupCollapsed("UpdateFriend AJAX FAIL");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(err);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        console.error("The friend request you sent to " + item.Name + " could not be cancelled. ("+err.status+" - "+err.statusText+")");

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-rejreq-progress-current').text(source.length);
                                            } else {
                                                $('#sct-delfrd-progress-current').text(source.length);
                                            }

                                            RemoveFriend(source, false, reverseFilter);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received"+(isDL() ? ' from non-dropees' : '')+" should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your"+(isDL() ? ' non-dropee' : '')+" friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            }
                                        }
                                    },
                                    success: function(data){
                                        if (debug) {
                                            console.groupCollapsed("UpdateFriend AJAX OK");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(data);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        if (data.Status === true) {
                                            console.info("The friend request you sent to " + item.Name + " has been cancelled.");
                                        } else {
                                            console.error("The friend request you sent to " + item.Name + " could not be cancelled.");
                                        }

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-rejreq-progress-current').text(source.length);
                                            } else {
                                                $('#sct-delfrd-progress-current').text(source.length);
                                            }

                                            RemoveFriend(source, false, reverseFilter);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received"+(isDL() ? ' from non-dropees' : '')+" should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your"+(isDL() ? ' non-dropee' : '')+" friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            }
                                        }
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
                            } else if (item.AllowAdd === true) {
                                $.ajax({
                                    url: baseURL+"/friends/UpdateFriend",
                                    type: "PUT",
                                    data: '{"id":'+item.RockstarId+',"op":"ignore"}',
                                    headers: {
                                        "Content-Type": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                    error: function(err){
                                        if (debug) {
                                            console.groupCollapsed("UpdateFriend AJAX FAIL");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(err);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        console.error("The friend request you received from " + item.Name + " could not be rejected. ("+err.status+" - "+err.statusText+")");

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-rejreq-progress-current').text(source.length);
                                            } else {
                                                $('#sct-delfrd-progress-current').text(source.length);
                                            }

                                            RemoveFriend(source, false, reverseFilter);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received"+(isDL() ? ' from non-dropees' : '')+" should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your"+(isDL() ? ' non-dropee' : '')+" friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            }
                                        }
                                    },
                                    success: function(data){
                                        if (debug) {
                                            console.groupCollapsed("UpdateFriend AJAX OK");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(data);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        if (data.Status === true) {
                                            console.info("The friend request you received from " + item.Name + " has been rejected.");
                                        } else {
                                            console.error("The friend request you received from " + item.Name + " could not be rejected.");
                                        }

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-rejreq-progress-current').text(source.length);
                                            } else {
                                                $('#sct-delfrd-progress-current').text(source.length);
                                            }

                                            RemoveFriend(source, false, reverseFilter);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received"+(isDL() ? ' from non-dropees' : '')+" should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your"+(isDL() ? ' non-dropee' : '')+" friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            }
                                        }
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
                            } else {
                                console.warn("The user " + item.Name + " has been skipped (reason: type \""+item.Relationship+"\" not supported).");

                                if (source.length > 0) {
                                    if (isFriendRequestLoop) {
                                        $('#sct-rejreq-progress-current').text(source.length);
                                    } else {
                                        $('#sct-delfrd-progress-current').text(source.length);
                                    }

                                    RemoveFriend(source, false, reverseFilter);
                                } else {
                                    if (isFriendRequestLoop) {
                                        swal({
                                            allowOutsideClick: true,
                                            text: "All friend requests you received"+(isDL() ? ' from non-dropees' : '')+" should have been rejected.\n\n"+
                                                  "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                  " To view the changes to your friends list, please refresh the page.",
                                            title: "Friend requests rejected",
                                            timer: 5000,
                                            type: "success",
                                        });
										toggleAuto('unpause');
                                    } else {
                                        swal({
                                            allowOutsideClick: true,
                                            text: "All your"+(isDL() ? ' non-dropee' : '')+" friends should have been removed.\n\n"+
                                                  "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                  " To view the changes to your friends list, please refresh the page.",
                                            title: "Friends removed",
                                            timer: 5000,
                                            type: "success",
                                        });
                                        toggleAuto('unpause');
                                    }
                                }
                            }
                        }, 1000);
                    } catch (err) {
                        console.error("Error during RemoveFriend():\n\n"+err.stack);
                        return;
                    }
                }

                function RetrieveBlockedList(source) {
                    try {
                        var target = [];

                        setTimeout(function() {
                            $.ajax({
                                url: baseURL+"/friends/GetBlockedJson",
                                headers: {
                                    "Accept": "application/json",
                                    "RequestVerificationToken": verificationToken
                                },
                                error: function(err){
                                    if (debug) {
                                        console.groupCollapsed("GetBlockedJson AJAX FAIL");
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
                                        text: "Something went wrong while trying to retrieve blocked users.",
                                        title: err.status+" - "+err.statusText,
                                        timer: 5000,
                                        type: "error",
                                    });
                                },
                                success: function(data){
                                    if (debug) {
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
                                        data.RockstarAccounts.forEach(function(e){
                                            if (e !== undefined) target.push(e);
                                        });

                                        var obj = target.filter(function(obj) {
                                            return obj.Name.trim().toLowerCase() === source.Nickname.trim().toLowerCase();
                                        })[0];

                                        if (obj === undefined) {
                                            AddFriend(source);
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: source.Nickname+" is on your blocked users list. To be able to send them a friend request, remove them from your blocked users list, then try again.",
                                                title: "User blocked",
                                                timer: 5000,
                                                type: "warning",
                                            });
                                        }
                                    } else {
                                        swal({
                                            allowOutsideClick: true,
                                            text: "Something went wrong while trying to retrieve blocked users.",
                                            title: "Something went wrong",
                                            timer: 5000,
                                            type: "error",
                                        });
                                    }
                                }
                            });
                        }, 1000);
                    } catch (err) {
                        console.error("Error during RetrieveBlockedList():\n\n"+err.stack);
                        return;
                    }
                }

                function AddFriend(source) {
                    try {
                        $.ajax({
                            url: baseURL+"/friends/UpdateFriend",
                            type: "PUT",
                            data: '{"id":'+source.RockstarId+',"op":"addfriend","custommessage":"'+friendMessage.trim().replace(/\s\s+/g, ' ')+'"}',
                            headers: {
                                "Content-Type": "application/json",
                                "RequestVerificationToken": verificationToken
                            },
                            error: function(err){
                                if (debug) {
                                    console.groupCollapsed("UpdateFriend AJAX FAIL");
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
                                    text: 'Something went wrong trying to add "' + source.Nickname + '".',
                                    title: err.status+" - "+err.statusText,
                                    timer: 5000,
                                    type: "error",
                                });
                            },
                            success: function(data){
                                if (debug) {
                                    console.groupCollapsed("UpdateFriend AJAX OK");
                                    console.group("Request");
                                    console.log(this);
                                    console.groupEnd();
                                    console.group("Response");
                                    console.log(data);
                                    console.groupEnd();
                                    console.groupEnd();
                                }

                                if (data.Status === true) {
                                    swal({
                                        allowOutsideClick: true,
                                        text: 'A friend request has been sent to "' + source.Nickname + '".\n\nTo view the changes to your friends list, please refresh the page.',
                                        title: "User added",
                                        timer: 5000,
                                        type: "success",
                                    });
                                } else {
                                    swal({
                                        allowOutsideClick: true,
                                        text: 'Something went wrong trying to add "' + source.Nickname + '".',
                                        title: "Something went wrong",
                                        timer: 5000,
                                        type: "error",
                                    });
                                }
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
                        console.error("Error during AddFriend():\n\n"+err.stack);
                        return;
                    }
                }

                function AcceptFriend(source, isFriendRequestLoop) {
                    try {
                        if (isFriendRequestLoop === undefined) isFriendRequestLoop = false;

                        setTimeout(function() {
                            var item = source.pop();
                            if (item === undefined) {
                                if (debug) console.log("AcceptFriend() SKIP undefined");
                                AcceptFriend(source, isFriendRequestLoop);
                                return;
                            }

                            if (debug) {
                                console.groupCollapsed("AcceptFriend() POP");
                                console.group("Item");
                                console.log(item);
                                console.groupEnd();
                                console.groupEnd();
                            }

                            // Droplist filter
                            if (isDL() && !isOnDroplist(item.Name)) {
                                console.log('Skipped accepting '+item.Name+' - There is a droplist and they are not on it.');
                                if (source.length > 0)
                                    AcceptFriend(source, isFriendRequestLoop);
                                else {
                                    swal({
                                        allowOutsideClick: true,
                                        text: "All friend requests you received from dropees should have been accepted.\n\n"+
                                              "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                              " To view the changes to your friends list, please refresh the page.",
                                        title: "Friend requests accepted",
                                        timer: 2000,
                                        type: "success",
                                    });
                                    toggleAuto('unpause');
                                }
                                return;
                            }

                                if (debug) console.log('Making request: {"id":'+item.RockstarId+',"op":"confirm","custommessage":"","accept":"true"}');
                                $.ajax({
                                    url: baseURL+"/friends/UpdateFriend",
                                    type: "PUT",
                                    data: '{"id":'+item.RockstarId+',"op":"confirm","custommessage":"","accept":"true"}',//  }',//
                                    headers: {
                                        "Content-Type": "application/json",
                                        "RequestVerificationToken": verificationToken
                                    },
                                    error: function(err){
                                        if (debug) {
                                            console.groupCollapsed("UpdateFriend AJAX FAIL");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(err);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        console.error("The friend request you received from " + item.Name + " could not be accepted. ("+err.status+" - "+err.statusText+")");

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-accreq-progress-current').text(source.length);
                                            }

                                            AcceptFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received"+(isDL() ? ' from dropees' : '')+" should have been accepted.\n\n"+
                                                          "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests accepted",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends"+(isDL() ? ' on the droplist' : '')+" should have been added.\n\n"+
                                                          "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends added",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            }
                                        }
                                    },
                                    success: function(data){
                                        if (debug) {
                                            console.groupCollapsed("UpdateFriend AJAX OK");
                                            console.group("Request");
                                            console.log(this);
                                            console.groupEnd();
                                            console.group("Response");
                                            console.log(data);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }

                                        if (data.Status === true) {
                                            console.info("The friend request you received from " + item.Name + " has been accepted.");
                                        } else {
                                            console.error("The friend request you received from " + item.Name + " could not be accepted.");
                                        }

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-accreq-progress-current').text(source.length);
                                            }

                                            AcceptFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received"+(isDL() ? ' from dropees' : '')+" should have been accepted.\n\n"+
                                                          "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests accepted",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                            } else {
                                                toggleAuto('unpause');
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends"+(isDL() ? ' on the droplist' : '')+" should have been added.\n\n"+
                                                          "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends added",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                                toggleAuto('unpause');
                                            }
                                        }
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
                        }, 1000);
                    } catch (err) {
                        console.error("Error during AcceptFriend():\n\n"+err.stack);
                        return;
                    }
                }

// maybe implement in the future? seems mostly unnecessary
                 /*function DeletePost(source, isLoop) {
                    try {
                        if (isLoop === undefined) isLoop = false;

                        setTimeout(function() {
                            var item = source.pop();
                            if (item === undefined) {
                                if (debug) console.log("DeletePost() SKIP undefined")
                                DeletePost(source, isLoop);
                                return;
                            }

                            if (debug) {
                                console.groupCollapsed("DeletePost() POP");
                                console.group("Item");
                                console.log(item);
                                console.groupEnd();
                                console.groupEnd();
                            };

                            if (debug) console.log('Making request: https://socialclub.rockstargames.com/reference/friendfeed');//  }');//
                            $.ajax({
                                url: baseURL+"/reference/remove_activity/"+item.activityId+"/92155523/FRIEND/34708577",
                                type: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    "RequestVerificationToken": verificationToken
                                },
                                error: function(err){
                                    if (debug) {
                                        console.groupCollapsed("UpdateFriend AJAX FAIL");
                                        console.group("Request");
                                        console.log(this);
                                        console.groupEnd();
                                        console.group("Response");
                                        console.log(err);
                                        console.groupEnd();
                                        console.groupEnd();
                                    };

                                    console.error("The friend request you received from " + item.Name + " could not be accepted. ("+err.status+" - "+err.statusText+")");

                                    if (source.length > 0) {
                                        if (isLoop) {
                                            $('#nt-delpst-progress-current').text(source.length);
                                        }

                                        AcceptFriend(source);
                                    } else {
                                        if (isFriendRequestLoop) {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "All friend requests you received should have been accepted.\n\nYou can see exactly which friends have been added and which ones haven't by opening the console (F12). To view the changes to your friends list, please refresh the page.",
                                                title: "Friend requests accepted",
                                                timer: 5000,
                                                type: "success",
                                            });
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "All your friends should have been added.\n\nYou can see exactly which friends have been added and which ones haven't by opening the console (F12). To view the changes to your friends list, please refresh the page.",
                                                title: "Friends added",
                                                timer: 5000,
                                                type: "success",
                                            });
                                        }
                                    }
                                },
                                success: function(data){
                                    if (debug) {
                                        console.groupCollapsed("UpdateFriend AJAX OK");
                                        console.group("Request");
                                        console.log(this);
                                        console.groupEnd();
                                        console.group("Response");
                                        console.log(data);
                                        console.groupEnd();
                                        console.groupEnd();
                                    };

                                    if (data.Status == true) {
                                        console.info("The friend request you received from " + item.Name + " has been accepted.");
                                    } else {
                                        console.error("The friend request you received from " + item.Name + " could not be accepted.");
                                    }

                                    if (source.length > 0) {
                                        if (isFriendRequestLoop) {
                                            $('#nt-accreq-progress-current').text(source.length);
                                        }

                                        DeletePost(source);
                                    } else {
                                        if (isFriendRequestLoop) {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "All friend requests you received should have been accepted.\n\nYou can see exactly which friends have been added and which ones haven't by opening the console (F12). To view the changes to your friends list, please refresh the page.",
                                                title: "Friend requests accepted",
                                                timer: 5000,
                                                type: "success",
                                            });
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "All your friends should have been added.\n\nYou can see exactly which friends have been added and which ones haven't by opening the console (F12). To view the changes to your friends list, please refresh the page.",
                                                title: "Friends added",
                                                timer: 5000,
                                                type: "success",
                                            });
                                        }
                                    }
                                },
                                xhr: function() {
                                    var xhr = jQuery.ajaxSettings.xhr();
                                    var setRequestHeader = xhr.setRequestHeader;
                                    xhr.setRequestHeader = function(name, value) {
                                        if (name == 'X-Requested-With') return;
                                        setRequestHeader.call(this, name, value);
                                    }

                                    return xhr;
                                }
                            });
                        }, 1000)
                    } catch (err) {
                        console.error("Error during AcceptFriend():\n\n"+err.stack);
                        return;
                    }
                }*/
                console.info("The Social Club tool was loaded successfully.");
            }
        } catch (err) {
            console.error("Uncaught exception:\n\n"+err.stack);
            return;
        }
	}, 1000);
}

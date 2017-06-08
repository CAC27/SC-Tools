// ==UserScript==
// @name         SC Tools
// @version      1.0
// @description  Useful tools for dropping.
// @author       CAC
// @icon         https://socialclub.rockstargames.com/favicon.ico
// @match        https://socialclub.rockstargames.com/*
// @match        https://*.socialclub.rockstargames.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// ==/UserScript==

// SC regex: /^[a-z.A-Z_\d]{6,16}$/

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

Init('', GM_getValue('checkBlocked'), GM_getValue('debug'));

function Init(friendMessage, checkBlocked, debug) {
	var isReloaded = false;

	try {
		/*if (!document.getElementById("sct-jq")) {
			var jQ = document.createElement('script');
			jQ.id = "sct-jq";
			jQ.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js";
			document.getElementsByTagName('head')[0].appendChild(jQ);
		} else {
			isReloaded = true;
			if (debug) console.log("jQuery was already present.");
		}  -- implemented in @require -- */

		if (!document.getElementById("sct-sacss")) {
			var sacss = document.createElement('link');
			sacss.id = "sct-sacss";
			sacss.rel = "stylesheet";
			sacss.href = "https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.css";
			document.getElementsByTagName('head')[0].appendChild(sacss);
		} else {
			isReloaded = true;
			if (debug) console.log("SweetAlert CSS was already present.");
		}

        if (!document.getElementById("sct-sajs")) {
			var sajs = document.createElement('script');
			sajs.id = "sct-sajs";
			sajs.src = "https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js";
			document.getElementsByTagName('head')[0].appendChild(sajs);
		} else {
			isReloaded = true;
			if (debug) console.log("SweetAlert JS was already present.");
		}
	} catch (err) {
		console.error("Error during script loader:\n\n"+err.stack);
		return;
	}

	setTimeout(function () {
//OLD STUFF
        try {
            try {
                var verificationToken = siteMaster.aft.replace('<input name="__RequestVerificationToken" type="hidden" value="', '').replace('" />', '').trim();
                var userNickname = siteMaster.authUserNickName;
                var isLoggedIn = siteMaster.isLoggedIn;
            } catch (err) {
                console.error("Error retrieving account data:\n\n"+err.stack);
                return;
            }

            if (userNickname !== "" && isLoggedIn) {
                if (!document.getElementById("sct-cred")) {
                    $('<li id="sct-cred">Social Club tool by <a href="https://github.com/CAC27" target="_blank">CAC</a>, '+
                      'based on the tool by <a href="https://github.com/Nadermane" target="_blank">Nadermane</a>'+(debug ? " (debug mode)" : "")+'</li>').appendTo('#footerNav');
                } else {
                    $("#sct-cred").remove();
                    $('<li id="sct-cred">Social Club tool by <a href="https://github.com/CAC27" target="_blank">CAC</a>, '+
                      'based on the tool by <a href="https://github.com/Nadermane" target="_blank">Nadermane</a>'+(debug ? " (debug mode)" : "")+'</li>').appendTo('#footerNav');
                    isReloaded = true;
                    if (debug) console.log("#sct-cred was already present.");
                }
                
// NEW STUFF - settings in dropdown
                $('#loggedIn ul.dropdown-menu').append('<li>'+
                    '<a target="_blank"><input type="checkbox" id="debugToggle" class="SCTools">Debug Mode</a>'+
                '</li><li>'+
                    '<a target="_blank"><input type="checkbox" id="checkBlocked" class="SCTools">Check blocked players</a>'+
                '</li><li>'+
                    '<a target="_blank"><input type="checkbox" id="statsToggle" class="SCTools">Check stats</a>'+
                '</li>');
                $('head').append('<style id="sct_style">.sctb { margin-bottom: 8px; margin-right: 5px; } input[type="checkbox"].SCTools { -webkit-appearance: none; width: 16px; height: 16px; background: #CCC; border: 2px solid #BBB; margin: -10px 6px 9px -1px;}a:hover > input[type="checkbox"].SCTools { -webkit-appearance: none; width: 16px; height: 16px; background-color: #DDD; border: 2px solid #CCC; margin: -10px 6px 9px -1px;}input.SCTools[type="checkbox"]:checked { background-image: url(https://www.degoudenton.nl/skin/frontend/default/degoudenton/images/checkmark-orng.png);}</style>');

                //show correct values
                $('#debugToggle').prop('checked', debug);
                $('#checkBlocked').prop('checked', checkBlocked);
                $('#statsToggle').prop('checked', GM_getValue('stats'));

                // functionality for the above
                $('#debugToggle').change(function() {
                    debug = this.checked;
                    GM_setValue('debug', this.checked);
                });
                $('#checkBlocked').change(function() {
                    checkBlocked = this.checked;
                    GM_setValue('checkBlocked', this.checked);
                });
                $('#statsToggle').change(function() {
                    GM_setValue('stats', this.checked);
                    if (!this.checked) {
                        $('#sct-restat').remove();
                        $('#sct-rel').remove();
                    }
                    else if (window.location.href.match(/https:\/\/(\w\w\.)?socialclub\.rockstargames\.com\/tools.*/))
                        $('#droplist_wrapper').append('<a class="btn btnGold btnRounded sctb2" href="#" id="sct-restat">reload stats</a>');
                    refresh();
                });

                
//NEW STUFF - droplist
                if (window.location.href.match(/https:\/\/(\w\w\.)?socialclub\.rockstargames\.com\/tools.*/)) {
                    $('.alertBox.notFound').replaceWith('<div id="sctools"><div id="droplist" class="activePanel"> <div class="gridPanel sct" id="droplist_info"> <h3 class="sct">Edit Droplist</h3> <p class="sct">This is designed to accept dropBot messages:<br><br> <b>Discord Name:</b> someName <b>ID:</b> 1234567890 - <b>SC:</b> socialClubName - <b>Drops Attended:</b> x<br><i>(one dropee per line)</i> <br><br>So just directly copy and paste them. <br><br>Note that the button functions change if you have a droplist. </p> <div id="droplist_input_wrapper"> <textarea id="droplist_input" placeholder="Discord: CAC - SC: ¯\\_(ツ)_/¯ - Drops attended: 19\nDiscord: YellowHeart - SC: 🤔 - Drops Attended: 70"></textarea> <a class="btn btnGold btnrounded sctb2" href="#" id="sct-add">add</a> <a class="btn btnGold btnRounded sctb2" href="#" id="sct-remove">remove</a> </div></div><div class="gridPanel sct" id="current_droplist"> <h3 class="sct">Current Droplist</h3> <p class="sct">This is a list of your dropees, including some info about them.<br><br>It will be in the format:<br>SC name | Discord name | Total money | Rank | Drops attended.<br><br><i>Note: Stats (rank/cash) will be unavailable for some players, due to privacy settings.</i> </p> <div id="droplist_wrapper"> <ul id="current_list">   <li class="empty">Tumbleweeds...</li> </ul> <a class="btn btnGold btnrounded sctb2" href="#" id="sct-clear">clear</a></div></div></div></div>');
                    $('head').append('<style id="sctools_style">h3.sct { color: white; padding: 5px; } p.sct { color: #bbb; padding: 10px; } textarea#droplist_input { color: #fff; width: 99%; min-height: 300px; margin: 5px; background: #222; padding:  5px; border: 2px solid #444; border-radius: 10px; } a.btn.btngold.btnrounded.sctb2 { margin: 5px; } .gridPanel.sct { padding: 10px !important; } div#current_droplist { float: right; width: 59%; } div#droplist_info { float: left; width: 39%; } .empty, .gray { color: #666; } ul#current_list { color: #fff; background: #222; padding: 10px; margin: 5px; } #current_list li { padding:  5px; border-bottom: 2px solid #666; } .unknown { color: #FB0; } .bl { color: #F00; } .fail { color: #F70 } /*.rank { background: url(/images/games/GTAV/player-rank.png) no-repeat; background-size: 30px; padding: 4px 3px; }*/ .sctb-16 { float: right; height: 16px; width: 16px; background-size: 16px; display: inline-block; transition: 150ms; } .sctb-16:hover { filter: brightness(1.5); cursor: pointer; }'+
                        '.sct-del { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAIhIAACISAFlEbUFAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAHNSURBVHja7Ne9axRBGMfxz94diQlnSGN8AQXFQlCxsBUrFQVFUUvFzj9Bi2ssPBDs/BPyBwgBXyE2VloElKigIgFf0EIUVBSJcW2eg2VZs+txG0XuB8sMv5md/c7sM7vzJGmagk6no0QTuIhjWI2fufYGvuEOzuHtcoN1u13QUl1XcKakzyROYS0OVBm0KsAaHI36PKajnkSZYgnHsQf7sB2P+wHYha0xICxiS8wOHuAuxnP3fcX6AEhwEhuxKtqbeI37vwMYx27cQHsZ6NNxlelCgZfiBG4HsEam8WzMrK0+JbiKTjZyexqxchopegU38Rnfo0xreHAbY5grApiPaxQHgzId4NKnsfyfynbBZGyziRpWYCce5b9eRZGarlQwNPxlVQV4F/t3f+xheI4jES/3wpvDIRzGk0ECfMEMZrEQ3kdcC6A3GdBbuI73gwRICupl3v8VA0OAIcAQYAjwzwOkdQMkmWN4K3NvK+c1M2Wz38QkKfipbMLDSMemwtuBpzH7deHtxYuob+gXYBE/CvptznmjkbBkNVbg9bQUY5e+gg94VkO8vcLLqjFwqQaAy5E9V0pOZ+K4dR7bIqD+NNJ7R/GFyKynizr9GgBEeldN2USYxwAAAABJRU5ErkJggg==); }'+
                        '.sct-rel { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAK5SURBVHja7NddiBZlFAfw3+uuxkqmm4U35UUQ5lVgSmxs+UHBstCFERQoiZiC1IVgHwTlshiJiGKKBdnHhQq6GBVIXij4BYsR7na3QqFXoYGw7WZs6+72dnNGhmHed2a2CxH9w8DM85yZ/5nn/J9zzlOr1+vuJGa4w2iF3t7eMrazsBzdWIrH8FDM3cTvGMCPOIOxJt/agr97enoOtpZ08g28g8UNbB7GQnTgLVzBXnyB8YztdmzFN2VC8BTO4asm5Hl4AvvwE55JjW/Dh5iIS7MV6MJRzC0gq6PWYO5pXMAaPInelPZamjnQhe/xQM7cAH7Az/gjHJgfZN14IfPdNvTlOFlr5MAiHMkhHwodnAzSLE5jN5ZgJ17Mij1n5XI18HmIKo0+LAuFFyWOAbyEj0pvwxTWYGUO+esliLN4sGA+NwRvZ55/xcZpkH+GzQXCrWcdmInHM4YfYLQi+ddYX2DzLyazGpjAsdRzf6i9CvYE+Qj+zLlGImuO4p+8ELyP82iPbThZgbwF+7ELUw3C1pIKwVieA5PT+OsEU7h611XD+w4kGpgdqbdW4p3ZuF5RoG1YHfffpXuFxIH3sBaPhJgaoR2HsK7ijx7GK3H/LV7NOjAnKlpR6T2BTRXJV6TIRcVcEJX0tgZaSuihL5ZxvAL5zKiQaVzDcFaE9YJ8/yVeqxj3pCYsyYx9iltVd8FwReJZ4fSbmfFBHJjONnw3WqvnStiuwkVsyIyPhUNTCjqVJK1OxZ8k6Awn+kOMg7gRc49G8/kyns3ZzvXYOQNFDUmCT4KsD/MyK9YZV1mMRVt/vFkmrKW83hXt86no8/v/R6IbjLAdL0rFM2I19kRSSnA5TkMboikti9+iu+rAL2VS8RA+xo4cm8nocg7j+Ugky1JHsxr+iqPZpWhczyYNRxFq9/zp+L8BAOz5m71fnJ1fAAAAAElFTkSuQmCC); }'+
                    '</style>');

                    if (GM_getValue('stats'))
                        $('#droplist_wrapper').append('<a class="btn btnGold btnRounded sctb2" href="#" id="sct-restat">reload stats</a>');
                } else {
                    if (!document.getElementById("sct-dllink")) {
                        $('<a class="btn btnGold btnRounded sctb" href="/tools" id="sct-sllink">edit droplist</a>').prependTo('#page');
                    } else {
                        $("#sct-dllink").remove();
                        $('<a class="btn btnGold btnRounded sctb" href="/tools" id="sct-dllink">edit droplist</a>').prependTo('#page');
                        isReloaded = true;
                        if (debug) console.log("#sct-dllink was already present.");
                    }
                }

                setTimeout(refresh, 200);
                function refresh(dl) {
                    if(!dl) dl = GM_getValue('droplist');
                    $('#current_list > li').remove();

                    var newList = [];
                    for (var i in dl) {
                        if ( dl[i] && (dl[i].sc || dl[i].discord) ) { //filter empty members
                            $('#current_list').append('<li'+(dl[i].sc == '<span class="unknown">???</span>' ? '' : ' data-sc="'+dl[i].sc+'"')+'> '+
                                 '<span class="gray">SC:</span> '+dl[i].sc+
                                 ' <span class="gray">| Discord:</span> '+dl[i].discord+
                                 (GM_getValue('stats') ? ' <span class="gray">|</span> 💰 '+dl[i].money : '')+
                                 (GM_getValue('stats') ? ' <span class="gray">|</span> 🌐 '+dl[i].rank : '')+
                                 ' <span class="gray">| Drops:</span> '+dl[i].drops+
                                 '<span class="sctb-16 sct-del"></span>'+
                                 (GM_getValue('stats') ? '<span class="sctb-16 sct-rel"></span>' : '')+
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
                    var dl = GM_getValue('droplist').map(e => { return e.sc; });
                    //if (debug) console.log('Checking if '+sc+' is on this list: \n'+dl);
                    return dl.indexOf(sc) > -1;
                }
                
                function changeText() { //changes button/dialog text to match the context
                    if (isDL()) {
                        $('#sct-delfrd').text('delete non-dropees');
                        $('#sct-accfrd').text('accept all dropees');
                        $('#sct-rejreq').text('reject non-dropees');
                    } else {
                        $('#sct-delfrd').text('delete friends');
                        $('#sct-accfrd').text('accept requests');
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
                                url: "https://socialclub.rockstargames.com/games/gtav/career/overviewAjax?character=Freemode&nickname="+member.sc+"&slot=Freemode&gamerHandle=&gamerTag=&_="+Date.now(),
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

                                        if (member.rawMoney > 300000000)
                                            member.money = '<span class="bl">'+member.money+'</span>';

                                        if (member.rank == 0) {
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
                
                $('#sct-clear').click(function() {
                    refresh([]);
                });
                
                $('#sct-add').click(function() {
                    var txt = $('#droplist_input').val();
                    $('#droplist_input').val('');
                    txt = txt.split('\n');
                    var leftovers = false;
                    var l = false;
                    if (txt.length > 15 && GM_getValue('stats')) {
                        l = true;
                        leftovers = txt.splice(15, txt.length - 15);
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
                            if (GM_getValue('stats'))
                            swal({
                                title: "Finished!",
                                text: "Finished retrieving player stats.",
                                type: "success",
                                showConfirmButton: false,
                                timer: 1000
                              });

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
                        imageUrl: "http://3.bp.blogspot.com/-xS5R6lFuzSU/VO8gEhp-gdI/AAAAAAAACyA/ou7QLt502yY/s1600/c7a445575f01571e8dfbd72603689dcd.jpg.gif",
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
                        
                        //console.log(member); continue;

// BETA: Retrieve stats (if script setting allows for it)
                        if (GM_getValue('stats') && member.sc !== '<span class="unknown">???</span>') {
                            //check for dupe by SC
                            if (isOnDroplist(member.sc)) {
                                n++;
                                console.log('Duplicate dropee skipped.');

                                if (n == txt.length) {//done with reqs (only used here when last is a dupe)
                                    if (l) swal({
                                        title: "Whoa, slow down there.",
                                        text: "You'll need to wait for at least 30 seconds to add more people, otherwise stats won't work because rate limits.",
                                        type: "warn",
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
                        var s = list.map(item => { return item.sc; });
                        var sc = temp[temp.indexOf(' - SC: ') + 1];
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
                
// NEW STUFF: Refresh stats for whole list
                $('#sct-restat').click(function() {
                    var list = GM_getValue('droplist');
                    var n = 0;
                    var oldSCList = list.map(e => { return e.sc; });

                    function memberDone(member) {
                        n++;
                        $('#sct-stats-progress-current').text(list.length - n);

                        list[n-1] = member;

                        if (n == list.length-1) {//done with reqs
                            swal({
                                title: "Finished!",
                                text: "Finished retrieving player stats.",
                                type: "success",
                                showConfirmButton: false,
                                timer: 1000
                            });

                            refresh(list);
                        }
                    }
                    
                    swal({
                        title: "Getting stats...",
                        html: true,
                        text: "Getting stats (most notably, money) for players.<br>"+
                                  "<i>This should only take a minute if you added a reasonable number of people.</i><br>"+
                                  "<strong id=\"sct-stats-progress\" style=\"font-weight:bold;\"><br><br><span id=\"sct-stats-progress-current\">"+list.length+"</span> of "+
                                  "<span id=\"sct-stats-progress-total\">"+list.length+"</span> player(s) remaining...</strong>",
                        imageUrl: "http://3.bp.blogspot.com/-xS5R6lFuzSU/VO8gEhp-gdI/AAAAAAAACyA/ou7QLt502yY/s1600/c7a445575f01571e8dfbd72603689dcd.jpg.gif",
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });

                    for (var i in list) {
                        var member = list[i];
                        if (member.sc !== '<span class="unknown">???</span>') {
                            //check for dupe by SC
                            /*if (oldSCList.indexOf(member.sc) !== -1) {
                                n++;
                                console.log('Duplicate dropee skipped.');

                                if (n == list.length) {//done with reqs (only used here when last is a dupe)
                                    swal({
                                        title: "Finished!",
                                        text: "Finished retrieving player stats.",
                                        type: "success",
                                        showConfirmButton: false,
                                        timer: 1000
                                      });

                                    refresh(list);
                                }
                                continue;
                            }*/
                            var time = 2000 * i; //+ 4000 * Math.floor(10 - (i % 10));

                            getStats(member, memberDone, time);
                        }
                        else memberDone(member);
                    }
                });
                
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
                
// old stuff
                if (!document.getElementById("sct-delmsg")) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-delmsg">delete messages</a>').prependTo('#page');
                } else {
                    $("#sct-delmsg").remove();
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-delmsg">delete messages</a>').prependTo('#page');
                    isReloaded = true;
                    if (debug) console.log("#sct-delmsg was already present.");
                }

                $("#sct-delmsg").click(function(e) {
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
                        function(isConfirm){
                            if (isConfirm) {
                                $.ajax({
                                    url: "https://socialclub.rockstargames.com/Message/GetMessageCount",
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
                                        };

                                        swal({
                                            allowOutsideClick: true,
                                            text: "Something went wrong while trying to fetch the total amount of messages.",
                                            title: err.status+" - "+err.statusText,
                                            timer: 5000,
                                            type: "error",
                                        });	
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
                                        };

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
                
//OLD STUFF
                if (!document.getElementById("sct-qckadd")) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-qckadd">quick-add user</a>').prependTo('#page');
                } else {
                    $("#sct-qckadd").remove();
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-qckadd">quick-add user</a>').prependTo('#page');
                    isReloaded = true;
                    if (debug) console.log("#sct-qckadd was already present.");
                }

                $("#sct-qckadd").click(function(e) {
                    e.preventDefault();

                    try {
                        swal({
                            allowEscapeKey: false,
                            closeOnConfirm: false,
                            confirmButtonText: "Add",
                            inputPlaceholder: "Social Club username",
                            showCancelButton: true,
                            showLoaderOnConfirm: true,
                            text: 'Please enter the Social Club username you want to add. When you click "Add", the user will automatically be added if it exists.'
                            +(checkBlocked ? "" : "\n\nNote: You have disabled the blocked users list check. If the user is on your blocked users list, they will be unblocked and sent a friend request.")+
                            (friendMessage.trim() == "" ? "" : "\n\nNote: You have set a custom friend request message, which will get sent to the user."),
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
                                url: "https://socialclub.rockstargames.com/Friends/GetAccountDetails?nickname="+inputValue.trim()+"&full=false",
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
                                    };

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
                                    };

                                    if (data.Status == true) {
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

                if (!document.getElementById("sct-rejreq")) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-rejreq">reject requests</a>').prependTo('#page');
                } else {
                    $("#sct-rejreq").remove();
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-rejreq">reject requests</a>').prependTo('#page');
                    isReloaded = true;
                    if (debug) console.log("#sct-rejreq was already present.");
                }

                $("#sct-rejreq").click(function(e) {
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
                        function(isConfirm){
                            if (isConfirm) {
                                var children = [];

                                $.ajax({
                                    url: "https://socialclub.rockstargames.com/friends/GetReceivedInvitesJson",
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
                                        };

                                        swal({
                                            allowOutsideClick: true,
                                            text: "Something went wrong while trying to fetch the total amount of friend requests.",
                                            title: err.status+" - "+err.statusText,
                                            timer: 5000,
                                            type: "error",
                                        });
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

                                        if (data.Status == true && data.TotalCount > 0) {
                                            $('#sct-rejreq-progress-current').text(data.TotalCount);
                                            $('#sct-rejreq-progress-total').text(data.TotalCount);
                                            $('#sct-rejreq-progress').show();

                                            data.RockstarAccounts.forEach(function(e) {
                                                children.push(e);
                                            });

                                            if (children.length == data.TotalCount) {
                                                RemoveFriend(children, true);
                                            };
                                        } else if (data.Status == true && data.TotalCount == 0) {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "There were no friend requests to reject.",
                                                title: "No friend requests",
                                                timer: 5000,
                                                type: "success",
                                            });
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "Something went wrong while trying to fetch friend request data.",
                                                title: "Something went wrong",
                                                timer: 5000,
                                                type: "error",
                                            });
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

// NEW STUFF
                if (!document.getElementById("sct-accfrd")) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-accfrd">accept requests</a>').prependTo('#page');
                } else {
                    $("#sct-accfrd").remove();
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-accfrd">accept requests</a>').prependTo('#page');
                    isReloaded = true;
                    if (debug) console.log("#sct-accfrd was already present.");
                }

                $("#sct-accfrd").click(function(e) {
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
                                  "<strong id=\"sct-accfrd-progress\" style=\"font-weight:bold;display:none;\"><br /><br /><span id=\"sct-accfrd-progress-current\">0</span> of "+
                                  "<span id=\"sct-accfrd-progress-total\">0</span> friend request(s) remaining...</strong>",
                            title: "Are you sure?",
                            type: "warning",
                        },
                        function(isConfirm){
                            if (isConfirm) {
                                var children = [];

                                $.ajax({
                                    url: "https://socialclub.rockstargames.com/friends/GetReceivedInvitesJson",
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
                                        };

                                        swal({
                                            allowOutsideClick: true,
                                            text: "Something went wrong while trying to fetch the total amount of friend requests.",
                                            title: err.status+" - "+err.statusText,
                                            timer: 5000,
                                            type: "error",
                                        });
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

                                        if (data.Status == true && data.TotalCount > 0) {
                                            $('#sct-accfrd-progress-current').text(data.TotalCount);
                                            $('#sct-accfrd-progress-total').text(data.TotalCount);
                                            $('#sct-accfrd-progress').show();

                                            data.RockstarAccounts.forEach(function(e) {
                                                children.push(e);
                                            });

                                            if (children.length == data.TotalCount) {
                                                AcceptFriend(children, true);
                                            };
                                        } else if (data.Status == true && data.TotalCount == 0) {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "There were no friend requests to accept.",
                                                title: "No friend requests",
                                                timer: 5000,
                                                type: "success",
                                            });
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "Something went wrong while trying to fetch friend request data.",
                                                title: "Something went wrong",
                                                timer: 5000,
                                                type: "error",
                                            });
                                        }
                                    }
                                });
                            } else {
                                return;
                            }
                        });
                    } catch (err) {
                        console.error("Error during #sct-accfrd.click():\n\n"+err.stack);
                        return;
                    }
                });

                if (!document.getElementById("sct-delfrd")) {
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-delfrd">delete friends</a>').prependTo('#page');
                } else {
                    $("#nt-daf").remove();
                    $('<a class="btn btnGold btnRounded sctb" href="#" id="sct-delfrd">delete friends</a>').prependTo('#page');
                    isReloaded = true;
                    if (debug) console.log("#sct-delfrd was already present.");
                }

                $("#sct-delfrd").click(function(e) {
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
                        function(isConfirm){
                            if (isConfirm) {
                                $.ajax({
                                    url: "https://socialclub.rockstargames.com/friends/GetFriendsAndInvitesSentJson?pageNumber=0&onlineService=sc&pendingInvitesOnly=false",
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
                                        };

                                        swal({
                                            allowOutsideClick: true,
                                            text: "Something went wrong while trying to fetch the total amount of friends.",
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

                                        if (data.Status == true && data.TotalCount > 0) {
                                            $('#sct-delfrd-progress-current').text(data.TotalCount);
                                            $('#sct-delfrd-progress-total').text(data.TotalCount);
                                            $('#sct-delfrd-retrieving').show();

                                            RetrieveAllFriends([]);
                                        } else if (data.Status == true && data.TotalCount == 0) {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "There were no friends to delete.",
                                                title: "No friends",
                                                timer: 5000,
                                                type: "success",
                                            });
                                        } else {
                                            swal({
                                                allowOutsideClick: true,
                                                text: "Something went wrong while trying to fetch friend data.",
                                                title: "Something went wrong",
                                                timer: 5000,
                                                type: "error",
                                            });
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

                function RetrieveAllMessageUsers(source, pageIndex) {
                    try {
                        if (pageIndex === undefined) pageIndex = 0;

                        setTimeout(function() {
                            $.ajax({
                                url: "https://socialclub.rockstargames.com/Message/GetConversationList?pageIndex="+pageIndex,
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
                                    };

                                    swal({
                                        allowOutsideClick: true,
                                        text: "Something went wrong while trying to fetch the conversation list.",
                                        title: err.status+" - "+err.statusText,
                                        timer: 5000,
                                        type: "error",
                                    });
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
                                    };

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
                        }, 1000)
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
                            };

                            $.ajax({
                                url: "https://socialclub.rockstargames.com/Message/GetMessages?rockstarId="+item.RockstarId,
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
                                    };

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
                                    };

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
                            };

                            $.ajax({
                                url: "https://socialclub.rockstargames.com/Message/DeleteMessage",
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
                                    };

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
                                    };

                                    if (data.Status == true) {
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
                                        if (item.ScNickname != undefined) {
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

                function RetrieveAllFriends(source, pageIndex) {
                    try {
                        if (pageIndex === undefined) pageIndex = 0;

                        setTimeout(function() {
                            $.ajax({
                                url: "https://socialclub.rockstargames.com/friends/GetFriendsAndInvitesSentJson?pageNumber="+pageIndex+"&onlineService=sc&pendingInvitesOnly=false",
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
                                    };

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
                                    };

                                    if (data.Status == true) {
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
                                    }

                                    if (source.length < data.TotalCount) {
                                        RetrieveAllFriends(source, (pageIndex + 1));
                                    } else {
                                        if (debug) console.log("RetrieveAllFriends() complete.");

                                        $('#sct-delfrd-retrieving').hide();
                                        $('#sct-delfrd-progress').show();

                                        RemoveFriend(source);
                                    }
                                }
                            });
                        }, 1000);
                    } catch (err) {
                        console.error("Error during RetrieveAllFriends():\n\n"+err.stack);
                        return;
                    }
                }

                function RemoveFriend(source, isFriendRequestLoop) {
                    try {
                        if (isFriendRequestLoop === undefined) isFriendRequestLoop = false;

                        setTimeout(function() {
                            var item = source.pop();
                            if (item === undefined) {
                                if (debug) console.log("RemoveFriend() SKIP undefined");
                                RemoveFriend(source, isFriendRequestLoop);
                                return;
                            }
/*NEW STUFF: droplist filter*/  if (isDL() && isOnDroplist(item.Name)) {
                                    console.log('Skipped removing '+item.Name+' - There is a droplist and they are on it.');
                                    if (source.length > 0)
                                        RemoveFriend(source, isFriendRequestLoop);
                                    else if (isFriendRequestLoop)
                                        swal({
                                            allowOutsideClick: true,
                                            text: "All friend requests you received from non-dropees should have been rejected.\n\n"+
                                                  "You can see exactly which friends have been removed and which ones haven't by opening the console (F12).",
                                            title: "Friend requests rejected",
                                            timer: 5000,
                                            type: "success",
                                        });
                                    else swal({
                                            allowOutsideClick: true,
                                            text: "All non-dropee friends should have been removed.\n\n"+
                                                  "You can see exactly which friends have been removed and which ones haven't by opening the console (F12).",
                                            title: "Friends removed",
                                            timer: 5000,
                                            type: "success",
                                        });
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
                                    url: "https://socialclub.rockstargames.com/friends/UpdateFriend",
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
                                        };

                                        console.error("Your friend " + item.Name + " could not be removed. ("+err.status+" - "+err.statusText+")");

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-rejreq-progress-current').text(source.length);
                                            } else {
                                                $('#sct-delfrd-progress-current').text(source.length);
                                            }

                                            RemoveFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
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

                                            RemoveFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
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
                                        };

                                        return xhr;
                                    }
                                });
                            } else if (item.AllowCancel === true) {
                                $.ajax({
                                    url: "https://socialclub.rockstargames.com/friends/UpdateFriend",
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
                                        };

                                        console.error("The friend request you sent to " + item.Name + " could not be cancelled. ("+err.status+" - "+err.statusText+")");

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-rejreq-progress-current').text(source.length);
                                            } else {
                                                $('#sct-delfrd-progress-current').text(source.length);
                                            }

                                            RemoveFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
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

                                            RemoveFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
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
                                        };

                                        return xhr;
                                    }
                                });
                            } else if (item.AllowAdd === true) {
                                $.ajax({
                                    url: "https://socialclub.rockstargames.com/friends/UpdateFriend",
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
                                        };

                                        console.error("The friend request you received from " + item.Name + " could not be rejected. ("+err.status+" - "+err.statusText+")");

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-rejreq-progress-current').text(source.length);
                                            } else {
                                                $('#sct-delfrd-progress-current').text(source.length);
                                            }

                                            RemoveFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
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

                                            RemoveFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received should have been rejected.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests rejected",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends should have been removed.\n\n"+
                                                          "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friends removed",
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

                                    RemoveFriend(source);
                                } else {
                                    if (isFriendRequestLoop) {
                                        swal({
                                            allowOutsideClick: true,
                                            text: "All friend requests you received should have been rejected.\n\n"+
                                                  "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                  " To view the changes to your friends list, please refresh the page.",
                                            title: "Friend requests rejected",
                                            timer: 5000,
                                            type: "success",
                                        });
                                    } else {
                                        swal({
                                            allowOutsideClick: true,
                                            text: "All your friends should have been removed.\n\n"+
                                                  "You can see exactly which friends have been removed and which ones haven't by opening the console (F12)."+
                                                  " To view the changes to your friends list, please refresh the page.",
                                            title: "Friends removed",
                                            timer: 5000,
                                            type: "success",
                                        });
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
                                url: "https://socialclub.rockstargames.com/friends/GetBlockedJson",
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
                                    };

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
                                    };

                                    if (data.Status == true) {
                                        data.RockstarAccounts.forEach(function(e){
                                            if (e !== undefined) target.push(e);
                                        });

                                        var obj = target.filter(function(obj) {
                                            return obj.Name.trim().toLowerCase() === source.Nickname.trim().toLowerCase();
                                        })[0];

                                        if (obj == undefined) {
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
                            url: "https://socialclub.rockstargames.com/friends/UpdateFriend",
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
                                };

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
                                };

                                if (data.Status == true) {
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

//NEW STUFF
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
                            };
                            
/*NEW STUFF: droplist filter*/  if (isDL() && !isOnDroplist(item.Name)) {
                                    console.log('Skipped accepting '+item.Name+' - There is a droplist and they are not on it.');
                                    if (source.length > 0)
                                        AcceptFriend(source, isFriendRequestLoop);
                                    else swal({
                                            allowOutsideClick: true,
                                            text: "All friend requests you received from dropees should have been accepted.\n\n"+
                                                  "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                                  " To view the changes to your friends list, please refresh the page.",
                                            title: "Friend requests accepted",
                                            timer: 2000,
                                            type: "success",
                                        });
                                    return;
                                }

                                if (debug) console.log('Making request: {"id":'+item.RockstarId+',"op":"confirm","custommessage":"","accept":"true"}');//  }');//
                                $.ajax({
                                    url: "https://socialclub.rockstargames.com/friends/UpdateFriend",
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
                                        };

                                        console.error("The friend request you received from " + item.Name + " could not be accepted. ("+err.status+" - "+err.statusText+")");

                                        if (source.length > 0) {
                                            if (isFriendRequestLoop) {
                                                $('#sct-accfrd-progress-current').text(source.length);
                                            }

                                            AcceptFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received should have been accepted.\n\n"+
                                                          "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests accepted",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends should have been added.\n\n"+
                                                          "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
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
                                                $('#sct-accfrd-progress-current').text(source.length);
                                            }

                                            AcceptFriend(source);
                                        } else {
                                            if (isFriendRequestLoop) {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All friend requests you received should have been accepted.\n\n"+
                                                          "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
                                                    title: "Friend requests accepted",
                                                    timer: 5000,
                                                    type: "success",
                                                });
                                            } else {
                                                swal({
                                                    allowOutsideClick: true,
                                                    text: "All your friends should have been added.\n\n"+
                                                          "You can see exactly which friends have been added and which ones haven't by opening the console (F12)."+
                                                          " To view the changes to your friends list, please refresh the page.",
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
                                url: "https://socialclub.rockstargames.com/reference/remove_activity/"+item.activityId+"/92155523/FRIEND/34708577",
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
                                            $('#nt-accfrd-progress-current').text(source.length);
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



                console.info("The Social Club tool was "+(isReloaded ? "re" : "")+"loaded successfully.");
            } /*else {
                swal({
                    allowOutsideClick: true,
                    text: "The Social Club tool requires you to log in to be able to apply changes to your account. Please log into the account you want to use with the Social Club tool, then click the bookmark again.",
                    title: "Log in required",
                    type: "warning"
                });
            }*/
        } catch (err) {
            console.error("Uncaught exception:\n\n"+err.stack);
            return;
        }
	}, 1000);
}

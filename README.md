# SC-Tools

*What's this?* It's a script adding tools to accept/reject friend requests, delete friends, and more. If you choose to provide a list of people you're dropping, it will be smart in keeping uninvited guests out and accepting your dropees quickly.

### First and foremost
You need to install an extension that allows you to use userscripts. They're widely available:
* Chrome: [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=chrome) or [NinjaKit](https://chrome.google.com/webstore/detail/gpbepnljaakggeobkclonlkhbdgccfek)
* Firefox: [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
* Edge: [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=edge) 
* Safari: [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=safari) or [NinjaKit](http://ss-o.net/safari/extension/NinjaKit.safariextz)
* Opera: [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=opera) or [Violent Monkey](https://addons.opera.com/en/extensions/details/violent-monkey/)
* Dolphin: [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=dolphin)
* UC Browser: [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=ucweb)

If you're using some other obsolete browser, I don't feel bad for you ¯\\_(ツ)_/¯

### Installation
Just click [here](https://github.com/CAC27/SC-Tools/raw/master/SC-Tools.user.js) and you should be directed to an install page.

Or, if you don't trust me enough for that, find `SC-Tools.user.js` in this repository and click `Raw`.

### About stats
* Yellow question marks mean stats are hidden by the player.
* Orange question marks mean that: Either
  * A. The request failed due to rate limits.
  * B. That user was banned/reset to rank 0.
* Money amount *(which includes bank + wallet)* will automatically turn red if it's >300m.

### More info
* Looped requests (accept *all*, delete *all*, etc.) are done once per second because rate limits.
* After accepting friends from the droplist, it's advisable to reload stats as many players set their privacy settings to only share stats with friends.

### Features
##### When no droplist is active:
Button | Function
-------|---------
'Delete friends' | Unfriends everyone on your friends list.
'Accept requests' | Accepts all friend requests you have received.
'Reject requests' | Rejects all friend requests you have received.
'Quick-add user' | Searches for a username, sends them a friend request, and accepts the confirmation all with one click.
'Delete messages' | Deletes all messages, sent and received, from your inbox.

##### When a droplist is active:
Button | Function
-------|---------
'Delete non-dropees' | Remove everyone from your friends list that is __not__ on your droplist.
'Accept dropees' | Accepts all friend requests you have received from people that __are__ on your droplist.
'Reject non-dropees' | Rejects all friend requests you have received from people that are __not__ on your droplist.

### Troubleshooting
* 'Reload stats' will probably only work for the first 15 or so dropees, for now you might have to reload the others manually.
* If you're having trouble with 'Delete all messages', just run it a couple times and it'll delete all of them at some point.

### Credits
* Big shoutout to [Nadermane](https://github.com/Nadermane) for making the base for this project.
* Respect to those in [GTAGivers](https://discord.gg/gtagivers) for fighting the tyranny of Cuckstar one dollar at a time. This is for you to enjoy. :v:

# SC-Tools

*What's this?* It's a script adding tools to accept/reject friend requests, delete friends, and more. If you choose to provide a list of people you're dropping, it will be smart in keeping uninvited guests out and accepting your dropees quickly.

### First and foremost
You need to install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Chrome or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) for Firefox.
If you're using IE, Edge, Safari, or some other obsolete browser, I don't feel bad for you ¯\\_(ツ)_/¯

### Installation
Soon™

### Features
##### First, some notes:
Looped requests (i.e. accepting multiple requests) are done once per second because of rate limits.

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
If you're having trouble with 'Delete all messages', just run it a couple times and it'll delete all of them at some point.

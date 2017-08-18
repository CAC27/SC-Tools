# SC-Tools

*What's this?* It's a script adding tools to the [Social Club website](https://socialclub.rockstargames.com/) for accepting/rejecting friend requests, deleting friends, and more. If you choose to provide a list of people you're dropping, it will be smart in keeping uninvited guests out and accepting your dropees quickly.

__Unfortunately it only works on Chrome afaik, but feel free to test it using other browsers.__

### Installation
First install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=chrome). It's a userscript manager with some security features built-in.

Then click [here](https://github.com/CAC27/SC-Tools/raw/master/SC-Tools.user.js) or find `SC-Tools.user.js` in this repository and click `Raw`.

### What does this button do?
##### When no droplist is active:
Button | Function
-------|---------
Delete friends | Unfriends everyone on your friends list.
Accept requests | Accepts all friend requests you have received.
Reject requests | Rejects all friend requests you have received.
Quick-add user | Searches for a username, sends them a friend request, and accepts the confirmation all with one click.
Delete messages | Deletes all messages, sent and received, from your inbox.
##### When a droplist is active:
Button | Function
-------|---------
Delete non-dropees | Remove everyone from your friends list that is __not__ on your droplist.
Accept dropees | Accepts all friend requests you have received from people that __are__ on your droplist.
Reject non-dropees | Rejects all friend requests you have received from people that are __not__ on your droplist.
Delete dropees | Remove all friends / reject all requests from dropees. Useful if you only have one account.

##### General info
* Unfortunatly, friends (on your droplist) will no longer auto-refresh for now (except when you add new users. But that's what the `Refresh Friends` button is there for :stuck_out_tongue:
* `Auto-accept` works the same way as the normal accept button: accepts dropees if you have a droplist or all requests if you don't.
* Looped requests (accept *all*, delete *all*, etc.) are done once per second because rate limits.
* After accepting friends from the droplist, it's advisable to reload stats as many players set their privacy settings to only share stats with friends.
* All buttons can be enabled or disabled from the settings menu (see below.)

### Droplist info
* Names: 
  * Orange name = the name is fake because it does not match Rockstar's naming rules.
  * Yellow name = the account does not exist OR they have no relationship with you.
  * Blue name = user is your friend.
  * Green name = request pending (sent or received.)
  * Purple name = you've added yourself to the droplist.
  * Red name = user is blocked.
* Icons:
  * **`🗑`** = delete from droplist
  * Gray **`↻`** = refresh stats
  * Blue **`↻`** = refresh stats for the next 12 dropees
  * Green **`👤+`** = send a friend request
  * Red **`👤-`** = remove friend
  * Yellow **`👤-`** = cancel friend request
  * Yellow **`👤+`**/**`-`** = accept/reject friend request, respectively
  * Red `🚫` = Block user
  * Yellow `🚫` = Unblock user
* Stats:
  * Yellow question marks mean stats are hidden by the player.
  * Orange question marks mean that: Either
    * A. The request failed due to rate limits.
    * B. That user was banned/reset to rank 0.
  * Money amount *(which includes bank + wallet)* will automatically turn red if it's >500m.
  * If you've defined a personal limit, money amount will turn orange if said amount exceeds said limit.

### Settings
There is now a full-featured settings menu! This allows you to toggle a few options as well as fully customize which buttons appear on the top of the page. Just head over to the account settings menu and you'll see a brand-new option. ![Image of account settings](https://i.imgur.com/mF6yL5S.png)

### Troubleshooting
* Friend requests may not display properly on the droplist 100% of the time. Two things to do to fix it:
  * Wait at least 10 seconds *(R\* servers can be delayed sometimes)*
  * Try using Ctrl+F5 or Shift+F5 to clear the cache.
* To set a personal limit, you must uncheck the box, change the number, then check it again.
* If you're having trouble with `Delete all messages`, just run it a couple times and it'll delete all of them eventually.

### Credits
* Big shoutout to [Nadermane](https://github.com/Nadermane) for making the base for this project.
* Respect to those in [GTAGivers](https://discord.gg/gtagivers) for fighting the tyranny of Cuckstar one dollar at a time. This is for you to enjoy. :v:

# horde-bot
The Horde's Hero Wars Discord Bot


# TODO
## Most important
* Ability to add other people's reward times
* Name lookup for reward times to avoid the `invalid_user` issue
* Ability to remove people from award times
* Ability to look up a hero's specific stat priority - `!hero-stat-priority andvari`
* Better help, especially for more complex commands
* Documentation on how to set up a discord app/bot and add it to your server
* User friendly way for adding scores.
* War assignments
    * Limited to only certain role
    * Channel specific so war and xwar assignments don't get mixed up and so multiple teams can run on one discord with separate channels
    * allow for assigning, updating assignments, removing assignments
    * Store for future reference? Something like `!assignments show 2020-05-06` to allow a peek at what you did on that day?
        * Alternatively just clear the slate just before war begins each day
    * Allow everyone to be able to ask for their assignments
    * Show all assignments
* Commands for helpful info in [this sheet](https://docs.google.com/spreadsheets/d/1yKuUZNk8SpnZ4dMhoDKz8r6OjXDAvD-3y17yyNP39_g/edit#gid=1154313169) such as titan upgrade costs, etc
* Scheduled reminders
    * Would it be good to allow more than just sending a message as cron tasks?  
    * `!remind` command that would let you set a reminder for yourself or someone else.

## Future awesomeness
* Translation - ideally flag-reactions trigger translated message sent to user

## Things I keep wanting to do but remind myself they're overly complex
* More ways of combining searches in `rewards` command

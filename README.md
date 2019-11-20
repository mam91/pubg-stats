# pubg-stats
Periodically uploads player match stats to discord via webook

Pulls users from a mongo db and then monitors for new matches played.  Any new matches played are recorded and uploaded to discord via webhook.

*Note: Discord has a character limit for data sent via webhook.  The stats are split up into multiple messages if necessary.*

# Sample output
![alt text](https://raw.githubusercontent.com/mam91/pubg-stats/master/example.png)

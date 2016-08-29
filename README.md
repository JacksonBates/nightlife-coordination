= Nightlife Coordination App

== Routes

**GET /**
  + Shows splash page and search form
  + Links to:
    + POST /login
    + POST /search
    + POST /logout

**GET /login**
  + Logs user in via Twitter account (can I read their friend list off the Twitter API? Is that desireable?)
  + POSTs to /login

**GET /logout**
  + Logs out, unauthenticated users cannot see numbers of people attending locations

**GET /bars**
  + Shows bar information with a name, picture description and number of app users intereste in attending.
  + Links to each bars web-page / YELP entry
  + POST to /going

**POST /search**
  + Handles API request and delivers resulst to GET /bar view

**POST /login**
  + Handles auth

**POST /logout**
  +Handles auth

**POST /going** (maybe 'interested'?)
  + Handles DB query that increments individual bar's going count and tracks with users are 'going'

**POST /not-going** (maybe this can be handled in post/going logic)
  + As above

**GET /not-found**
  + Standard 404 page
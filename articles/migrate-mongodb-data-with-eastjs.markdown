Title: Migrate mongodb data with east.js
Author: Oleg Korobenko
Date: Mon Mar 31 2014 23:24:29 GMT+0400 (MSK)
Node: v0.10.26


Data migration is a process of actualizing existing data to code changes. E.g.
when you decide to change field format you need to change the code of your
application and also you should somehow migrate already existing databases at
production and development deployments(ci server, local application instances of
your team mates, etc).

[east.js] is node.js database migration tool for
different databases (extensible via adapters) which provides solution
for this problem.


## How does it work

[east.js] consists from two parts `east` cli program and database adapter for
specific database (e.g. mongodb, sqlite, mysql, etc). In our case we will use
[east-mongo] to migrate mongodb database instances.

`east` cli program saves all migration files in the file system. Executed
migration names will be stored by `east` inside target database via [east-mongo]
(at `_migrations` collection). When we will migrate database `east` will know
which migrations is new for database (and should be executed) and which is already
executed.

Migration file it's just regular node.js module with connection to the target database.
Module must export `migrate(client, done)` function, `client` it's a connection
to the database plus some helpers and `done` it's a function which should called
(only once) when migration is done. If error is occurred it should be passed to
`done` as first argument. Module also can export `rollback(client, done)`
function which is optional and not required by main workflow.

[east.js] imply following workflow when you need to change something in database

* modify application code
* write migration for the existing data according to the code changes
* commit code changes and migration files to the source control system
(single commit)
* pull code and migration files from source control system to any other
deployment(ci server, production instance, machine of another developer, etc)
and run `east migrate`.

*Each deployment should have `east` installed globally or locally via
`devDependencies` (but then you should replace `east` with
`./node_modules/.bin/east` call everywhere in the usage example below).*

Using this simple flow you can reach the goal - code and database which
correspond to each other.


## Usage sample

Consider sample [express] + [mongoose] app which creates and returns users.

Create new directory for our project and put following files into it

<migrate-mongodb-data-with-eastjs/package.json>

<migrate-mongodb-data-with-eastjs/db.js>

<migrate-mongodb-data-with-eastjs/app.js>


install dependencies via

	npm install

and run the server

	node app.js

create some user

	curl -X POST -d 'name=bob&email=bob@example.com' 'http://127.0.0.1:3000/users'

returns

	{
	  "__v": 0,
	  "name": "bob",
	  "email": "bob@example.com",
	  "_id": "5337f528f31e857f13b8aeea"
	}

and another one

	curl -X POST -d 'name=rob&email=rob@example.com' 'http://127.0.0.1:3000/users'

returns

	{
	  "__v": 0,
	  "name": "rob",
	  "email": "rob@example.com",
	  "_id": "5337f52df31e857f13b8aeeb"
	}

First version of application is done (it consists from `package.json`, `app.js`,
`db.js`). It could be deployed on other hosts (e.g. via source control system).

Assume that later we decided to move `email` field to `contacts.email` and
add optional field `contacts.phone`. So we need to change our user model at
`db.js`

<migrate-mongodb-data-with-eastjs/modifications.js#db user model>

and creation code at `app.js`

<migrate-mongodb-data-with-eastjs/modifications.js#app create user>

stop and start server with modified code

	node app.js

now we can create new users with `phone` and `email` which will
be stored in `contacts`

	curl -X POST -d 'name=robi&email=robi@example.com&phone=1732-757-2923' 'http://127.0.0.1:3000/users'

returns

	{
	  "__v": 0,
	  "name": "robi",
	  "_id": "5337f6296d4efffb13a56008",
	  "contacts": {
	    "email": "robi@example.com",
	    "phone": "1732-757-2923"
	  }
	}

as we can see user was added in a new format. But users which were added earlier
remained in old format. Let's eliminate that inconsistency using [east.js].

install east

	npm install east -g

initialize east at project root (will create `migrations` directory)

	east init

create `.eastrc` file with content (`url` the same as in `db.js` at
`mongoose.connect` call)

	{
	    "adapter": "node_modules/east-mongo",
	    "url": "mongodb://localhost/east-sample-db"
	}

create migration which will move `email` to `contacts.email`

	east create moveEmailToContacts

open and edit created `migrations/1_moveEmailToContacts.js` file

<migrate-mongodb-data-with-eastjs/1_moveEmailToContacts.js>

`client.db` is an instance of [mongodb native Db]
which is already connected to the database. So you can use full mongodb native
functionality to change your existing data according to code changes.

Run our migration with

	east migrate

produces

	target migrations:
		1_moveEmailToContacts
	migrate `1_moveEmailToContacts`
	migration done

list of users

	curl 'http://127.0.0.1:3000/users'

returns

	[
	  {
	    "__v": 0,
	    "_id": "5337f52df31e857f13b8aeeb",
	    "name": "rob",
	    "contacts": {
	      "email": "rob@example.com"
	    }
	  },
	  {
	    "name": "robi",
	    "_id": "5337f6296d4efffb13a56008",
	    "__v": 0,
	    "contacts": {
	      "email": "robi@example.com",
	      "phone": "1732-757-2923"
	    }
	  },
	  {
	    "__v": 0,
	    "_id": "5337f528f31e857f13b8aeea",
	    "name": "bob",
	    "contacts": {
	      "email": "bob@example.com"
	    }
	  }
	]

the job is done - they all are in a new format.

if we run `east migrate` again nothing will happen with
our db, because all migrations already executed for current database.

we can roll our migrations back with

	east rollback

produces

	target migrations:
		1_moveEmailToContacts
	rollback `1_moveEmailToContacts`
	migration successfully rolled back

we also can `migrate`/`rollback` specified (by number, base name, full name or
path) migration e.g.

	east migrate 1

`migrate` command supports `--force` flag which can execute already executed
migration. It's useful for testing during migration creation.

Second version of application is done(it consists from `package.json`, `app.js`,
`db.js`, `.eastrc`, `migrations/1_moveEmailToContacts.js`) and it could be
deployed to update first version or for the fresh install. After `east migrate`
(on another host) database will be updated according to the current code state.


## Writing migrations using application database access

Since migration files it's just regular node.js modules we can use same access
to db as from application (via `db.js` in our case) instead of database access
provided by adapter. Let's create migration which will add some test users
using `db.js`

	east create addingTestUsers

open and edit created `migrations/2_addingTestUsers.js` file

<migrate-mongodb-data-with-eastjs/2_addingTestUsers.js>

You can also use your favorite control flow module ([step], [twostep], [async],
etc) for simplifying migrations creation.


## Conclusion

That's it. It was example of basic usage with mongodb you can find examples of
other commands, existing adapters and more on [east.js project page][east.js].


[east.js]: https://github.com/okv/east
[east-mongo]: https://github.com/okv/east-mongo
[express]: https://github.com/visionmedia/express
[mongoose]: https://github.com/LearnBoost/mongoose
[step]: https://github.com/creationix/step
[twostep]: https://github.com/2do2go/node-twostep
[async]: https://github.com/caolan/async
[mongodb native Db]: http://mongodb.github.io/node-mongodb-native/api-generated/db.html

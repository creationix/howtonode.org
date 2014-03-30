Title: Migrate mongodb data with east.js
Author: Oleg Korobenko
Date: Sun Mar 30 2014 15:28:58 GMT+0400 (MSK)
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

*NOTE 1: in the example below two versions (initial application version and
version with changed data model) of application will be used instead of two commits
in source control system.*

Create new directory for our project and put following files into it

<migrate-mongodb-data-with-eastjs/package.json>

<migrate-mongodb-data-with-eastjs/db.js>

<migrate-mongodb-data-with-eastjs/app.js>


install dependencies via

	npm install

and run server after installation

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

*NOTE 2: code created and it works, now (in a real project) you should commit
your changes to the source control system.*

Assume that later we decided to move `email` field to `contacts.email` and
add optional field `contacts.phone`. So we need to change our user model

<migrate-mongodb-data-with-eastjs/db-v2.js#user model>

and creation code at `app.js`

<migrate-mongodb-data-with-eastjs/app-v2.js#create user>

stop the server and run it modified version

	node app-v2.js

now we can create new users (via our app) with `phone` and `email` which will
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

But users which were added earlier remained in old format.
Let's eliminate that inconsistency using [east.js].

install east

	npm install east -g

initialize east at project root (will create `migrations` directory)

	east init

create `.eastrc` file with content (same `url` as at `db.js` passed to `mongoose.connect`)

	{
	    "adapter": "node_modules/east-mongo",
	    "url": "mongodb://localhost/east-sample-db"
	}

create migration which will move `email` to `contacts.email`

	east create moveEmailToContacts

open and edit created `migrations/1_moveEmailToContacts.js` file


	exports.migrate = function(client, done) {
		var db = client.db;
		db.collection('users').update({}, {
			$rename: {email: 'contacts.email'}
		}, {multi: true}, done);
	};

	exports.rollback = function(client, done) {
		var db = client.db;
		db.collection('users').update({}, {
			$rename: {'contacts.email': 'email'}
		}, {multi: true}, done);
	};


`client.db` is an instance of [mongodb native Db]
which is already connected to the database. So you can use full mongodb native
functionality to change your existing data according to code changes.


Since migration files it's just regular node.js modules you can use same access
to db as from application (via `db.js` in our case). Let's create migration
which will add some test users using `db.js`

	east create addingTestUsers

open and edit created `migrations/2_addingTestUsers.js` file

	var db = require('../db-v2');

	var usersData = [{
		name: 'user',
		contacts: {email: 'user@example.com'}
	}, {
		name: 'admin',
		contacts: {email: 'admin@example.com'}
	}];

	exports.migrate = function(client, done) {
		db.connect();
		var saved = 0;
		usersData.forEach(function(userData) {
			var user = new db.User(userData);
			user.save(function(err) {
				if (err) return done(err);
				saved++;
				if (saved === usersData.length) {
					db.disconnect();
					done();
				}
			});
		});
	};

	exports.rollback = function(client, done) {
		db.connect();
		db.User.remove({name: {'$in': usersData.map(function(userData) {
			return userData.name;
		})}}, function() {
			db.disconnect();
			done();
		});
	};

You can also use your favorite control flow module ([step], [twostep], [async],
etc) for simplifying migrations creation.

Now we can run our migrations

	east migrate

it will produce

	target migrations:
		1_moveEmailToContacts
		2_addingTestUsers
	migrate `1_moveEmailToContacts`
	migration done
	migrate `2_addingTestUsers`
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
	  },
	  {
	    "name": "user",
	    "_id": "5337f64e1ed25a0d14f77db5",
	    "__v": 0,
	    "contacts": {
	      "email": "user@example.com"
	    }
	  },
	  {
	    "name": "admin",
	    "_id": "5337f64e1ed25a0d14f77db6",
	    "__v": 0,
	    "contacts": {
	      "email": "admin@example.com"
	    }
	  }
	]

as we can see all users stores in new format.

*NOTE 3: code changed and it works, migrations crated and also work so now
(in a real project) you should commit your changes (`db.js`, `app.js`, `.eastrc`
and `migrations` directory) to the source control system.*

Now we can pull (via source control system) our changes and migrations to
another deployment run `east migrate` and it will update databse.

if we run `east migrate` again (on the same deployment) nothing will happen with
our db, because all migrations already executed for current database.

we can roll our migrations back with

	east rollback

it will produce

	target migrations:
		2_addingTestUsers
		1_moveEmailToContacts
	rollback `2_addingTestUsers`
	migration successfully rolled back
	rollback `1_moveEmailToContacts`
	migration successfully rolled back

we also can `migrate`/`rollback` specified (by number, base name, full name or
path) migration e.g.

	east migrate 1

`migrate` command supports `--force` flag which can execute already executed
migration. It's useful for testing during migration creation.

to see all comands run

	east --help

or `east <command> --help` to see command details e.g.

	east migrate --help

see other command examples, existing adapters and more on [east.js project page][east.js]

[east.js]: https://github.com/okv/east
[east-mongo]: https://github.com/okv/east-mongo
[express]: https://github.com/visionmedia/express
[mongoose]: https://github.com/LearnBoost/mongoose
[step]: https://github.com/creationix/step
[twostep]: https://github.com/2do2go/node-twostep
[async]: https://github.com/caolan/async
[mongodb native Db]: http://mongodb.github.io/node-mongodb-native/api-generated/db.html

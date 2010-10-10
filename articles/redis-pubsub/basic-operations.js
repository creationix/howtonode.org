db.set("foo", 1)
db.get("foo", function(err, value) { sys.puts(value); });
db.randomkey(function(err, key) { sys.puts(key); });
db.hset("bar", "hi", "world");
db.hget("bar", "hi", function(err, value) { sys.puts(value); });
db.hgetall("bar", function(err, data) { sys.puts(data["hi"]); });
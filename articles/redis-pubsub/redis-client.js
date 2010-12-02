var db = redis.createClient(9281, 'goosefish.redistogo.com');
var dbAuth = function() { db.auth('dc64f7b818f4e3ec2e3d3d033e3e5ff4'); }
db.addListener('connected', dbAuth);
db.addListener('reconnected', dbAuth);
dbAuth();
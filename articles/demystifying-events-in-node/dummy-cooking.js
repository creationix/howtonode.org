Dummy.prototype.cooking = function(chicken) {
    var self = this;
    self.chicken = chicken;
    self.cook = cook(); // assume dummy function that'll do the cooking
    self.cook(chicken, function(cooked_chicken) {
        self.chicken = cooked_chicken;
        self.emit('cooked', self.chicken);
    });

    return self;
}
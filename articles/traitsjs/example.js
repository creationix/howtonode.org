var Trait = require('traits').Trait;
var print = require('sys').print;

var TEquality = Trait({
   equals: Trait.required,
  differs: function(x) { return !this.equals(x); }
});

var TMagnitude = Trait.compose(TEquality, Trait({
  smaller: Trait.required,
  greater: function(x) { return !this.smaller(x) && this.differs(x) },
  between: function(min, max) {
    return min.smaller(this) && this.smaller(max);
  }
}));

function TColor(rgb) {
  return Trait.compose(TEquality, Trait({
    get rgb() { return rgb; },
    equals: function(col) { return col.rgb.equals(this.rgb); }
  }));
}

function TCircle(center, radius, rgb) {
  return Trait.compose(
    TMagnitude,
    TEquality,
    Trait.resolve({ equals: 'equalColors' }, TColor(rgb)),
    Trait({
       center: center,
       radius: radius,
         area: function() { return Math.PI * this.radius * this.radius; },
       equals: function(c) { return c.center === this.center &&
                                    r.radius === this.radius },
      smaller: function(c) { return this.radius < c.radius }
  }));
}

function Circle(center, radius, rgb) {
  return Trait.create(Object.prototype,
                      TCircle(center, radius, rgb));
}

function test() {
  var red = {
    equals: function(o){ return ''+o === this.toString(); },
    toString:function(){return 'red';}};
  var c1 = Circle(0, 1, red);
  var c2 = Circle(1, 2, red);
  print('c1.area: ' + c1.area());
  print('\nc1 < c2? ' + c1.smaller(c2));
  print('\nc1 !== c2?' + c1.differs(c2));
  print('\nc1 equalColors c2? '+c1.equalColors(c2));
}
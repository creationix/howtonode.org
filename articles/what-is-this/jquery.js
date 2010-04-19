//cart
Cart = {
  items: [1,4,2],
  onClick: function () {
    // Do something with this.items.
  }
}
$("#mybutton").click(Cart.onClick);

//bad
$("#mybutton").click(function () { Cart.onClick() });

//better
$("#mybutton").click(function () { return Cart.onClick.apply(Cart, arguments) });

//bind
function bind(fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  }
}
Cart.onClick = bind(Cart.onClick, Cart);
$("#mybutton").click(Cart.onClick);


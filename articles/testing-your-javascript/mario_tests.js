load("mario.js");

context("super mario",
  setup(function() {
    game = new SuperMarioGame();
  }),

  context("enemy interaction",
    setup(function() {
      turtle = game.addTurtleEnemy({ x: 10, y: 0 });
    }),

    should("kill the turtle after jumping on it", function() {
      game.mario.jump({ x: 10, y: 0 });
      assert.equal("dead", turtle.state);
    }),

    should("end the game if mario walks into an enemy turtle", function() {
      game.mario.move({ x: 10, y: 0 });
      assert.equal("gameOver", game.state);
    })
  )
);

Tests.run();
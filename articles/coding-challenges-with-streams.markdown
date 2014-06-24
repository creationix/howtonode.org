Title: Solving Coding Challenges with Streams
Author: Chad Wyszynski
Date: Sun Jun 22 2014 16:33:52 GMT-0700 (PDT)
Node: v0.10.24

My first experience using Node.js for a programming challenge was agonizing. I devised a viable solution, but I couldn’t figure out an effective way to parse the input. The format was painfully simple: text piped via stdin. No problem, right? I burned over half my time on what should have been a minor detail, and I ended up with a fragile, zip-tie and duct tape hack that still makes me shudder.

The experience inspired me to find an idiomatic approach to programming challenges. After working through more problems, I arrived at a pattern I hope others will find useful.

## The pattern
The main idea is this: create a stream of problems, and transform each problem into a solution. The process consists of four steps:

 1. Break the input into a stream of lines.
 2. Transform these lines into problem-specific data structures.
 3. Solve the problems.
 4. Format the solutions for output.

For those familiar with streams, the pattern looks like this:

	var split = require("split"); // dominictarr’s helpful line-splitting module

	process.stdin
		.pipe(split()) // split input into lines
		.pipe(new ProblemStream()) // transform lines into problem data structures
		.pipe(new SolutionStream()) // solve each problem
		.pipe(new FormatStream()) // format the solutions for output
		.pipe(process.stdout); // write solution to stdout


## Our problem
To keep this tutorial grounded, let's solve a [Google Code Jam challenge](https://code.google.com/codejam/contest/2929486/dashboard). The problem asks us to verify solutions to [sudoku puzzles](http://en.wikipedia.org/wiki/Sudoku). The input looks like this:

	2                  // number of puzzles to verify
	3                  // dimensions of first puzzle (3 * 3 = 9)
	7 6 5 1 9 8 4 3 2  // first puzzle
	8 1 9 2 4 3 5 7 6
	3 2 4 6 5 7 9 8 1
	1 9 8 4 3 2 7 6 5
	2 4 3 5 7 6 8 1 9
	6 5 7 9 8 1 3 2 4
	4 3 2 7 6 5 1 9 8
	5 7 6 8 1 9 2 4 3
	9 8 1 3 2 4 6 5 7
	3                  // dimensions of second puzzle
	7 9 5 1 3 8 4 6 2  // second puzzle
	2 1 3 5 4 6 8 7 9
	6 8 4 9 2 7 4 5 1
	1 3 8 4 6 2 7 9 5
	5 4 6 8 7 9 2 1 3
	9 2 7 3 5 1 6 8 4
	4 6 2 7 9 5 1 3 8
	8 7 9 2 1 3 5 4 6
	3 5 1 6 8 4 9 2 7

The format of our output should be:

	Case #1: Yes
	Case #2: No

where "Yes" means that the puzzle has been solved correctly.

Let's get started.

## Setup
Our first step is to retrieve the input from stdin. In Node, stdin is a readable stream. Essentially, a readable stream sends data as soon as that data can be read (for a more thorough explanation, check out the [readable stream docs](http://nodejs.org/api/stream.html#stream_class_stream_readable)). The code below will echo whatever's written to stdin:

	process.stdin.pipe(process.stdout);

The <code>pipe</code> method takes all data from a readable stream and writes it to a writable stream.

It may not be evident from this code, but <code>process.stdin</code> pipes data in large chunks of bytes; we’re interested in lines of text. To break these chunks into lines, we can pipe <code>process.stdin</code> into dominictarr’s handy <code>split</code> module.  <code>npm install split</code>, then:

	var split = require("split");

	process.stdin.setEncoding("utf8"); // convert bytes to utf8 characters

	process.stdin
		 .pipe(split())
		 .pipe(process.stdout);

## Creating problems with transform streams
Now that we have a sequence of lines, we're ready to begin the real work. We're going to transform these lines into a series of 2D arrays representing sudoku puzzles. Then, we'll pipe each puzzle into another stream that will check if it's solved.

Node core's transform streams provide exactly the abstraction we need. Unsurprisingly, a transform stream transforms data written to it and makes the result available as a readable stream. Confused? It'll become clearer as we continue.

To create a transform stream, inherit <code>stream.Transform</code> and invoke its constructor:

	var Transform = require("stream").Transform;
	var util = require("util");

	util.inherits(ProblemStream, Transform); // inherit Transform

	function ProblemStream () {
		Transform.call(this, { "objectMode": true }); // invoke Transform's constructor
	}

You'll notice we're passing the <code>objectMode</code> flag to the <code>Transform</code> constructor. Streams normally accept only strings and buffers. We'd like ours to output a 2D array, so we need to enable object mode.

Transform streams have two important methods <code>\_transform</code> and <code>\_flush</code>. <code>\_transform</code> is invoked whenever data is written to the stream. We’ll use this to transform a sequence of lines into a sudoku puzzle. <code>\_flush</code> is invoked when the transform stream has been notified that nothing else will be written to it. This function is helpful for completing any unfinished tasks.

Let's block in our transform function:

	ProblemStream.prototype._transform = function (line, encoding, processed) {
		 // TODO
	}

<code>\_transform</code> accepts three arguments. The first is the data written to the stream. In our case, it's a line of text. The second argument is the stream encoding, which we set to utf8. The final argument is a no argument callback used to signal that we've finished processing the input. 

There are two important things to keep in mind when implementing your <code>\_transform</code> function:

 1. Invoking the <code>processed</code> callback does not add anything to the output stream. It merely signals that we've finished processing the value passed to <code>\_transform</code>.
 2. To output a value, use <code>this.push(value)</code>.

With this in mind, let's return to the input.

	2
	3
	7 6 5 1 9 8 4 3 2
	8 1 9 2 4 3 5 7 6
	3 2 4 6 5 7 9 8 1
	1 9 8 4 3 2 7 6 5
	2 4 3 5 7 6 8 1 9
	6 5 7 9 8 1 3 2 4
	4 3 2 7 6 5 1 9 8
	5 7 6 8 1 9 2 4 3
	9 8 1 3 2 4 6 5 7
	3
	7 9 5 1 3 8 4 6 2
	2 1 3 5 4 6 8 7 9
	6 8 4 9 2 7 4 5 1
	1 3 8 4 6 2 7 9 5
	5 4 6 8 7 9 2 1 3
	9 2 7 3 5 1 6 8 4
	4 6 2 7 9 5 1 3 8
	8 7 9 2 1 3 5 4 6
	3 5 1 6 8 4 9 2 7

We immediately encounter a problem: our <code>\_transform</code> function is invoked once per line, but each of the first three lines has a different meaning. The first line describes the number of problems to solve, the second is how many lines constitute the next puzzle, and the next lines are the puzzle itself. Our stream needs to handle each of these lines differently.

Fortunately, we can store state in transform streams:

	var Transform = require("stream").Transform;
	var util = require("util");

	util.inherits(ProblemStream, Transform);

	function ProblemStream () {
		Transform.call(this, { "objectMode": true });

		this.numProblemsToSolve = null;
		this.puzzleSize = null;
		this.currentPuzzle = null;
	}

With these variables, we can track where we are in the sequence of lines.

	ProblemStream.prototype._transform = function (line, encoding, processed) {
		if (this.numProblemsToSolve === null) { // handle first line
			this.numProblemsToSolve = +line;
		}
		else if (this.puzzleSize === null) { // start a new puzzle
			this.puzzleSize = (+line) * (+line); // a size of 3 means the puzzle will be 9 lines long
			this.currentPuzzle = [];
		}
		else {
			var numbers = line.match(/\d+/g); // break line into an array of numbers
			this.currentPuzzle.push(numbers); // add a new row to the puzzle
			this.puzzleSize--; // decrement number of remaining lines to parse for puzzle

			if (this.puzzleSize === 0) {
				this.push(this.currentPuzzle); // we've parsed the full puzzle; add it to the output stream
				this.puzzleSize = null; // reset; ready for next puzzle
			}
		}
		processed(); // we're done processing the current line
	};

	process.stdin
		.pipe(split())
		.pipe(new ProblemStream())
		.pipe(new SolutionStream()) // TODO
		.pipe(new FormatStream()) // TODO
		.pipe(process.stdout); 

Take a moment to review the code. Remember, <code>\_transform</code> is called for each line. The first line <code>\_transform</code> receives corresponds to the number of problems to solve. Since <code>numProblemsToSolve</code> is null, that branch of the conditional will execute. The second line passed to <code>\_transform</code> is the size of the puzzle. We use that to set up the array that will contain our sudoku puzzle. Now that we know the size of the puzzle, the third line passed to <code>\_transform</code> starts the process of creating the data structure. Once the puzzle is built, we push the completed puzzle into the output end of the transform stream and prepare to create a new puzzle. This continues until we're out of lines to read.

## Solve all the problems!
Having parsed and created our sudoku puzzle data structure, we can finally being solving the problem. 

The task of "solving a problem" can be reformulated to "transforming a problem into a solution." That's exactly what our next stream will do.

As before, we'll inherit <code>stream.Transform</code> and enable object mode:

	util.inherits(SolutionStream, Transform);

	function SolutionStream () {
		Transform.call(this, { "objectMode": true });
	}

 Then, we'll define a <code>\_transform</code> method, which accepts a problem and produces a boolean:

	SolutionStream.prototype._transform = function (problem, encoding, processed) {
		var solution = solve(problem);
		this.push(solution);
		processed();

		function solve (problem) {
			// TODO
			return false;
		}
	};

	process.stdin
		.pipe(split())
		.pipe(new ProblemStream())
		.pipe(new SolutionStream())
		.pipe(new FormatStream()) // TODO
		.pipe(process.stdout);

Unlike the <code>ProblemStream</code>, this stream produces an output for each input; <code>\_transform</code> executes once for every problem, and we need to solve every problem.

All we need to do is write a function that determines whether or not a sudoku problem is solved. I leave that to you.

## Prettify the output
Now that we've solved the problem, our last step is to format the output. And, you guessed it, we'll use yet another transform stream. 

Our <code>FormatStream</code> accepts a solution and transforms it into a string to pipe to <code>process.stdout</code>

Remember the output format?

	Case #1: Yes
	Case #2: No

We need to track the problem number and transform the boolean solution into "Yes" or "No."

	util.inherits(FormatStream, Transform);
	function FormatStream () {
		Transform.call(this, { "objectMode": true });

		this.caseNumber = 0;
	}

	FormatStream.prototype._transform = function (solution, encoding, processed) {
		this.caseNumber++;

		var result = solution ? "Yes" : "No";

		var formatted = "Case #" + this.caseNumber + ": " + result + "\n";

		this.push(formatted);
		processed();
	};

Now, connect the <code>FormatStream</code> to our pipeline, and we're done:

	process.stdin
		.pipe(split())
		.pipe(new ProblemStream())
		.pipe(new SolutionStream())
		.pipe(new FormatStream())
		.pipe(process.stdout);

[Check out the complete code on GitHub](https://github.com/nimbus154/node-coding-challenge-pattern).

## One final note
The biggest win of using <code>pipe</code> is that you can reuse your code with any readable and writable stream. If your problem source is over the network, as in the DEF CON qualifier, replace <code>process.stdin</code> and <code>process.stdout</code> with network streams, and everything should "just work."

You'll need to tune this approach slightly for each problem, but I hope it provides a good starting point. 


Title: Learning Javascript with Object Graphs
Author: Tim Caswell
Date: Wed Sep 29 2010 13:19:12 GMT-0700 (PDT)
Node: v0.2.2

One of the secrets to being a super effective JavaScript developer is to truly understand the semantics of the language.  This article will explain the basic elemental parts of JavaScript using easy to follow diagrams.

## What exactly is a variable?

A variable in JavaScript is simply a label that references a value in memory somewhere.  These values can be primitives like strings, numbers, and booleans.  They can also be objects or functions.

### Local Variables

In the following example, we will create three local variables in the top-level scope and point them to some primitive values:

<object-graphs/variables.js*>
![variables](object-graphs/variables.dot)

Notice that the two boolean variables point to the same value in memory.  This is because primitives are immutable and so the VM can optimize and share a single instance for all references to that particular value.

In the code snippet we checked to see if the two references pointed to the same value using `===` and the result was `true`.

The orange box represents the outermost closure scope.  These variables are top-level local variables, not to be confused with properties of the global/window object.

<br style="clear:left"/>

### Objects

<object-graphs/objects.js*>
![shared-function](object-graphs/objects.dot)

<br style="clear:left"/>

### Global Variables

If you leave off the var statement from 


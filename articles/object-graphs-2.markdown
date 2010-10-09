Title: Learning Javascript with Object Graphs (Part II)
Author: Tim Caswell
Date: Wed Oct 06 2010 09:31:21 GMT-0700 (PDT)
Node: v0.2.3

The first article using graphs to describe JavaScript semantics was so popular that I've decided to try the technique with some more advanced ideas.  In this article I'll explain three common techniques for creating objects.  They are constructor with prototype, pure prototypal, and object factory.

My goal is that this will help people understand the strengths and weaknesses of each technique and understand what's really going on.

## Classical JavaScript Constructors

<object-graphs-2/classical.js#rectangle>

<object-graphs-2/classical.js#square>

<object-graphs-2/classical.js#test*>

![classical](object-graphs-2/classical.dot)

<br style="clear:left"/>

## Pure Prototypal Objects

<object-graphs-2/prototypal.js#rectangle>

<object-graphs-2/prototypal.js#square>

<object-graphs-2/prototypal.js#test*>

![classical](object-graphs-2/prototypal.dot)

<br style="clear:left"/>

## Object Factories

<object-graphs-2/factory.js#controller>

<object-graphs-2/factory.js#usage>

    // Output
    View now has 5
    View now has 6
    View now has 5
    Saving value 5 somewhere
    Now hiding view


![classical](object-graphs-2/factory.dot)

<br style="clear:left"/>

## Conclusion

There is so much more I want to explore, but I like to keep these articles somewhat short and bite-size.  If there is demand, I'll write a part three explaining how to do ruby-style mixins and other advanced topics.
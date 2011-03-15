Title: Is JavaScript Is Faster Than C?
Author: Geoff Flarity
Date: Sat, 5 Mar 2011 13:50:30 GMT 
Node: v0.4.2


There's been a lot great work happening in the VM performance space over the last few years. The problems of performance are beginning to be well understood as even dynamic languages begin to challenge the incumbents. This article reviews a project which aims to bring imperical testing to the Language/Runtime performance debate. Rather than argue about the theorectical, we can let the code speak for itself. You may me suprised by what it says.  

## Stop!

The author of this article is well aware of it's provocative nature. This is just one test and readers should take care when extrapolating results disimilar use cases. The C code provided by the project being reviewed follows an Object Oriented style. It is certainly possible to optimize the C code further, for instance by using a more procedural style with less memory allocation. But then a similar approach should be used by the other versions (languages) presented as well. I whole heartedly encourge you submit pull requests with these new versions in separate directories based on the style/technique used. 

The purpose of this article is to highlight the fact that server side JavaScript has become viable platform platform choice when performance is a consideration. That said, this is one test and I can only encourage more work in this area. If you're interested in such things, check out [The Computer Language Benchmarks Game](http://shootout.alioth.debian.org/). Let's discuss results rather than argue fanatically about predictions. 

## The Problem

<img src="/peg-performance/15-peg.jpg" style="float:none;" />

Solving 137846 games of the 15-Hole Peg Soltaire by calculating every possible move using an Object Oriented style. Solutions are provided in C, C#, Java, JavaScript, PHP, Python and Ruby (more submissions encouraged!). Most of the code was written by Jonathan Fuerth his presentation on Java/HotSpot performance. I've added a harness and updated the JavaScript so that it uses proper prototypical style . You can find my 'fork' on [github](https://github.com/gflarity/peg-performance).

## The Code

git://github.com/gflarity/peg-performance.git

## Pre-requisites

This was all developed and tested under OS X however there shouldn't be any platform dependencies. You'll need a number of things for the test itself. I've put the version I'm using in brackets: gcc( 4.2.1(, Mono (2.10.1), Java (1.6.0_24), node.js (0.4.2), PHP (5.3.3), Python (2.7.1), Ruby (1.8.7). 

## Run the tests!

Note this will take a few minutes as some platforms are definitely faster than others.

    cd src/main
    make test 


## Results

Results can be viewed by opening .reports/report.html

Here is the graph produced by this test on my MacBook Air:

## Analysis

Here are my thoughts, I'm sure you have your own. For this test at least:

1) HotSpot Java is F.A.S.T., FAST. I'd really like to see a C++ version for comparison in this test though, but given the ecosystem out there and the fact that its automatically cross platform, I'd have hard time justifying the use of C++ for many things these days... Well, maybe a kickass JavaScript engine ;)
2) You might not want to implement any C library that could be implemented in Java if you're going to use an object oriented style. 
3) Respect for the Mono project. While I'm sure Microsoft's .NET runtime approaches the HotSpot VM in terms of performance, Mono is still no slouch. 
4) JavaScript performance has come a LONG way. I wouldn't be surprised to see V8 approach and maybe even eclipse HotSpot's performance in the next 2 years. Despite all it's quirks, JavaScript is a dynamically typed language. We must consider it's performance vs a statically typed Java. Some would argue that static typing and having the compiler catch type bugs is 'safer'. Having developed numerous non-webservice projects using dynamic languages I can only disagree.  Typically I trade reduced performance for increased development effeciency when I choose Perl, Python or Groovy,. Despite it's quirks, JavaScript can offer the best of both worlds once you wrap your head around it. 





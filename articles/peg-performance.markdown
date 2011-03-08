Title: Is JavaScript Is Faster Than C?
Author: Geoff Flarity
Date: Sat, 5 Mar 2011 13:50:30 GMT 
Node: v0.4.2


There's been a lot great work happening in the VM performance space over the last few years. The problems of performance are beginning to be well understood as even dynamic languages begin to challenge the incumbents. This article reviews a project which aims to bring imperical testing to the Language/Runtime performance debate. Rather than argue about the theorectical, we can let the code speak for itself. You may me suprised by what it says.  


## Stop!

The author of this article is well aware of it's provocative nature. This is just one test and readers should take care when extrapolating results disimilar use cases. The C code provided by the project being reviewed follows an Object Oriented style. It is certainly possible to optimize the C code further, for instance by using a more procedural style with less memory allocation. But then a similar approach should be used by the other versions (languages) presented as well. I whole heartedly encourge you submit pull requests with these new versions in separate directories based on the style/technique used. 

The purpose of this article to highlight the fact that JavaScript has become a serious contender when performance is a consideration. That said, this is one test and I can only encourage more work in this area. If you're interested in such things, check out [The Computer Language Benchmarks Game](http://shootout.alioth.debian.org/). Let's discuss results rather than argue fanatically about theoretical predictions. 


## The Problem

<img src="/peg-performance/15-peg.jpg" style="float:none;" />

Solving 137846 games of the 15-Hole Peg Soltaire ?by calculating every possible move? using an Object Oriented style. Solutions are provided in C, C#, Java, JavaScript, PHP, Python and Ruby (more submissions encouraged!). Most of the code was written by Jonathan Fuerth his presentation on Java/HotSpot performance. I've added a harness and updated the JavaScript so that it uses proper prototypical style . You can find my 'fork' on [github](https://github.com/gflarity/peg-performance).


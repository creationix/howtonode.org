Title: Is JavaScript Is Faster Than C Now?
Author: Geoff Flarity
Date: Sat, 5 Mar 2011 13:50:30 GMT 
Node: v0.4.2


There's been a lot great happening in the VM performance space over the last few years. The problem of VM performance beginning to be well understood as even dynamic languages challenge the incumbents. This article reviews a project which aims to bring imperical testing to the Language/Runtime performance debate. Rather than argue about the theorectical, we can let the code speak for itself. You may me suprised by what it says.  


## Stop!

The author of this article is well aware of it's provocative nature. The C code provided by the project being reviewed follows an Object Oriented style. It is certainly possible to optimize this code further using a more procedural style with less memory allocation. But then this style of coding should be adapted to the other languages presented as well. Further more I'd argue that maintaining code written in this manner is difficult and expensive. Regardless, I whole heartedly encourge you submit pull requests with these new versions in separate directories based on the style/technique used. 

Let's discuss results rather than argue predictions. 

## The Problem

<img src="/peg-performance/15-peg.jpg" style="float:none;" />

Solving 10,000 games of the 15-Hole Peg Soltaire ?by calculating every possible move? using an Object Oriented style. Solutions are provided in C, C#, Java, JavaScript, PHP, Python and Ruby (more submissions encouraged!). Most of the code was written by Jonathan Fuerth his presentation on Java/HotSpot performance. I've added a harness and updated the JavaScript so that it uses proper prototypical style . You can find my 'fork' on [github](https://github.com/gflarity/peg-performance).


Title: Daddy, what's a stream?
Author: Tim Caswell
Date: Sat Apr 27 2013 20:33:31 GMT-0500 (CDT)
Node: v0.10.5


At dinner tonight, I was discussing that I've been thinking about streams and how to simplify them in JavaScript.  My 7-year-old perked up and asked me:

> Daddy, what is a stream?

I explained that a stream is like a line of water along the ground.  If you dig a trench on a hill and fill up the high end using a water hose the water will run down the hill along the trench.  This is one of his favorite hobbies in the back yard, so he understood completely.  I explained that when new water is added to the top, it eventually makes its way to the bottom of the stream.  The end where water comes from is called the **upstream** and the other end is the **downstream**.  Gravity pulls water down.

## Back Pressure

Satisfied that I explained the concept, I continued by saying that I've been thinking a lot about how back pressure should work.  Then he asked:

> Daddy, what is back pressure?

I thought for a moment and thought of a water hose.  I explained to him that in a water hose, if you kink the end of the hose while the water is on, eventually it will fill up and once the pressure is high enough, the house will stop putting more water into the hose.  The tap will feel the **pressure** all the way from the kink **back** to the source.

Now imagine back to the original example of a trench in the ground.  If you build a large dam at the end, the source won't feel **back pressure**.  Rather when the trench fills up, the water will spill out flooding the nearby plains.  This is usually a bad thing.

## Pull Streams

I then resumed explaining to my wife about my work.  I explained that **pull streams** are much easier to implement back pressure for than **push streams**.  Then my son asked:

> What's that mean?

I could see that I would have to explain everything I talked about.  He was in that mood where he wanted to understand everything adults talk about.

I said that the example with the water hose and the trench in the ground are **push streams**.  The water is pushed into the upstream side and flows downstream because of the positive pressure.  A **pull stream** is more like a straw.  With a straw, you don't have to worry about flooding because the bottom of the straw will normally not push water up the straw on its own.  When the person sucks on the top of the straw it creates a vacuum that pulls water from the bottom of the straw.  New water only enters the straw when it's asked for by the top of the straw.

I then went on to explain how different straw lengths and thicknesses affect how the straw works.  With a larger straw it takes longer to get at the initial bit of drink because all the space needs to be filled first.  When you do finally get drink, it's not the liquid that just entered the bottom you're drinking, but the water that was first buffered into the straw.

## Codecs

The tricky part of what I've been working on today is how to express codecs simply while still preserving back pressure.  I looked over to Jack and he was still listening intently so I tried to explain what a **codec** is.

It stands for encode and decode.  It converts a stream from one type to another.  I could see I had lost the 7-year-old, so I decided to explain it to my wife instead.

My favorite part of physics was dimensional analysis.  If you knew the units that the answer expected and knew the units you started with, then pick the formula that had the difference in units.  If you have the proper units when you were done, it was probably correct. (This is probably how users of strictly typed programming languages feel about their compiler.)

But my second favorite part of physics was the actual conversion process between units.  You would start out in one unit, apply a transformation and end up with another representation of the same thing.

Here is an example converting 100 meters per second to miles per hour using several conversion constants:

              3.28084 feet    1 mile     60 seconds   60 minutes
    100 m/s x ------------ x --------- x ---------- x ---------- = 223.7 Mph
                1 meter      5280 feet    1 minute      1 hour
             

Stream codecs are just like the unit conversions, except they work on streams of data instead of scalar values.  The new stream after running through the codec is the same data, just represented a different way.

My son is learning how to read, so I decided to explain codecs using reading. A sentence is composed of many words.  The sentence can be viewed as a stream of words where each event is a word.  Now suppose I want a new stream that is a list of all the letters in the sentence.  This codec would consume word events and emit letter events.  The problem I quickly saw with this was that the reverse conversion didn't work.  I would have to emit a space after each word to know how to re-form the words out of the stream of letters.

Then I realized that this could be a nested stream.  Instead of creating a new flat stream of letters, I could convert each word into a new stream of letters.  In fact, it's nested streams all the way up.  Letters contain strokes, words contain letters, sentences contain words, paragraphs contain sentences, sections contain paragraphs, chapters contain sections, etc...

Obviously I had gone off the theoretical deep end here.

> But what does this have to do with computers?

In computers we have streams of data.  For example, if you want to stream a movie from a server to your smart phone, the movie is the stream.  Now usually, the server can read from the local disk much faster than the phone can download the data over its 3G connection.  If you don't program a way for the disk source to feel the **back pressure** from the slow mobile connection, it will read the data full-speed and flood the server's memory by buffering everything.  This is bad for servers with lots of clients and/or large media files.

One way for the media server to feel the **back pressure** is to use a **pull stream**.  But care needs to be taken to keep things running smoothly.  The stream needs to have an appropriate level of buffering along the path so that just like the straw you don't have to wait the full length of the straw to get a single chunk.  If the stream is constantly full, then the phone gets the chunks as fast as it asks for them with no latency other than the initial buffering.

We have codecs every time we convert a network or file stream from one format to another.  On the network there is IP, TCP, HTTP, JSON, and other codecs layered on top of each other.  Sometimes there are nested streams.  For example, this week I was prototyping a new HTTP codec for node.js and hit a snag because the TCP connection stream emits request events, but within the request event is a body stream with its own data events.  Preserving proper **back pressure** inside that nested stream is tricky and my nice little prototype APIs didn't work anymore.

I eventually figured out what works for me, but that's content for another more concrete post.

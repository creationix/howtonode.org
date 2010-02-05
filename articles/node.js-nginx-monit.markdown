Title: Deploying Node.js With Upstart and Monit
Author: Tim Smart
Date: 

## So you like Node.js? You want to deploy it? ##

If I heard two "Yes"'s, then you are in the some boat as me, and being in that boat feels really really vulnerable. Like the kind of vulnerable you would feel if you were trapped in a cage with lions. And here is why:

 - If Node.js decides to crash, you are screwed.
 - If the above isn't enough for you, then you may need to reconsider.

There are two well-known technologies that can save us from this mess, and dam right we are going to use them!  


## Problems ##

The first problem we will get thrown by, is the fact that we can not run Node.js as a daemon. A daemon, for the un-aware, is a child process that spawns from a process, leaving the parent to die. Tragic story I know, but this allows things to run in the background. But why is this a problem? Well if [Kevin's blog post][] isn't enough for you, it essentially allows one to separate node from any form of interface, meaning terminal doesn't have stay open all day. I highly recommend you pause now and read Kevin's material, as it will expand more on daemon-izing the node process.


## upstart ##

As Kevin stated in his blog, the first tool we are going to look at is [upstart][], which will allow us to:

 - Run Node.js as a daemon
 - Provide an easy set of commands for stop / starting our Node.js application

Most linux distributions that have a decent package manager which will allow you to install [upstart][] the easy way. On debian systems this is usually:

    sudo apt-get install upstart

Otherwise you will need to configure and compile from source, and this blog post will not go off topic! So we resume...

We now will want to configure [upstart][], and I am shame-less-ly borrowing Kevin's example:

    description "node.js server"
    author      "joe"

    start on startup
    stop on shutdown

    script
        export HOME="/root"

        exec sudo -u username /usr/local/bin/node /where/yourprogram.js 2>&1 >> /var/log/node.log
    end script

You will need to replace `username` with the user you want to run node as, and `/where/yourprogram.js` with the location of your application. You can then save this file to `/etc/init/yourprogram.conf` for later use. (Dont't forget to make it executable!) If you are using an older linux distribution, you may need to save the file to `/etc/event.d/yourprogram`

Using your program is now a cinch:

    start yourprogram
    stop yourprogram

And now node will automatically start at boot and log output to `/var/log/node.log`. But I assumed you read all that on Kevin's blog, right? Moving on...

## The real problem ##

Turning your application into a daemon isn't enough. A daemon can still crash, and those lions are getting awefully close. We need a tool that keeps an eye out for any falls our node instances may have. When something crashes our server, we need that tool to take evasive action. Also that tool should be capable of expanding its reach to any other services our app may need; such as databases and nginx instances. Thankfully this isn't taken lightly by most, and serveral helpful tools that fit our description do exist.

## monit ##

Now that we have our application in a easy to manage form, we need to look at the real issue we are facing. What happens when Node.js crashes? Fortunately for us mortals someone has done most of the hard work for us, and blessed us with the [monit][] utility. Essentially monit is a monitoring tool, which you configure tests that will be evaluated at certain intervals. If one of the tests fails, then it will take action depending on the rules you assign to it.

I'm not going to tell you how to install it, [their website][] has plenty on information for that, but here instead is an example config file designed for our upstart node daemon will made earlier:

    set logfile /var/log/monit.log

    check host nodejs with address 127.0.0.1
        start program = "/sbin/start yourprogram"
        stop program  = "/sbin/stop yourprogram"
        if failed port 8000 protocol HTTP
            request /
            with timeout 10 seconds
            then restart

You can save this in `/etc/monit/monitrc`. Here is the break down:

    set logfile /var/log/monit.log

    check host nodejs with address 127.0.0.1

This will tell monit to log all output to `/var/log/monit.log`, and it also gives our node instance a name and location. I am assuming monit will be running on the same machine as your node app, so we will need to listen on 127.0.0.1 . If you wanted to run monit on another box, you most certainly can, in fact I recommend have multiple instances of monit running in different locations. You just have to ensure that monit is listening on the correct IP address, otherwise monit is rendered useless.
The next part is the vital part, which defines how we will test for failures:

    start program = "/sbin/start yourprogram"
    stop program  = "/sbin/stop yourprogram"
    if failed port 8000 protocol HTTP
        request /
        with timeout 10 seconds
        then restart

The first two lines should be self-explanatory, this defines how monit will start and stop your application. You will need to specify an absolute path to upstart's start and stop utilities, while suffixing your application name as an argument.

The third line is the crux of monit's useful-ness. If we were running our application on port 8000, serving through the HTTP protocol, then this would apply. Monit will perform an analysis on the specified port and protocol, and if its routines discover that something is not right, it will execute the next few lines. Monit has lots of different options for dealing with service failures, such as sending e-mails and restarting servers. In this case we are going to do a simple request to the root of the local domain, and if 10 seconds pass without the expected response, monit will restart the application.

Now all that is left, is to start your application, then set monit off to do its tedious task of saving the world from crashing servers.

    sudo start yourprogram
    monit -d 60 -c /etc/monit/monitrc

Setting the `-d 60` flag tells monit to check against your configuration every 60 seconds. I recommend setting this to the same time as any response timeouts you may have installed. You have now passed monit 101! Easy, huh?

Monit's useful-ness doesn't hit a brick wall there either, monit can be extended further to monitor the other services your web application relies upon. This may range from databases to nginx instances. Their website has many more examples and configurations, and even more again can be found littered over the internet.

## Continuation ##

The next article I will write I'll explain how the awesomeness of node, can play nicely with the superb nginx server. This enables us hackers to create large scale load-balanced applications. Stay tuned...


[Kevin's blog post]: http://static01.vanzonneveld.net:8080/techblog/article/run_nodejs_as_a_service_on_ubuntu_karmic/
[upstart]: http://upstart.ubuntu.com/
[monit]: http://mmonit.com/monit/
[their website]: http://mmonit.com/monit/

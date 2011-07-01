Title: Fun Putting Node on Mobile Devices
Author: Tim Caswell
Date: Fri Jul 01 2011 10:04:02 GMT-0700 (PDT)
Node: v0.4.9

This article will walk you through creating an Ubuntu image that can be chrooted inside a mobile device like the recently released [TouchPad][].  Once the Ubuntu environment is setup we'll learn how to compile and install node for fun and/or profit.

## Create the Image

The first step is to create the image file that will be our virtual partition.  This is best done using `dd`.  We can resize this later using `resize2fs`, so for now make a nice small 512MB image.

    sudo dd if=/dev/zero of=UbuntuNatty_armel.img bs=1M count=512

Then we want to put a filesystem on it.

    sudo mkfs.ext3 UbuntuNatty_armel.img

Now we have a fully functional filesystem.  Let's mount it.

    mkdir build
    sudo mount UbuntuNatty_armel.img build

Ok, here is where the magic happens.  In this step I'm putting the Ubuntu Natty userspace in this new filesystem.  I have also done this with Debian Sid, but v8 doesn't compile without patches on arm Debian.

    sudo qemu-debootstrap --arch armel --foreign natty build

At this point your image is ready to be put onto your mobile device, but let's explore for the magic for some fun.  First we want to `chroot` into this system to interact with it.

    sudo mount -t proc none build/proc
    sudo mount -t sysfs none build/sys
    sudo mount -o bind /dev build/dev
    sudo cp /etc/resolv.conf build/etc/resolv.conf
    sudo chroot build

The `qemu-debootstrap` process didn't seed this image with any apt repos, so lets add one.

    echo "deb http://ports.ubuntu.com/ubuntu-ports/ natty main universe" > /etc/apt/sources.list

Now let's see what kind of binaries live in this world.

    apt-get install file -y
    cd /usr/bin
    ./file ./file

We just installed `file`, a program that tells isus stuff about files.  Then we told it to tell us about itself.  I got as output:

    file: ELF 32-bit LSB executable, ARM, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.16, stripped

So the file we just executed on our intel laptop was an arm executable.  This magic is thanks to 
 file that `qemu-debootstrap` installed for us.  The file `/usr/bin/qemu-arm-static` is used to interpret arm binaries on the fly for us!

Anyway, enough fun, let's put this on some real arm hardware.  In this article I'll use webOS since it encourages homebrew exerimentation unlike certain competitors.  It should work on any arm device where you have linux and a root login.

To keep our host machine happy, we should logout of the chroot and clean things up.

    exit
    sudo umount build/sys
    sudo umount build/proc
    sudo umount build/dev
    sudo umount build
    rmdir build

Now we have a fully functional Ubuntu system in a single file.

On webOS the easiest way to put a file on the drive is to use `novacom put`.

    novacom put file://media/internal/UbuntuNatty_armel.img < UbuntuNatty_armel.img

Then log into the device and mount it on the internal drive.

    novaterm
    mkdir /media/chroot
    mount /media/internal/UbuntuNatty_armel.img /media/chroot
    mount -t proc none /media/chroot/proc
    mount -t sysfs none /media/chroot/sys
    mount -o bind /dev /media/chroot/dev
    cp /etc/resolv.conf /media/chroot/etc/resolv.conf

Now we're ready to enter this chroot. I don't like being root all the time, so I created a local user. Since the chroot shares user id's with the chroot, but has it's own user listing, we have to add the user twice.  First in the host system, add a new user.

    adduser tim
    id tim

Note the uid of the new user and group.  My was:

    uid=1002(tim) gid=1002(tim) groups=1002(tim)

Now let's enter the chroot and mirror the user there.

    chroot /media/chroot
    adduser tim --uid 1002

Then we should add sudo access to this user.  Read up on `visudo` if you don't know how to do this.  On Ubuntu, this is as simple as installing sudo and adding our user to it's group.  

    apt-get install sudo
    adduser tim sudo
    echo "127.0.0.1 "`hostname` >> /etc/hosts

Now we can logout and login as our user this time.  Note I use `login` instead of the default shell to make the chroot a more full experience.

    exit
    chroot /media/chroot login

The first thing I do is then install some useful stuff I use all the time.  These are optional, but I would recommend looking into them and seeing if they work for you.

    sudo apt-get install vim tree strace htop dstat

Since this is a nodeJS blog, we'll download and compile node.  Note that these instructions will work for any recent ubuntu system.  First let's install the dependencies to install node.

    sudo apt-get install git curl build-essential libssl-dev

Then I like to use nvm so I can compare multiple versions of node on the same system.

    git clone http://github.com/creationix/nvm.git
    . nvm/nvm.sh               # Load the nvm function into this environment
    export JOBS=2              # This should match the number of CPUs you have.
    nvm install v0.4.9         # Download, build, and install node and npm
    nvm alias default v0.4.9   # Make this the default upon nvm load (login)

I would then add the `. $HOME/nvm/nvm.sh` line to my `.bashrc` so I get the nvm environment on every login.

Now that we have a normal node environment, we can do things like install http_trace and watch traffic over wifi or the modem.

    sudo apt-get install libpcap-dev
    npm install -g http_trace
    sudo su
    . /home/tim/nvm/nvm.sh
    http_trace --headers

To make setup and teardown of the chroot easier, I'd recommend making shell scripts that contain the following.  For setup. (this runs outside the chroot)

    mount /media/internal/UbuntuNatty_armel.img /media/chroot
    mount -t proc none /media/chroot/proc
    mount -t sysfs none /media/chroot/sys
    mount -o bind /dev /media/chroot/dev
    cp /etc/resolv.conf /media/chroot/etc/resolv.conf
    chroot /media/chroot login

And for cleanup.

    umount /media/chroot/proc
    umount /media/chroot/sys
    umount /media/chroot/dev
    umount /media/chroot

You now have a nice portable Ubuntu system complete with working apt-get, nvm, node, and npm. If you run out of space you can reclaim some by running `apt-get clean` from within the chroot.  Also you can resize the partition when it's not mounted using `resize2fs`.  This image can be copied to other devices and reused there.

You'd be surprised what you can do in this environment that works in the host environment at well.  For example, I've found that Ubuntu's `htop` program will run as is in the host webOS environment.  I just copied the one in `/media/chroot/usr/bin/htop` to `/usr/bin/htop`.  Also I found that SDL programs build in the Ubuntu environment will successfully link with the sdl libraries that are part of the PDK system and they will launch as cards when run in the host environment.  With things like SDL bindings for node, you would be able to develop PDK apps in JavaScript on your TouchPad. See <https://github.com/creationix/node-sdl> for a start on such a library.  This library was developed, compiled and tested 100% on my TouchPad using my laptop as a bigger screen and keyboard.


[TouchPad]: http://www.hpwebos.com/us/products/pads/touchpad/index.html

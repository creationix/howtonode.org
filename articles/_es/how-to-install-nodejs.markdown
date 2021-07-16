Title: How to Install Node.js
Title: Cómo instalar Node.js
Author: Node Knockout
Date: Sat, 11 Sep 2010 22:40:19 GMT

Translated by: Damián Suárez
Date: Fri, 17 Sep 2010 10:56:19 GMT-3

Node: v0.2.1

Este fue el primero de una serie de artículos publicados por [Node.js Knockout][] sobre cómo utilizar [node.js][].

Me han dado permido para publicar los artículos del concurso aquí (en formato wheat) para uso general. Espero aún más por venir.

En este artículo detallamos cómo instalar node en [Mac][], [Ubuntu][], y [Windows][].

## Mac

Si estas usando el excelente administrador de paquetes [homebrew][],
puedes instalar node en un comando: `brew install node`.

De otra forma, sigue los siguientes pasos:

1.  [Instalar Xcode][].
2.  [Instalar git][].
3.  Ejecuta los siguientes comandos:

<how-to-install-nodejs/darwin_setup.sh>

Puedes chequear su funcionamiento con un simple ejemplo [Hello, World!][].

## Ubuntu

1.  Instalar las dependencias:
    -   `sudo apt-get install g++ curl libssl-dev apache2-utils`
    -   `sudo apt-get install git-core`

2.  Ejecuta los siguientes comandos:

<how-to-install-nodejs/ubuntu_setup.sh>

Puedes chequear su funcionamiento con un simple ejemplo [Hello, World!][].

Gracias a [code-diesel][] por las dependencias en Ubuntu.

## Windows

Actualmente, debes usar [cygwin][] para instalar node.
Para ello sigue estos pasos:

1.  [Instalar cygwin][].
2.  Usar `setup.exe` en la carpeta cygwin para instalar los siguientes paquetes:
    -   devel &rarr; openssl
    -   devel &rarr; g++-gcc
    -   devel &rarr; make
    -   python &rarr; python
    -   devel &rarr; git

3.  Abrir la linea de comandos cygwin con
    `Start > Cygwin > Cygwin Bash Shell`.
4.  Ejecutar los comandos de abajo para descargar y crear node.

<how-to-install-nodejs/cygwin_setup.sh>

Para más detalles, incluyendo información para solucionar problemas, por favor ver [GitHub wiki page][].


## Hello Node.js!

He aquí un programa rápido para asegurarse que todo este funcionando correctamente:

<how-to-install-nodejs/hello_node.js>

Ejecuta el código con la línea de comando `node` :

    > node hello_node.js
    Server running at http://127.0.0.1:8124/

Ahora, si navegas a [http://127.0.0.1:8124/][] en tu browser, deberías ver un lindo mensaje.

## Felicidades!

Usted ha instalado [node.js][].

  [Countdown to Knockout: Post 1 - How to Install Node.js]: http://nodeknockout.posterous.com/countdown-to-knockout-post-1-how-to-install-n
  [Node.js Knockout]: http://nodeknockout.com/
  [node.js]: http://nodejs.org/
  [Mac]: #mac
  [Ubuntu]: #ubuntu
  [Windows]: #windows
  [homebrew]: http://github.com/mxcl/homebrew
  [Install Xcode]: http://developer.apple.com/technologies/tools/
  [Install git]: http://help.github.com/mac-git-installation/
  [Hello, World!]: #hello
  [code-diesel]: http://www.codediesel.com/linux/installing-node-js-on-ubuntu-10-04/
  [cygwin]: http://www.cygwin.com/
  [Install cygwin]: http://www.mcclean-cooper.com/valentino/cygwin_install/
  [GitHub wiki page]: http://wiki.github.com/ry/node/building-node-on-windowscygwin
  [http://127.0.0.1:8124/]: http://127.0.0.1:8124/

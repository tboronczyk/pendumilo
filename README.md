# Pendumilo (Rado de Fortuno)

KIO ESTAS ĈI-TIU FEKAĴO!?

Nia loka esperanta klubo renkontiĝas enrete pro KOVIM-19, do por amuza kunsida
ludo, mi programis ĉi tiun version de Pendumulo (fakte "Rado de Fortuno",
usona ludspektaklo). Ĉar mi planas uzi la programon nur kelkfoje, la fontkodo
estas malneta kaj plena kun cimoj; mi ne havas planon por plibonigi ĝin.

La ludestro malfermas la ap-paĝon en retumilo, prezentas sian ekranon, kaj
respondecas premi la klavojn por regi la ludon.

  * `/` - iri al la sekva enigmo
  * spacoklavo - rotaciigi la radon aŭ forigi la radon
  * `X` - montri ĉiujn literojn (solvi la enigmon)
  * `A`...`Z` - montri elektitan literon
  * `1` - antaŭenigi vicon al la sekva ludanto malaŭtomate
  * `Q` - montri inter rondaj kaj sumaj poentoj

Jam enhavas 16 enigmojn en la `puzzles` dosierujo. Se vi volas krei novajn,
faru fonan bildon de `puzzle.psd` kaj aldonu la poziciojn de literoj en
`puzzles.json`.

Enrete per GitHub Pages: [tboronczyk.github.io/pendumilo/src](https://tboronczyk.github.io/pendumilo/src)

Por servi la kodon loke, instalu [Docker](https://docker.com/) kaj rulu
`docker-compose up`.


# Hangman (Wheel of Fortune)

WHAT IS THIS CRAP!?

Our local Esperanto club is meet online because of COVID-19, and for a fun
meeting activity I tossed together this version of Hangman ("Wheel of Fortune").
I’m only planning on using the program once or twice, so the source code is
messy and full of bugs; there are no plans to improve it.

To play, the emcee opens the app in a browser, shares their screen, and
drives gameplay by pressing various keyboard buttons.

  * `/` - advance to the next puzzle
  * spacebar - spin the wheel or dismiss the wheel
  * `X` - reveal all letters (solve the puzzle)
  * `A`...`Z` - select/show a letter
  * `1` - manually advance to next player
  * `Q` - toggle between round and total score

There are 16 puzzles in the `puzzles` folder. If you want to create new puzzles,
make a base image using `puzzle.psd` and add the letter positions to
`puzzles.json`.

Online via GitHub Pages: [tboronczyk.github.io/pendumilo/src](https://tboronczyk.github.io/pendumilo/src)

To serve the code locally, install [Docker](https://docker.com) and execute
`docker-composer up`.

(function (appId) {
    const canvas = document.getElementById(appId);
    const ctx = canvas.getContext('2d');

    // sound fx
    const sfxBankrupt = new Audio('sfx/bankrupt.mp3');
    const sfxDing = new Audio('sfx/ding.mp3');
    const sfxNoLetter = new Audio('sfx/no-letter.mp3');
    const sfxReveal = new Audio('sfx/reveal.mp3');
    const sfxSolve = new Audio('sfx/solve.mp3');
    const sfxWheel = new Audio('sfx/wheel.mp3');

    // graphics
    const imgPuzzle = new Image();
    imgPuzzle.src = 'img/splash.jpg';

    imgPuzzle.onload = function () {
        canvas.width = 1280;
        canvas.height = 720;
        ctx.drawImage(this, 0, 0);
    }

    const imgArrow = new Image();
    imgArrow.src = 'img/arrow.png';

    const imgWheel = new Image();
    imgWheel.src = 'img/wheel.png';

    const imgWheelBg = new Image();
    imgWheelBg.src = 'img/wheel-bg.jpg';

    // state vars
    let puzzles = [];
    let currentRound = -1;
    let isSpinning = false;
    let solvedLetters = [];

    fetch('puzzles/puzzles.json')
        .then((response) => response.json())
        .then((data) => puzzles = data);

    function playSound(sfx) {
        sfx.currentTime = 0;
        sfx.play();
    }

    function stopSound(sfx) {
        sfx.pause();
    }

    function drawPuzzle() {
        ctx.drawImage(imgPuzzle, 0, 0);
        ctx.font = 'bold 50px sans-serif';
        solvedLetters.forEach((letter) => {
            ctx.fillText(letter.chr, letter.x, letter.y);
        });
    };

    function drawWheel() {
        ctx.drawImage(imgWheelBg, 0, 0);

        playSound(sfxWheel);

        const maxPos = 360 + Math.floor(Math.random() * 360);
        for (let i = 0; i < maxPos; i++) {
            setTimeout(() => {
                ctx.save();
                ctx.translate(640, 640);
                ctx.rotate(i * 0.01745); // radians
                ctx.translate(-640, -640);
                ctx.drawImage(imgWheel, 0, 0);
                ctx.restore();

                const color = ctx.getImageData(638, 12, 1, 1).data;
                ctx.drawImage(imgArrow, 590, 0);

                if (i === maxPos - 1) {
                    stopSound(sfxWheel);
                    if (color[0] < 5 && color[1] < 5 && color[2] < 5) {
                        playSound(sfxBankrupt);
                    }
                }
            }, i * 10);
        }
    }

    function nextPuzzle() {
         currentRound++;
         if (currentRound > puzzles.length) {
             playSound(sfxNoLetter);
             return;
         }

         imgPuzzle.src = 'puzzles/' + puzzles[currentRound].background;
         solvedLetters.splice(0, solvedLetters.length);
         drawPuzzle();
         playSound(sfxReveal);
    }

    function spinWheel() {
        isSpinning = !isSpinning;
        if (isSpinning) {
            // show/spin wheel
            drawWheel();
        } else {
            // hide wheel
            drawPuzzle();
        }
    }

    function solvePuzzle() {
       solvedLetters.splice(0, solvedLetters.length);
       solvedLetters.push(...puzzles[currentRound].letters);
       drawPuzzle();
       playSound(sfxSolve);
    }

    window.addEventListener('keypress', (evt) => {
        // spacebar
        if (evt.keyCode === 32) {
            spinWheel();
            return;
        }

        if (evt.key === '/') {
            nextPuzzle();
            return;
        }

        const c = evt.key.toUpperCase();

        if (c === 'X') {
            solvePuzzle();
            return;
        }

        try {
            solvedLetters.forEach((letter) => {
                if (letter.chr === c) {
                    throw 'BreakException';
                }
            });
        } catch (e) {
            playSound(sfxNoLetter);
            return;
        }

        let delay = 1;
        let lettersShown = 0;
        puzzles[currentRound].letters.forEach((letter) => {
            if (letter.chr === c) {
                lettersShown++;
                setTimeout(() => {
                    solvedLetters.push(letter);
                    drawPuzzle();
                    playSound(sfxDing);
                }, delay);
                delay += 1000;
            }
        });

        if ('ABCĈDEFGĜHĤIJKLMNOPRSŜSTUŬVZ'.indexOf(c) > -1 && lettersShown === 0) {
            playSound(sfxNoLetter);
        }
    });
})('app');

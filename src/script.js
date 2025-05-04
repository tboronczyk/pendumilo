(function (appId) {
    const canvas = document.getElementById(appId);
    const ctx = canvas.getContext('2d');

    const alphabet = 'ABCĈDEFGĜHĤIJĴKLMNOPRSŜTUŬVZ';
    const vowels = 'AEIOU';
    const vowelCost = 250;

    // get number of players from URL parameter, default to 3
    const params = new URLSearchParams(window.location.search);
    const numPlayers = parseInt(params.get('p')) || 3;

    // graphics
    const imgPuzzle = new Image();
    imgPuzzle.src = 'img/splash.jpg';

    imgPuzzle.onload = function () {
        canvas.width = 1280;
        canvas.height = 720;
        ctx.drawImage(this, 0, 0);
        drawBars();
    }

    const imgArrow = new Image();
    imgArrow.src = 'img/arrow.png';

    const imgWheel = new Image();
    imgWheel.src = 'img/wheel.png';

    const imgWheelBg = new Image();
    imgWheelBg.src = 'img/wheel-bg.jpg';

    const miniWheel = new Image();
    miniWheel.src = 'img/mini-wheel.png';

    // sound fx
    const sfxBankrupt = new Audio('sfx/bankrupt.mp3');
    const sfxDing = new Audio('sfx/ding.mp3');
    const sfxNoLetter = new Audio('sfx/no-letter.mp3');
    const sfxReveal = new Audio('sfx/reveal.mp3');
    const sfxSolve = new Audio('sfx/solve.mp3');
    const sfxWheel = new Audio('sfx/wheel.mp3');

    // wheel amounts keyed by RGB values
    const amounts = {
        0: {
            200: {
                248: 300,
                250: 350,
                252: 700
            }
        },
        1: {
            1: {
                1: 'bankrupt'
            }
        },
        34: {
            177: {
                74: 250,
                76: 500,
            }
        },
        200: {
            125: {
                248: 500,
                250: 550,
                252: 650
            }
        },
        237: {
            28: {
                34: 600,
                36: 700,
                38: 800
            }
        },
        254: {
            126: {
                0: 300,
                2: 800
            },
            128: {
                190: 450,
                192: 500,
                194: 900
            },
            242: {
                0: 400,
                2: 900
            }
        },
        255: {
            255: {
                255: 'loseturn'
            }
        }
    }

    // state vars
    let puzzles = [];
    let currentRound = -1;
    let isSpinning = false;
    let solvedLetters = [];
    let amount = 0;
    let player = 0;
    const scores = new Array(numPlayers).fill(0);
    let overallScores = new Array(numPlayers).fill(0);
    let isShowOverallScores = false;

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
        drawBars();
        ctx.font = 'bold 50px sans-serif';
        ctx.fillStyle = 'black';
        solvedLetters.forEach((letter) => {
            ctx.fillText(letter.chr, letter.x, letter.y);
        });
    }

    function drawBars() {
        drawScoreBar();
        drawAlphabetBar();
    }

    function drawScoreBar() {
        // Draw background
        ctx.fillStyle = '#000080';
        ctx.fillRect(0, 0, canvas.width, 60);

        // Draw player scores
        ctx.font = 'bold 24px sans-serif';

        // Calculate spacing between players
        const spacing = (canvas.width - 200) / (numPlayers + 1);

        // Show TOTAL indicator on the left if showing overall scores
        if (isShowOverallScores) {
            ctx.fillStyle = 'white';
            ctx.fillText('SUME', 20, 40);
        }

        // Draw each player's score
        for (let i = 0; i < numPlayers; i++) {
            if (isShowOverallScores) {
                ctx.fillStyle = 'white';
            } else {
                ctx.fillStyle = player === i ? 'white' : '#9999cc';
            }
            const x = spacing * (i + 1);
            const displayScore = isShowOverallScores ? overallScores[i] : scores[i];
            ctx.fillText(`L${i + 1} ₷ ${displayScore}`, x, 40);
        }

        // Show current spin amount
        ctx.fillStyle = 'white';
        const amountText = amount === 'bankrupt' ? '' :
            amount === 'loseturn' ? '' :
                amount > 0 ? `₷ ${amount}` : '';

        if (amount > 0) {
            ctx.drawImage(miniWheel, canvas.width - 200, 23, 14, 14); // Position wheel before amount
            ctx.fillText(amountText, canvas.width - 180, 40);
        } else {
            ctx.fillText(amountText, canvas.width - 180, 40);
        }
    }

    function drawAlphabetBar() {
        // Draw background
        ctx.fillStyle = '#000080';
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

        // Draw letters
        ctx.font = 'bold 24px sans-serif';
        const letters = alphabet.split('');
        const spacing = canvas.width / letters.length;

        letters.forEach((letter, index) => {
            // Check if letter has been used
            const isUsed = solvedLetters.some(solved => solved.chr === letter);
            ctx.fillStyle = isUsed ? '#333399' : 'white';
            ctx.fillText(letter, spacing * index + (spacing / 2) - 10, canvas.height - 20);
        });
    }

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

                // sample two colors in case we land on edge
                const color1 = ctx.getImageData(638, 12, 1, 1).data;
                const color2 = ctx.getImageData(636, 12, 1, 1).data;

                ctx.drawImage(imgArrow, 590, 0);

                if (i === maxPos - 1) {
                    stopSound(sfxWheel);

                    // get sample 1
                    const r1 = color1[0];
                    const g1 = color1[1];
                    const b1 = color1[2];

                    // get sample 2
                    const r2 = color2[0];
                    const g2 = color2[1];
                    const b2 = color2[2];

                    amount = 5000; // "default" amount if none matches
                    // (it's hard to detect 5000 slice by color because of "glitter" effect
                    // with multiple colors, so we assign all other colors then default to this if
                    // no maching samples are found)

                    // check sample 1 first
                    if (amounts[r1] && amounts[r1][g1] && amounts[r1][g1][b1]) {
                        amount = amounts[r1][g1][b1];
                    }
                    // If sample 1 not found, check sample 2
                    else if (amounts[r2] && amounts[r2][g2] && amounts[r2][g2][b2]) {
                        amount = amounts[r2][g2][b2];
                    }
                    // If neither found, amount remains default 5000

                    if (amount === 'bankrupt') {
                        playSound(sfxBankrupt);
                        scores[player] = 0;  // Set current player's score to 0
                        player = (player + 1) % numPlayers;  // Move to next player
                    }
                    if (amount === 'loseturn') {
                        playSound(sfxBankrupt);
                        player = (player + 1) % numPlayers;  // Move to next player
                    }
                }
            }, i * 10);
        }
    }

    function nextPuzzle() {
        currentRound++;
        if (currentRound >= puzzles.length) {
            currentRound--;
            playSound(sfxNoLetter);
            return;
        }

        // Add current scores to overall scores before resetting
        for (let i = 0; i < numPlayers; i++) {
            overallScores[i] += scores[i];
        }

        // Reset round state
        scores.fill(0);
        amount = 0;
        player = 0;

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
        solvedLetters.push(...puzzles[currentRound].letters);
        drawPuzzle();
        playSound(sfxSolve);
    }

    window.addEventListener('keypress', (evt) => {
        if (evt.key === '1') {
            player = (player + 1) % numPlayers;
            drawBars();
            return;
        }

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

        if (c === 'Q') {
            isShowOverallScores = !isShowOverallScores;
            drawBars();
            return;
        }

        if (c === 'X') {
            solvePuzzle();
            return;
        }

        // Don't allow guessing if no amount has been set by wheel spin
        if ((amount === 0 && !vowels.includes(c)) || amount === 'bankrupt' || amount === 'loseturn') {
            playSound(sfxNoLetter);
            return;
        }

        // Don't allow vowel guesses if player doesn't have enough money
        if (vowels.includes(c) && scores[player] < vowelCost) {
            playSound(sfxNoLetter);
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
            player = (player + 1) % numPlayers; // Advance to next player
            amount = 0; // Reset amount
            drawBars(); // Update display
            return;
        }

        let delay = 1;
        let lettersShown = 0;
        let isVowel = vowels.includes(c);
        let vowelDeducted = false;

        puzzles[currentRound].letters.forEach((letter, index) => {
            if (letter.chr === c) {
                lettersShown++;
                setTimeout(() => {
                    solvedLetters.push(letter);

                    // Update score - only deduct vowel cost once
                    if (isVowel && !vowelDeducted) {
                        scores[player] -= vowelCost;
                        vowelDeducted = true;
                    } else if (!isVowel) {
                        scores[player] += amount;
                    }

                    drawPuzzle();
                    playSound(sfxDing);

                    // Clear amount after the last letter is revealed
                    if (index === puzzles[currentRound].letters.length - 1 ||
                        !puzzles[currentRound].letters.slice(index + 1).some(l => l.chr === c)) {
                        amount = 0;
                        drawBars();
                    }
                }, delay);
                delay += 1000;
            }
        });

        if ('ABCĈDEFGĜHĤIJĴKLMNOPRSŜTUŬVZ'.indexOf(c) > -1) {
            if (lettersShown > 0) {
                drawBars();
            } else {
                // Add the incorrect letter to solvedLetters
                solvedLetters.push({ chr: c, x: 0, y: 0 }); // x,y coords don't matter for alphabet bar
                player = (player + 1) % numPlayers;
                amount = 0;
                playSound(sfxNoLetter);
                drawBars();
            }
        }
    });
})('app');

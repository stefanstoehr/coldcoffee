document.addEventListener("DOMContentLoaded", function() {
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameContainer = document.getElementById('game-container');
    const gameBoard = document.getElementById('game-board');
    const overlay = document.getElementById('overlay');
    const restartButton = document.getElementById('restart-button');
    const rows = 7;
    const cols = 17;
    const numberOfEnemies = 5;
    let gameRunning = false;
    let playerPosition = { row: rows - 2, col: 1 };
    let enemies = [];
    let startTime;
    let timerInterval;
    let enemyInterval;

    function startGame() {
        gameRunning = true;
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        overlay.style.display = 'none'; // Verstecke das Overlay, wenn das Spiel neu gestartet wird
        playerPosition = { row: rows - 2, col: 1 }; // Setze die Spielerposition zurück
        startTime = Date.now();
        resizeGameBoard();
        placeEnemies();
        enemyInterval = setInterval(moveEnemies, 250);
        timerInterval = setInterval(updateTimer, 1000);
    }

    function resetGame() {
        gameRunning = false;
        clearInterval(enemyInterval);
        clearInterval(timerInterval);
        gameBoard.innerHTML = ''; // Entferne alle Inhalte aus dem Spielfeld
        enemies = [];
        startGame(); // Starte das Spiel neu
    }

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', resetGame);

    function resizeGameBoard() {
        const boardWidth = gameBoard.clientWidth;
        const boardHeight = gameBoard.clientHeight;
        const cellWidth = boardWidth / cols;
        const cellHeight = boardHeight / rows;

        const cells = gameBoard.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.style.width = `${cellWidth}px`;
            cell.style.height = `${cellHeight}px`;
        });
    }


    function updateTimer() {
        if (gameRunning) {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            document.querySelector('#overlay .time').textContent = `Time: ${elapsedTime}s`;
        }
    }

    function movePlayer(newRow, newCol) {
        if (!gameRunning) return;

        const newCellIndex = newRow * cols + newCol;
        const newCell = gameBoard.children[newCellIndex];
        const backgroundImg = newCell.querySelector('img');

        if (backgroundImg && backgroundImg.src.includes('braun.png')) {
            return;
        }

        const currentCellIndex = playerPosition.row * cols + playerPosition.col;
        const currentCell = gameBoard.children[currentCellIndex];
        const currentPlayerImage = currentCell.querySelector('.player');
        if (currentPlayerImage) {
            currentCell.removeChild(currentPlayerImage);
        }

        playerPosition = { row: newRow, col: newCol };
        const playerImage = document.createElement('img');
        playerImage.src = 'images/player.png';
        playerImage.className = 'player';
        newCell.appendChild(playerImage);

        gameWon();
        checkCollision();
    }

    function moveSingleEnemy(enemy) {
        if (!gameRunning) return;

        const possibleMoves = [];
        const directions = [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 }
        ];

        directions.forEach(dir => {
            const newRow = enemy.row + dir.row;
            const newCol = enemy.col + dir.col;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                const newCellIndex = newRow * cols + newCol;
                const newCell = gameBoard.children[newCellIndex];
                
                const backgroundImg = newCell.querySelector('img');
                const isForbiddenCell = (newRow === rows - 2 && newCol === 1) || (newRow === 1 && newCol === cols - 2);
                if ((!backgroundImg || !backgroundImg.src.includes('gelb.png') && !backgroundImg.src.includes('braun.png')) && !isForbiddenCell) {
                    possibleMoves.push({ row: newRow, col: newCol });
                }
            }
        });

        if (possibleMoves.length > 0) {
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            const newCellIndex = move.row * cols + move.col;
            const newCell = gameBoard.children[newCellIndex];
            const currentCellIndex = enemy.row * cols + enemy.col;
            const currentCell = gameBoard.children[currentCellIndex];
            const currentEnemyImage = currentCell.querySelector('.enemy');
            if (currentEnemyImage) {
                currentCell.removeChild(currentEnemyImage);
            }

            enemy.row = move.row;
            enemy.col = move.col;

            const enemyImage = document.createElement('img');
            enemyImage.src = 'images/gegner.png';
            enemyImage.className = 'enemy';
            newCell.appendChild(enemyImage);

            checkCollision();
        }
    }

    function moveEnemies() {
        enemies.forEach(enemy => {
            moveSingleEnemy(enemy);
        });
    }

    function checkCollision() {
        if (!gameRunning) return;

        enemies.forEach(enemy => {
            if (enemy.row === playerPosition.row && enemy.col === playerPosition.col) {
                const cellIndex = enemy.row * cols + enemy.col;
                const cell = gameBoard.children[cellIndex];

                // Entferne vorhandene Bilder in der Zelle
                while (cell.firstChild) {
                    cell.removeChild(cell.firstChild);
                }

                // Füge das Bild `cross.png` hinzu und stoppe das Spiel
                const crossImage = document.createElement('img');
                crossImage.src = 'images/cross.png';
                crossImage.className = 'cross';
                cell.appendChild(crossImage);

                gameRunning = false; // Spiel stoppen
                clearInterval(enemyInterval); // Stoppe das Intervall für die Gegnerbewegung
            }
        });
    }

    /*
    function checkCollision() {
        enemies.forEach(enemy => {
            if (enemy.row === playerPosition.row && enemy.col === playerPosition.col) {
                const cellIndex = playerPosition.row * cols + playerPosition.col;
                const cell = gameBoard.children[cellIndex];

                const crossImage = document.createElement('img');
                crossImage.src = 'images/cross.png';
                cell.appendChild(crossImage);

                endGame();
            }
        });
    }
    */

    function gameWon() {
        if (playerPosition.row === 1 && playerPosition.col === cols - 2) {
            showOverlay('YES!');
            endGame();
        }
    }

    function showOverlay(message) {
        const overlay = document.getElementById('overlay');
        const messageElement = overlay.querySelector('.message');
        messageElement.textContent = message;

        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        overlay.querySelector('.time').textContent = `Time: ${elapsedTime}s`;

        overlay.style.display = 'flex';
    }

    function endGame() {
        clearInterval(enemyInterval);
        clearInterval(timerInterval);
        gameRunning = false;
    }
    
    
    /*function placeEnemies() {
        const emptyCells = Array.from(gameBoard.children).filter(cell => {
            const backgroundImg = cell.querySelector('img');
            const isEmpty = !backgroundImg || (!backgroundImg.src.includes('gelb.png') && !backgroundImg.src.includes('braun.png'));
            const isForbiddenCell = (Array.from(gameBoard.children).indexOf(cell) === (rows - 2) * cols + 1) || (Array.from(gameBoard.children).indexOf(cell) === 1 * cols + cols - 2);
            return isEmpty && !isForbiddenCell && !cell.querySelector('.enemy');
        });

        while (enemies.length < numberOfEnemies && emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const cell = emptyCells[randomIndex];
            emptyCells.splice(randomIndex, 1);
            const cellIndex = Array.from(gameBoard.children).indexOf(cell);
            const row = Math.floor(cellIndex / cols);
            const col = cellIndex % cols;
            enemies.push({ row, col });

            const enemyImage = document.createElement('img');
            enemyImage.src = 'images/gegner.png';
            enemyImage.className = 'enemy';
            cell.appendChild(enemyImage);
        }
    }*/

    
    function placeEnemies() {
        for (let i = 0; i < numberOfEnemies; i++) {
            const enemyPosition = { row: Math.floor(Math.random() * rows), col: Math.floor(Math.random() * cols) };

            const cellIndex = enemyPosition.row * cols + enemyPosition.col;
            const cell = gameBoard.children[cellIndex];
            const backgroundImg = cell.querySelector('img');
            const isForbiddenCell = (enemyPosition.row === rows - 2 && enemyPosition.col === 1) || (enemyPosition.row === 1 && enemyPosition.col === cols - 2);

            if (!backgroundImg && !isForbiddenCell) {
                enemies.push(enemyPosition);
                const enemyImage = document.createElement('img');
                enemyImage.src = 'images/gegner.png';
                enemyImage.className = 'enemy';
                cell.appendChild(enemyImage);
            } else {
                i--; // Retry this enemy position if it is invalid
            }
        }
    }
    

    
    document.addEventListener('keydown', function(event) {
        switch (event.key) {
            case 'ArrowUp':
                if (playerPosition.row > 0) {
                    movePlayer(playerPosition.row - 1, playerPosition.col);
                }
                break;
            case 'ArrowDown':
                if (playerPosition.row < rows - 1) {
                    movePlayer(playerPosition.row + 1, playerPosition.col);
                }
                break;
            case 'ArrowLeft':
                if (playerPosition.col > 0) {
                    movePlayer(playerPosition.row, playerPosition.col - 1);
                }
                break;
            case 'ArrowRight':
                if (playerPosition.col < cols - 1) {
                    movePlayer(playerPosition.row, playerPosition.col + 1);
                }
                break;
        }
    });

    gameBoard.addEventListener('click', function(event) {
        const clickedCell = event.target.closest('.grid-cell');
        if (!clickedCell || !gameRunning) return;

        const clickedCellIndex = Array.from(gameBoard.children).indexOf(clickedCell);
        const clickedRow = Math.floor(clickedCellIndex / cols);
        const clickedCol = clickedCellIndex % cols;

        const rowDiff = Math.abs(clickedRow - playerPosition.row);
        const colDiff = Math.abs(clickedCol - playerPosition.col);

        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            movePlayer(clickedRow, clickedCol);
        }
    });

    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';

        const currentRow = Math.floor(i / cols);
        const currentCol = i % cols;

        if (currentRow === rows - 2 && currentCol === 1) {
            cell.style.backgroundImage = "url('images/gelb.png')";
            cell.style.backgroundSize = "cover";
            cell.style.backgroundPosition = "center";
            const playerImage = document.createElement('img');
            playerImage.src = 'images/player.png';
            playerImage.className = 'player';
            cell.appendChild(playerImage);
        } else if (currentRow === 1 && currentCol === cols - 2) {
            cell.style.backgroundImage = "url('images/room.png')";
            cell.style.backgroundSize = "cover";
            cell.style.backgroundPosition = "center";
        } else if (currentRow % 2 !== 0 && currentCol % 2 !== 0) {
            const image = document.createElement('img');
            image.src = Math.random() > 0.5 ? 'images/gelb.png' : 'images/braun.png';
            image.style.width = '100%';
            image.style.height = '100%';
            cell.appendChild(image);
        }

        gameBoard.appendChild(cell);
    }

    document.addEventListener('touchstart', function(event) {
        if (!gameRunning) return;
    
        const touch = event.touches[0];
        const rect = gameBoard.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const cellWidth = gameBoard.clientWidth / cols;
        const cellHeight = gameBoard.clientHeight / rows;
    
        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);
    
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            movePlayer(row, col);
        }
    });

    resizeGameBoard(); // Initiale Größenanpassung
    window.addEventListener('resize', resizeGameBoard); // Größenanpassung bei Fenstergröße ändern

   
});

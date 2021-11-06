let puzzle = [[5,3,0,0,7,0,0,0,0],
              [6,0,0,1,9,5,0,0,0],
              [0,9,8,0,0,0,0,6,0],
              [8,0,0,0,6,0,0,0,3],
              [4,0,0,8,0,3,0,0,1],
              [7,0,0,0,2,0,0,0,6],
              [0,6,0,0,0,0,2,8,0],
              [0,0,0,4,1,9,0,0,5],
              [0,0,0,0,8,0,0,7,9]];

function possible(puzzle, y, x, n) {
    for(let i = 0; i <= 9; i++) {
        if (puzzle[y][i] == n) return false;
    }
    for(let j = 0; j <= 9; j++) {
        if (puzzle[j][x] == n) return false;
    }
    let y0 = Math.floor((y/3))*3;
    let x0 = Math.floor((x/3))*3;
    for (let i = 0; i <= 3; i++) {
        for (let j = 0; j <= 3; j++) {
            if (puzzle[y0 + i][x0 + j] == n) return false;
        }
    }
    return true
}

function sudoku(puzzle) {
    for (let y = 0; y <= 9; y++) {
        for (let x = 0; x <= 9; x++) {
            if (puzzle[y][x] == 0) {
                for (let n = 1; n <= 9; n++) {
                    if (possible(puzzle,y,x,n)) {
                        puzzle[y][x] = n;
                        if (sudoku(puzzle) == puzzle) {
                            solved = puzzle;
                            return solved;
                        }
                        else {
                            puzzle[y][x] = 0;
                        }
                    }
                }
                return
            }
        }
    }
    solved = puzzle;
    return solved;
}

let sol = sudoku(puzzle);
console.log(sol);
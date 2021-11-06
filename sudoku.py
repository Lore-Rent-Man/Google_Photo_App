import sys
import ast

# puzzle_array = [[5,3,0,0,7,0,0,0,0],
#                 [6,0,0,1,9,5,0,0,0],
#                 [0,9,8,0,0,0,0,6,0],
#                 [8,0,0,0,6,0,0,0,3],
#                 [4,0,0,8,0,3,0,0,1],
#                 [7,0,0,0,2,0,0,0,6],
#                 [0,6,0,0,0,0,2,8,0],
#                 [0,0,0,4,1,9,0,0,5],
#                 [0,0,0,0,8,0,0,7,9]]

def possible(puzzle,y,x,n):
    for i in range(9):
        if puzzle[y][i] == n:
            return False
    for j in range(9):
        if puzzle[j][x] == n:
            return False
    y0 = (y//3)*3
    x0 = (x//3)*3
    for i in range(3):
        for j in range(3):
            if puzzle[y0 + i][x0 + j] == n:
                return False
    return True

def sudoku(puzzle):
    for y in range(9):
        for x in range(9):
            if puzzle[y][x] == 0:
                for n in range(1,10):
                    if possible(puzzle,y,x,n):
                        puzzle[y][x] = n
                        if sudoku(puzzle) == puzzle:
                            solved = puzzle
                            return solved
                        else:
                            puzzle[y][x] = 0
                return
    solved = puzzle
    return solved

def validate(puzzle):
    for i in range(9):
        for j in range(9):
            n = puzzle[i][j]
            if n == 0:
                return False
            puzzle[i][j] = 0
            if not possible(puzzle,i,j,n):
                puzzle[i][j] = n
                return False
            puzzle[i][j] = n
    return True

arg1 = sys.argv[1]

puzzle = ast.literal_eval(arg1)

solved = sudoku(puzzle)

print(solved)
sys.stdout.flush()

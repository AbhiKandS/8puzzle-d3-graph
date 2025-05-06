import renderTree from "./renderTree.js";

export const BLANK = ' ';

export const FINAL = [ 
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', BLANK]
];

const MOVES = { 
    'U': [-1, 0],
    'D': [1, 0],
    'L': [0, -1],
    'R': [0, 1]
};


export class PuzzleState {
    constructor(grid, cost=0, holeIdx=this.holefinder(grid), id="root") {
        this.grid = grid;
        this.holeRow = holeIdx[0];
        this.holeCol = holeIdx[1];


        this.g_cost = cost;
        this.h_cost = this.heuristic();
        this.f_cost = this.g_cost + this.h_cost;


        //used for html
        this.name = this.name();
        this.htmlName = this.htmlName();
        this.id = id;

        this.children = [];
    }

    holefinder(grid) {
        for (let row = 0; row < grid.length; ++row)
            for (let col = 0; col < grid[0].length; ++col)
                if (grid[row][col] == BLANK)
                    return [row, col];
    }

    name() {
        let name = "";
        for (const row of this.grid) {
            name += '| '
            for (const cell of row) {
                name += cell;
                name += ' | ';
            }
            name += '\n';
        }

        return name;
    }

    htmlName() {
        let html = "";
        for (const row of this.grid) {
            let rowHtml = "";
            for (const val of row)
                rowHtml += `<td>${val}</td>`;
            html += '<tr>' + rowHtml + '</tr>';
        }
        html = '<table>' + html + '</table>';

        return html;
    }

    heuristic() {
        let h = 0;
        for (let i = 0; i < FINAL.length; ++i) 
            for (let j = 0; j < FINAL[0].length; ++j) 
                if (this.grid[i][j] !== BLANK &&
                    this.grid[i][j] !== FINAL[i][j]
                )
                    h++;

        return h;
    }

    isGoalState() { return this.h_cost === 0;}

    expandChildren() {
        let newRow, newCol;
        let isValid = (r, c) =>
            0 <= r && r < this.grid.length &&
            0 <= c && c < this.grid.length


        for (const move in MOVES) {
            newRow = this.holeRow + MOVES[move][0];
            newCol = this.holeCol + MOVES[move][1];

            if (isValid(newRow, newCol))  {
                let newGrid = structuredClone(this.grid);
                
                newGrid[this.holeRow][this.holeCol] = newGrid[newRow][newCol];
                newGrid[newRow][newCol] = BLANK;

                this.children.push(new PuzzleState(
                    newGrid,
                    this.g_cost + 1,
                    [newRow, newCol],
                    this.id + move
                ));
            }

        }

        return this;
    }

    printToList() {
        const queue = [];
        queue.push(this);
        const visited = new Set();

        while (queue.length != 0) {
            let curr = queue.shift();
            if (visited.has(curr.id)) continue;

            visited.add(curr.id);
            let html = "";
            for (const child of curr.children) {
                html += `<li id="${child.id}">${child.htmlName}</li>`;
                queue.push(child)
            }
            const currElement = document.getElementById(curr.id);
            if (currElement) currElement.innerHTML = curr.htmlName + `<ul>${html}</ul>`
        }

        return this;
    }

    renderToTree(pathToSolution) {
        renderTree(this, pathToSolution);
    }

    solved(numNodes, time) {
        const solveStateElement = document.querySelector("#solved-state");
        
        const moves = this.id.replace("root", "");
        if (solveStateElement)
            solveStateElement.innerHTML = `
                SOLVED!!<br>
                Moves: ${moves}<br>
                Moves Length (Depth approx.): ${moves.length} <br>
                Time: ${time}ms <br>
        `;
        this.name += "\nDONE!! " + "MOVES: " + moves;
        return this
    }

    unsolved() {
        const solveStateElement = document.querySelector("#solved-state");
        if (solveStateElement)
            solveStateElement.innerHTML = `UNSOLVABLE`;
        this.name += "\n_\n";
        this.name += "UNSOLVABLE";
        this.children = [];
        return this
    }

}
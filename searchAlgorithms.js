import MinHeap from "./minHeap.js";
import {PuzzleState, FINAL} from "./puzzle_state.js";

//TODO: implement isSolvable

export function Astar(puzzleState) {
    const visited = new Set();
    const pq = new MinHeap();

    pq.push({state: puzzleState, priority: puzzleState.f_cost});
    visited.add(puzzleState.name);

    let currState;
    while (!pq.isEmpty()) {
        currState = pq.pop().state;
        if (currState.h_cost == 0) {
            console.log('done');

            currState.solved();
            return currState.id.replace('root','')
        }

        visited.add(currState.name);
        currState.expandChildren();

        for (const child of currState.children)
            if (!visited.has(child.name))
                pq.push({state: child, priority: child.f_cost});
    }
    console.log("unsolvable");
    puzzleState.unsolved();
}

export function bfs(puzzleState) {
    const visited = new Set();
    const queue = [];

    queue.push(puzzleState);
    visited.add(puzzleState.name);

    let currState;
    while (queue.length != 0) {
        currState = queue.shift();
        
        if (currState.isGoalState()) {
            console.log('done');

            currState.solved();
            return currState.id.replace('root', '')
        }

        currState.expandChildren();
        for (const child of currState.children)
            if (!visited.has(child.name)) {
                visited.add(child.name);
                queue.push(child);
            }
    }
    console.log("unsolvable");
    puzzleState.unsolved();
}

export function dfs(puzzleState=new PuzzleState(FINAL), visited=new Set()) {
    if (visited.has(puzzleState.name)) 
        return false;

    if (puzzleState.isGoalState())
        return puzzleState.id.replace('root', '');

    visited.add(puzzleState.name);
    let res;
    puzzleState.expandChildren();
    for (const child of puzzleState.children) {
        console.log(child.id);
        
        res = dfs(child, visited);
        if (res) return res;
    }
    return false;
}
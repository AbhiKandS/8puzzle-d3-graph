import MinHeap from "./minHeap.js";
import {PuzzleState, FINAL} from "./puzzle_state.js";

//TODO: implement isSolvable

export function Astar(puzzleState) {
    const start = performance.now('Astar');
    const visited = new Set();
    const pq = new MinHeap();

    pq.push({state: puzzleState, priority: puzzleState.f_cost});
    visited.add(puzzleState.name);

    let currState;
    while (!pq.isEmpty()) {
        currState = pq.pop().state;
        if (currState.h_cost == 0) {
            const end = performance.now('Astar');
            const time = (end-start).toFixed(2);
            console.log(time);
            
            currState.solved(visited.size, time);
            return [currState.id.replace('root',''), time];
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
    const start = performance.now('bfs');
    const visited = new Set();
    const queue = [];

    queue.push(puzzleState);
    visited.add(puzzleState.name);

    let currState;
    while (queue.length != 0) {
        currState = queue.shift();
        
        if (currState.isGoalState()) {
            const end = performance.now('bfs');
            const time = (end-start).toFixed(2);
            currState.solved(visited.size, time);
            return [currState.id.replace('root', ''), time]
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

export function dfs(puzzleState=new PuzzleState(FINAL), visited=new Set(), start=performance.now('dfs')) {
    if (visited.has(puzzleState.name)) 
        return [false, 0];

    if (puzzleState.isGoalState()) {
        const end = performance.now('dfs')
        const time = (end-start).toFixed(2);
        puzzleState.solved(visited.size, time);
        return [puzzleState.id.replace('root', ''), time];
    }


    visited.add(puzzleState.name);
    let res;
    puzzleState.expandChildren();
    for (const child of puzzleState.children) {
        res = dfs(child, visited, start);
        if (res[0]) return res;
    }
    return [false,0];
}
import { Astar, bfs , dfs} from "./searchAlgorithms.js";
import { MCTS } from "./mcts.js";
import { FINAL, BLANK, PuzzleState } from "./puzzle_state.js";
import renderTree from "./renderTree.js";

export function fillTable(state) {
    let table = document.querySelector('#table-body');

    state.children = [];
    let res = Astar(state);
    let root = d3.hierarchy(state);
    let maxDepth = root.height + 1;
    let numNodes = root.descendants().length;

    console.log(table);
    
    table.innerHTML += `
            <tr>
                <td>Astar</td>
                <td>${res[1]}</td>
                <td>${numNodes}</td>
                <td>${maxDepth}</td>
                <td>${res[0]}</td>
            </tr>
    `
    
    state.children = [];
    res = bfs(state);
    root = d3.hierarchy(state);
    maxDepth = root.height + 1;
    numNodes = root.descendants().length;

    console.log(table);
    
    table.innerHTML += `
            <tr>
                <td>BFS</td>
                <td>${res[1]}</td>
                <td>${numNodes}</td>
                <td>${maxDepth}</td>
                <td>${res[0]}</td>
            </tr>
    `

    state.children = [];
    res = dfs(state);
    root = d3.hierarchy(state);
    maxDepth = root.height + 1;
    numNodes = root.descendants().length;

    console.log(table);
    
    table.innerHTML += `
            <tr>
                <td>DFS</td>
                <td>${res[1]}</td>
                <td>${numNodes}</td>
                <td>${maxDepth}</td>
                <td>${res[0]}</td>
            </tr>
    `

    state.children = [];
    res = MCTS(state);
    root = d3.hierarchy(state);
    maxDepth = root.height + 1;
    numNodes = root.descendants().length;

    console.log(table);
    
    table.innerHTML += `
            <tr>
                <td>Monte-Carlo</td>
                <td>${res[1]}</td>
                <td>${numNodes}</td>
                <td>${maxDepth}</td>
                <td>${res[0]}</td>
            </tr>
    `

}
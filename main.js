import { Astar, bfs , dfs} from "./searchAlgorithms.js";
import { FINAL, BLANK, PuzzleState } from "./puzzle_state.js";
import renderTree from "./renderTree.js";

let newstate = new PuzzleState(
    [['1', '2', '3'],
    ['4', BLANK, '6'],
    ['7', '5', '8']]
)

window.newstate = newstate;
window.renderTree = renderTree;

let otherstate = new PuzzleState(FINAL)

let another  = new PuzzleState(
    [['1', '2', '3', '4'],
    ['5', '6', '7', '8'],
    ['9', '10', '11', '12'],
    ['13', '14', '15', BLANK]]
)


const path = dfs(newstate);
renderTree(newstate, path)
console.log(newstate);
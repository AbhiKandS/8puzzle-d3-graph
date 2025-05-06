import { Astar, bfs , dfs} from "./searchAlgorithms.js";
import { FINAL, BLANK, PuzzleState } from "./puzzle_state.js";
import renderTree from "./renderTree.js";

let newstate = new PuzzleState(
    [['1', '2', '3'],
    ['4', BLANK, '6'],
    ['7', '5', '8']]
)

// window.newstate = newstate;
// window.renderTree = renderTree;

// let otherstate = new PuzzleState(FINAL)

// let another  = new PuzzleState(
//     [['1', '2', '3', '4'],
//     ['5', '6', '7', '8'],
//     ['9', '10', '11', '12'],
//     ['13', '14', '15', BLANK]]
// )

//TODO: print unsolved
//TODO: make drop down to select search algo
//TODO: display time
const solveStateElement = document.querySelector("#solved-state");

const dropdown = document.querySelector("#myDropdown")
dropdown.addEventListener("change", (event) => {
    if (solveStateElement)
        solveStateElement.innerHTML = `Solving...`;
    const algoMap = {
        "Astar": Astar,
        "bfs": bfs,
        "dfs": dfs
    };
    const searchAlgo = algoMap[event.target.value]

    newstate.children = [];
    console.log(event.target.value);
    const path = searchAlgo(newstate);
    renderTree(newstate, path);
})


if (solveStateElement)
    solveStateElement.innerHTML = `Solving...`;
const path = Astar(newstate);
renderTree(newstate, path)
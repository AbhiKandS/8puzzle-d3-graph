import { Astar, bfs , dfs} from "./searchAlgorithms.js";
import { MCTS } from "./mcts.js";
import { FINAL, BLANK, PuzzleState } from "./puzzle_state.js";
import renderTree from "./renderTree.js";
import { fillTable } from "./fillTable.js";

let newstate = new PuzzleState(
    [['1', '2', '3'],
    ['4', BLANK, '6'],
    ['7', '5', '8']]
)

const solveStateElement = document.querySelector("#solved-state");

const dropdown = document.querySelector("#myDropdown")
dropdown.addEventListener("change", (event) => {
    if (solveStateElement)
        solveStateElement.innerHTML = `Solving...`;
    const algoMap = {
        "Astar": Astar,
        "bfs": bfs,
        "dfs": dfs,
        "MCST" : MCTS
    };
    const searchAlgo = algoMap[event.target.value]

    newstate.children = [];
    console.log(event.target.value);
    const path = searchAlgo(newstate);

    if (event.target.value == "dfs")
        renderTree(newstate, path, true);
    else
        renderTree(newstate, path);
})


if (solveStateElement)
    solveStateElement.innerHTML = `Solving...`;
const path = Astar(newstate)[0];
renderTree(newstate, path)

fillTable(newstate);
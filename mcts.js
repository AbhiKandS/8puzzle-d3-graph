import {PuzzleState, FINAL, BLANK, MOVES} from "./puzzle_state.js"; // Ensure MOVES and BLANK are exported from puzzle_state.js

// --- Helper functions for Monte Carlo Tree Search (MCTS) ---

/**
 * Calculates the Upper Confidence Bound 1 applied to trees (UCT) value for a child node.
 * UCT is used to balance exploration of less visited nodes and exploitation of nodes
 * that have shown good results in simulations.
 *
 * UCT = (winScore / visitCount) + explorationParameter * sqrt(ln(parentNode.visitCount) / visitCount)
 *
 * @param {PuzzleState} parentNode The parent node.
 * @param {PuzzleState} childNode The child node.
 * @param {number} explorationParameter A parameter to tune the balance between exploration and exploitation (commonly sqrt(2)).
 * @returns {number} The UCT value for the child node. Returns Infinity if the child has not been visited to prioritize exploration.
 */
function calculateUCT(parentNode, childNode, explorationParameter = 1.4) {
    // Prioritize unvisited nodes
    if (childNode.visitCount === 0) {
        return Infinity;
    }
    // Win rate: proportion of rollouts from this node that reached the goal.
    const winRate = childNode.winScore / childNode.visitCount;
    // Exploration term: encourages visiting nodes with fewer visits relative to their parent.
    const explorationTerm = explorationParameter * Math.sqrt(Math.log(parentNode.visitCount) / childNode.visitCount);
    return winRate + explorationTerm;
}

/**
 * Selects the best child node to explore from the current node based on the UCT policy.
 * Assumes the children of the node have already been generated (expanded).
 *
 * @param {PuzzleState} node The current node.
 * @param {number} explorationParameter The exploration parameter for the UCT calculation.
 * @returns {PuzzleState | null} The selected child node, or null if no children exist or can be selected.
 */
function selectMCTSNode(node, explorationParameter) {
    let bestChild = null;
    let bestUctValue = -Infinity;

    // Ensure children have MCTS properties initialized
     for (const child of node.children) {
          if (child.visitCount === undefined) child.visitCount = 0;
          if (child.winScore === undefined) child.winScore = 0;
     }

    for (const child of node.children) {
        const uctValue = calculateUCT(node, child, explorationParameter);
        if (uctValue > bestUctValue) {
            bestUctValue = uctValue;
            bestChild = child;
        }
    }
    return bestChild;
}

/**
 * Performs a random rollout (simulation) from a given puzzle state until a terminal state
 * is reached (goal state) or a maximum depth is exceeded.
 *
 * @param {PuzzleState} state The state to start the rollout from.
 * @param {number} maxDepth The maximum number of random moves in the rollout to prevent infinite loops.
 * @returns {boolean} True if the goal state was reached during the rollout, false otherwise.
 */
function performRollout(state, maxDepth = 500) {
    // Create a deep copy of the state grid to simulate on without modifying the original tree node
    let currentGrid = structuredClone(state.grid);
    let [holeRow, holeCol] = [state.holeRow, state.holeCol];

    let depth = 0;
    const movesList = Object.keys(MOVES);
    const isValid = (r, c) => r >= 0 && r < 3 && c >= 0 && c < 3; // Assuming 3x3 grid for 8-puzzle

    while (depth < maxDepth) {
        // Check if the current state in the simulation is the goal state
        let isGoalStateSimulation = true;
        for(let i = 0; i < FINAL.length; i++) {
            for (let j = 0; j < FINAL[i].length; j++) {
                if (currentGrid[i][j] !== FINAL[i][j]) {
                    isGoalStateSimulation = false;
                    break;
                }
            }
            if (!isGoalStateSimulation) break;
        }

        if (isGoalStateSimulation) {
            return true; // Goal reached in simulation
        }

        // Get possible moves from the current simulation state
        const possibleMoves = [];
        if (isValid(holeRow - 1, holeCol)) possibleMoves.push('U');
        if (isValid(holeRow + 1, holeCol)) possibleMoves.push('D');
        if (isValid(holeRow, holeCol - 1)) possibleMoves.push('L');
        if (isValid(holeRow, holeCol + 1)) possibleMoves.push('R');

        // If no moves are possible (should only happen at goal or in a blocked state), break
        if (possibleMoves.length === 0) break;

        // Choose a random valid move
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        // Apply the random move to the simulation grid
        const [dr, dc] = MOVES[randomMove];
        const newRow = holeRow + dr;
        const newCol = holeCol + dc;

        // Swap blank and the tile
        currentGrid[holeRow][holeCol] = currentGrid[newRow][newCol];
        currentGrid[newRow][newCol] = BLANK;

        // Update hole position for the simulation
        holeRow = newRow;
        holeCol = newCol;

        depth++;
    }

    // Check goal state one last time after the loop in case maxDepth was reached just before solving
     let isGoalStateSimulation = true;
     for(let i = 0; i < FINAL.length; i++) {
         for (let j = 0; j < FINAL[i].length; j++) {
             if (currentGrid[i][j] !== FINAL[i][j]) {
                 isGoalStateSimulation = false;
                 break;
             }
         }
         if (!isGoalStateSimulation) break;
     }
     return isGoalStateSimulation;
}

/**
 * Backpropagates the result of a rollout up the tree from the node where the rollout started
 * to the root. Updates visit counts and win scores along the path.
 *
 * @param {PuzzleState[]} nodesInPath An array of nodes visited during the selection and expansion phases of the MCTS iteration, from root to the rollout start node.
 * @param {boolean} rolloutResult True if the rollout reached the goal state, false otherwise.
 */
function backpropagate(nodesInPath, rolloutResult) {
    for (const node of nodesInPath) {
        node.visitCount++;
        if (rolloutResult) {
            node.winScore++; // Increment win score if the rollout was successful (reached the goal)
        }
    }
}

/**
 * Solves the 8-puzzle problem using an iterative Monte Carlo Tree Search (MCTS) approach.
 * At each step of the main search, MCTS simulations are run from the current state to determine
 * the best next move. The process repeats until the goal state is reached or a limit is hit.
 *
 * @param {PuzzleState} initialState The starting puzzle state.
 * @param {number} numMCTSIterations The number of MCTS simulation iterations to run at each step of the main search. More iterations improve decision making but take longer.
 * @param {number} explorationParameter The exploration parameter (C) for the UCT calculation. Controls the balance between exploration and exploitation in MCTS.
 * @param {number} maxRolloutDepth The maximum depth for random rollouts during the simulation phase of MCTS. Prevents infinite rollouts.
 * @param {number} maxSearchSteps The maximum number of moves in the overall search path. Prevents infinite loops in the main search.
 * @returns {string | boolean} The sequence of moves ('U', 'D', 'L', 'R') as a string to reach the goal, or false if a solution is not found within the limits.
 */
export function MCTS(initialState, numMCTSIterations = 10000, explorationParameter = 1.4, maxRolloutDepth = 500, maxSearchSteps = 100) {
    const start = performance.now('MCTS');
    let currentState = initialState;
    let path = "";
    const visitedStates = new Set(); // Tracks visited *grid configurations* in the overall search path

    // Ensure the initial state node has MCTS statistics properties
    if (currentState.visitCount === undefined) currentState.visitCount = 0;
    if (currentState.winScore === undefined) currentState.winScore = 0;

    // Main search loop: Repeat MCTS at each step to find the best next move until the goal is reached.
    for (let step = 0; step < maxSearchSteps && !currentState.isGoalState(); step++) {
        const stateIdentifier = JSON.stringify(currentState.grid);
        if (visitedStates.has(stateIdentifier)) {
            console.log("MCTS Search: Cycle detected or already explored this state. Stopping.");
            currentState.unsolved(); // Mark the current state as unsolved if stuck
            return false; // Indicate failure to find a solution within the maximum search steps
        }
        visitedStates.add(stateIdentifier);

        // Run MCTS simulation iterations from the current state to gather statistics
        for (let i = 0; i < numMCTSIterations; i++) {
            let nodeForIteration = currentState; // Start the MCTS iteration from the current actual puzzle state
            const visitedNodesInIteration = [nodeForIteration]; // Track path in the MCTS *tree* for backpropagation

            // 1. Selection: Traverse down the tree based on UCT until an unvisited child or a leaf node is found.
            while (nodeForIteration.children && nodeForIteration.children.length > 0) {
                 // Ensure children have MCTS stats
                 for(const child of nodeForIteration.children) {
                      if (child.visitCount === undefined) child.visitCount = 0;
                      if (child.winScore === undefined) child.winScore = 0;
                 }

                 // If there's an unvisited child, select it immediately for exploration.
                 const unvisitedChild = nodeForIteration.children.find(child => child.visitCount === 0);
                 if (unvisitedChild) {
                     nodeForIteration = unvisitedChild;
                     visitedNodesInIteration.push(nodeForIteration);
                     break; // Move to Expansion/Simulation phase with this unvisited node
                 } else {
                      // If all children have been visited, select the best child based on UCT
                      let nextNode = selectMCTSNode(nodeForIteration, explorationParameter);

                      // If a child was selected, move to it. If not (shouldn't happen if children exist), break.
                      if (nextNode) {
                          nodeForIteration = nextNode;
                          visitedNodesInIteration.push(nodeForIteration);
                      } else {
                           break; // Should not happen in a well-defined puzzle state space
                      }
                 }
            }

            // 2. Expansion: If the selected node is not terminal and hasn't been expanded yet in this MCTS iteration, expand it.
            // In this iterative MCTS approach, we expand the children of the `currentState` node and its successors as needed within the MCTS iterations.
             if (!nodeForIteration.isGoalState() && nodeForIteration.children.length === 0) {
                 nodeForIteration.expandChildren(); // Generate possible next states (children)

                 // After expansion, select one of the newly generated children (if any) for the rollout.
                 // A common strategy is to pick one of the new children to start the simulation from.
                  if (nodeForIteration.children.length > 0) {
                       // Simple approach: pick the first newly expanded child
                      nodeForIteration = nodeForIteration.children[0];
                      visitedNodesInIteration.push(nodeForIteration);
                  }
                  // If no children were generated (unlikely unless it was already a terminal state, checked above),
                  // the rollout will start from the `nodeForIteration` itself.
             }


            // 3. Simulation (Rollout): Perform a random playout from the current `nodeForIteration`.
            const rolloutResult = performRollout(nodeForIteration, maxRolloutDepth);

            // 4. Backpropagation: Update the statistics (visit counts and win scores) of the nodes
            // along the path from the rollout start node back up to the root of this MCTS iteration (which is `currentState`).
            backpropagate(visitedNodesInIteration, rolloutResult);
        }

        // After running the MCTS iterations from the current state, decide the best move
        // to make in the actual puzzle by examining the children of `currentState`.
        let bestNextState = null;
        let bestMetric = -1; // Use win rate as the primary metric

        // Ensure the children of the current state are expanded so we have options to choose from
        if (currentState.children.length === 0) {
            currentState.expandChildren();
        }

        // Select the child with the highest win rate. As a tie-breaker or fallback, use visit count.
        for (const child of currentState.children) {
            // Ensure child has MCTS properties
             if (child.visitCount === undefined) child.visitCount = 0;
             if (child.winScore === undefined) child.winScore = 0;

            // Calculate the metric (win rate) for the child. Handle the case of 0 visits.
            const currentMetric = child.visitCount > 0 ? child.winScore / child.visitCount : 0;

            if (currentMetric > bestMetric) {
                bestMetric = currentMetric;
                bestNextState = child;
            } else if (currentMetric === bestMetric) {
                // Tie-breaking: if win rates are equal, prefer the node with more visits as it's more explored.
                if (child.visitCount > (bestNextState ? bestNextState.visitCount : -1)) {
                     bestNextState = child;
                }
            }
        }

        // If no next state was selected after MCTS iterations, it indicates a problem
        // (e.g., no children, or MCTS couldn't find any promising moves).
        if (bestNextState === null) {
             console.log("MCTS Search: Failed to select a next state after iterations. Stopping.");
             currentState.unsolved();
             return false; // Indicate that a solution was not found
        }

        // Append the chosen move to the overall path and update the current state for the next step of the main search.
        const move = bestNextState.id.replace(currentState.id, ''); // Extract the move character from the ID difference
        path += move;
        currentState = bestNextState; // Move to the selected best state

        // The MCTS statistics (visitCount, winScore) are stored directly on the PuzzleState objects.
        // When we set currentState to bestNextState, the accumulated stats for that state are carried over
        // to the next iteration of the main search loop, allowing MCTS to build upon prior exploration.
    }

    // If the loop finishes, the goal state has been reached.
    const end = performance.now('MCTS');
    const time = (end - start).toFixed(2);
    currentState.solved(visitedStates.size, time); // visitedStates counts the unique puzzle grid states visited in the overall path
    return path; // Return the sequence of moves that leads to the solution
}

// Keep other search algorithms (Astar, bfs, dfs) if they are part of the file
// import MinHeap from "./minHeap.js"; // Keep if Astar is present

// export function Astar(puzzleState) { ... }
// export function bfs(puzzleState) { ... }
// export function dfs(puzzleState=new PuzzleState(FINAL), visited=new Set(), start=performance.now('dfs')) { ... }
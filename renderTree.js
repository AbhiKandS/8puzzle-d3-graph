import "./d3.v7.min.js";

function getHighlightIDs(data, pathToSolution) {
    let IDs = 'root' + pathToSolution;
    const highlightedIDs = new Set();

    while (IDs !== 'root') {
        highlightedIDs.add(IDs)
        IDs = IDs.slice(0,-1);
    }
    return highlightedIDs
}

export default function renderTree(data, pathToSolution='', isDfs=false) {
    const container = d3.select("#tree-container");
    const svg = container.select("#tree");
    const root = d3.hierarchy(data);

    const highlightedIDs = getHighlightIDs(data, pathToSolution) ;


    const maxDepth = root.height + 1;
    const numNodes = root.descendants().length;
    const nodeWidth = (isDfs) ? 35 : 100;
    const nodeHeight = 150;
    const hSpacing = nodeWidth * 1.5;
    const vSpacing = nodeHeight * 2;
    const treeWidth = numNodes * hSpacing;
    const treeHeight = maxDepth * vSpacing;


    container
        .style("width", `${treeWidth}px`)
        .style("height", `${treeHeight}px`);

    svg.attr("width", treeWidth)
        .attr("height", treeHeight);
    const treeLayout = d3.tree().size([treeWidth - 100, treeHeight - 110]);
    treeLayout(root);

    const link = svg.selectAll('line')
        .data(root.links())
        .join('line')
        .attr('x1', d => d.source.x + nodeWidth / 1.20)
        .attr('y1', d => d.source.y + nodeHeight / 3)
        .attr('x2', d => d.target.x + nodeWidth / 1.20)
        .attr('y2', d => d.target.y + nodeHeight / 3)
        .attr('stroke', d => {
            return (highlightedIDs.has(d.target.data.id)) ? 'red' : '#555';
        })
        .attr('stroke-width', d => {
            return (highlightedIDs.has(d.target.data.id)) ? 3 : 1.5;
        });

    const linkLabels = svg.selectAll('.link-label')
        .data(root.links().filter(d => highlightedIDs.has(d.target.data.id)))
        .join('text')
        .attr('class', 'link-label')
        .attr('x', d => (d.source.x + nodeWidth/ 1.5 + d.target.x + nodeWidth) / 2)
        .attr('y', d => (d.source.y + nodeHeight / 1.5 + d.target.y + nodeHeight / 3) / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .style('fill', 'red')
        .style('font-size', '50px')
        .text(d => {
            let targetID = d.target.data.id;
            let targetMove = targetID[targetID.length - 1];
            return targetMove;
        });


    const nodes = container.selectAll('.node-html-container')
        .data(root.descendants())
        .join('div')
        .attr('class', 'node-html-container')
        .style('left', d => `${d.x}px`)
        .style('top', d => `${d.y}px`)
        .html( d => d.data.htmlName);

    console.log('done');
}
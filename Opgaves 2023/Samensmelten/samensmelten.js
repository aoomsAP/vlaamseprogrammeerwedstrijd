const ll = require('lazylines');

process.stdin.resume();
const input = new ll.LineReadStream(process.stdin);

let testsAmount = 0;
let tests = [];

let totalRows = null;
let grid = [];
let numberOfSteps = null;
let steps = [];

input.on('line', (l) => {
    let line = ll.chomp(l);

    if (testsAmount == 0) {
        // first line: amount of tests
        testsAmount = +line;
    }
    else if (totalRows == null) {
        // line: total rows, total columns
        totalRows = +line.split(" ")[0];
    }
    else {
        if (grid.length != totalRows) {
            // line: grid row
            const row = line.split("").map(x => ({ value: x, visited: false }))
            grid.push(row);
        }
        else {

            if (numberOfSteps == null) {
                // line: number of steps
                numberOfSteps = +line;
            }
            else {
                // line: step
                steps.push({
                    rowIndex: +line.split(" ")[0] - 1,
                    columnIndex: +line.split(" ")[1] - 1,
                    type: line.split(" ")[2]
                })

                if (steps.length == numberOfSteps) {
                    // test done
                    tests.push({
                        grid: grid,
                        steps: steps,
                    })

                    // reset values
                    totalRows = null;
                    grid = [];
                    numberOfSteps = null;
                    steps = [];
                    testsAmount--;
                }
            }
        }
    }

    if (testsAmount == 0) process.exit();
});

// calculation
function markIsland(step, grid) {
    let x = step.columnIndex;
    let y = step.rowIndex;
    const groupValue = grid[y][x].value;

    // fucking dfs (depth first search)
    function dfs(y, x) {
        if (
            y >= 0 &&
            x >= 0 &&
            y < grid.length &&
            x < grid[0].length &&
            grid[y][x].value === groupValue &&
            grid[y][x].visited === false
        ) {
            grid[y][x].visited = true;
            dfs(y, x - 1); // left
            dfs(y, x + 1); // right
            dfs(y - 1, x); // up
            dfs(y + 1, x); // down
        }
    }
    dfs(y, x);

    return grid;
}

function calculateStep(grid, step) {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {

            // only change values of cells that have been marked as visited
            if (grid[y][x].visited == true) {

                // increase or decrease hex value

                // for decimal
                if (/\d/.test(grid[y][x].value)) {
                    if (step.type === "+") {
                        // if value is 9, next hex value is "A"
                        if (grid[y][x].value === "9") {
                            grid[y][x].value = "A";
                        }
                        // if not, increase decimal
                        else {
                            grid[y][x].value = (parseInt(grid[y][x].value) + 1).toString();
                        }
                    }
                    else {
                        // don't decrease/change if value is "0"
                        if (grid[y][x].value != "0") grid[y][x].value = (parseInt(grid[y][x].value) - 1).toString();
                    }
                }

                // for letter
                else {
                    if (step.type === "+") {
                        // don't increase+change if value is "F"
                        if (grid[y][x].value != "F") grid[y][x].value = String.fromCharCode(grid[y][x].value.charCodeAt(0) + 1);
                    }
                    else {
                        // if value is "A", previous hex value is "9"
                        if (grid[y][x].value === "A") {
                            grid[y][x].value = "9";
                        }
                        // if not, decrease hex value
                        else {
                            grid[y][x].value = String.fromCharCode(grid[y][x].value.charCodeAt(0) - 1);
                        }
                    }
                }
                grid[y][x].visited = false;
            }
        }
    }

    return grid;
}

process.on('exit', () => {
    tests.forEach((test, testIndex) => {
        // refactor grid
        test.steps.forEach(step => {

            // mark cells as visited
            test.grid = markIsland(step, test.grid);

            // refactor grid for given step
            test.grid = calculateStep(test.grid, step);
        })

        // index (1) + each line of grid
        test.grid.forEach(line => {
            console.log(`${testIndex + 1} ${line.map(x => x.value).join("")}`);
        })
    })
});
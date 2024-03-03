const fs = require('fs');

const input = fs.readFileSync("wedstrijd.invoer", "utf8");
const lines = input.split("\n").filter(x => x != "");

let testsAmount = 0;
let tests = [];
let numberOfVisitors = -1;
let visitors = [];

for (let l of lines) {
    let line = l.replace("\n", "").replace("\r", "");

    if (testsAmount == 0) {
        testsAmount = +line;
    }
    else if (numberOfVisitors == -1) {
        numberOfVisitors = +line;
    }
    else {
        visitors = line.split(" ").map(x => +x);

        // ---------- end of test
        // push current values to tests
        tests.push({
            numberOfVisitors: numberOfVisitors,
            visitors: visitors,
        })

        // reset values
        numberOfVisitors = -1;
        visitors = [];
        testsAmount--;
    }
};

function formatDecimalAsSmallestFraction(finalDiscount) {
    // greatest commmon divisor function
    const greatestCommonDivisor = (a, b) => {
        if (!b) return a;
        return greatestCommonDivisor(b, a % b);
    }
    // turn discount decimal into an integer by multiplying by 10
    let denominator = Math.pow(10, finalDiscount.toString().length - 2);
    // get numerator by multiplying decimal with denominator
    let numerator = finalDiscount * denominator;
    // calculate greatest common divisor
    let divisor = greatestCommonDivisor(numerator, denominator);
    // divide numerator and denominator by greatest common divisor
    return `${numerator / divisor}/${denominator / divisor}`;
}

let output = "";

tests.forEach((test, testIndex) => {

    if (testIndex == 80) {
        console.log();
    }

    // all unique visitors
    let allVisitors = new Set([...test.visitors].sort((a, b) => a - b));

    // for each unique visitor
    for (let [visitorIndex, visitor] of allVisitors.entries()) {
        // get index of arrival and index of leaving
        let arrival = test.visitors.indexOf(visitor);
        let leaving = test.visitors.indexOf(visitor, arrival + 1);

        // how many visitors are at restaurant at time of arrival
        let trafficAtArrival = test.visitors.slice(undefined, arrival);
        let visitorsAtArrival = [];
        let uniqueVisitors = new Set(trafficAtArrival);
        // for each unique visitor at the time of arrival,
        // check whether they appear only once or twice in the traffic
        // if they appear twice, it means they already left
        // and are not part of the current visitors at time of arrival
        [...Array.from(uniqueVisitors)].forEach((prevVisitor) => {
            if (!trafficAtArrival.slice(trafficAtArrival.indexOf(prevVisitor) + 1).includes(prevVisitor)) {
                visitorsAtArrival.push(prevVisitor);
            }
        })
        let currentVisitors = visitorsAtArrival.length;

        // discount logic = 1/(Math.pow(2,currentVisitors)
        let discount = 0;

        let visitorsAfterArrival = [];
        // add new discount for each new visitor, until current visitor leaves
        for (let i = arrival + 1; i < leaving; i++) {

            // if next visitor is current visitor, it means current visitor is leaving
            if (test.visitors[i] == visitor) {
                break;
            }

            // if next visitor is included in the visitors at arrival,
            // or next visitor is included in the visitors after arrival,
            // it means this visitor is not newly arriving,
            // but that this visitor is leaving (and should be excluded from count)
            let newVisitor = !visitorsAtArrival.includes(test.visitors[i])
                && !visitorsAfterArrival.includes(test.visitors[i]);

            if (newVisitor) {
                // add new visitor to current visitors
                currentVisitors++;
                visitorsAfterArrival.push(test.visitors[i]);

                // add discount
                discount += 1 / (Math.pow(2, currentVisitors));
            }
            else {
                // if it's not a new visitor, it's a visitor that is leaving
                // so currentVisitors should be reduced
                currentVisitors--;
            }
        }

        // discount amount has a cap of 73/100
        let finalDiscount = Math.min(discount, (73 / 100));

        // format discount in smallest possible fraction
        let fraction = formatDecimalAsSmallestFraction(finalDiscount);

        // output discount for each visitor in a test
        if (finalDiscount == 0) output += `${testIndex + 1} ${visitorIndex} ${finalDiscount}\n`;
        else output += `${testIndex + 1} ${visitorIndex} ${fraction}\n`;
    }
});

fs.writeFileSync("output_wedstrijd.txt", output, "utf8");
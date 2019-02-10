//require fs to read txt file
const fs = require('fs');
//define a global value that hold chosen paint types
let finalPaintTypes = [];

//make sure you are passing a file
if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' FILENAME');
    process.exit(1);
}
// Read the file.
filename = process.argv[2];
fs.readFile(filename, 'utf8', function (err, data) {
    if (err) throw err;
    let parsedFile = parseTheInputFile(data);
    let parsedCustomers = parseCustomers(parsedFile.lines);
    createBatches(parsedCustomers, parsedFile.numberOfPaints);
});


function parseTheInputFile(string) {
    //upcase the string then split string into lines
    let lines = string.toUpperCase().split(/\r?\n/);
    //remove white spaces for each line
    lines = lines.map(x => x.replace(/\s/g, ""));
    // verify that number of paints is an int
    const numberOfPaints = parseInt(lines[0]);
    if (!Number.isInteger(numberOfPaints)) {
        console.log("Please make sure that the first line is number");
    }
    return {lines: lines, numberOfPaints: numberOfPaints};
}


//Parse Customers
function parseCustomers(lines) {
    let Customers = [];
    for (let i = 1; i < lines.length; i++) {
        parseCustomer(lines[i], Customers);
    }
    return Customers;
}

// Parse Customer String and put it in an Array
function parseCustomer(data, customers) {
    let colors = data.split("");
    let customer = [];
    for (let i = 0; i < colors.length; i += 2) {

        let color = parseInt(colors[i]);
        let paintType = colors[i + 1];
        customer.push({color: color, paintType: paintType});
    }
    customers.push(customer);
}


//================================================
function createBatches(customers, numberOfPaints) {

    // sort with customers with lowest number of paints
    customers = customers.sort((a, b) => a.length - b.length);

    for (let customer of customers) {
        if (customer.length === 1) {
            let finalPaintType = ChoosePaintTypeForCustomer(customer, null);
            if (!finalPaintType) {
                return "No solution exists";
            }
            finalPaintTypes.push(finalPaintType);
        } else {

            // if the customer has more paint than one then we fill the array with a paint or null
            let possiblePaints = [];
            let finalPaintType = ChoosePaintTypeForCustomer(customer, possiblePaints);

            // there is a paint already which satisfy the customer
            if (finalPaintType) continue;
            // all the paint preferences of this customer is in conflict
            else if (possiblePaints.length === 0) return "No solution exists";


            //We pick paint with type of gloss from possible of paints if there isn't any then we pick the first type
            let paintToSelect = possiblePaints[0];
            for (let paint of possiblePaints) {
                if (paint.paintType === 'G') {
                    paintToSelect = paint;
                }
            }

            finalPaintTypes.push(paintToSelect);
        }
    }
    console.log(outputTheResult(finalPaintTypes, numberOfPaints))
}


function ChoosePaintTypeForCustomer(customer, possiblePaints) {
    for (let paint of customer) {
        let finalPaintType = finalPaintTypes.find(x => x.color === paint.color);

        if (customer.length === 1) {
            if (!finalPaintType || finalPaintType.paintType === paint.paintType) {
                // either the paintType is the same preferred type of the customer or there isn't any
                return paint;
            } else {
                // this color already have paint type
                return null;
            }
        } else {
            if (!finalPaintType) {
                //this color doesn't have paint type let's add it to the possible list of paints
                possiblePaints.push(paint);
            } else if (finalPaintType.paintType === paint.paintType) {
                // Found one of the customer preferred paint type so we return the result
                return paint;
            }
        }
    }

    // customer had several preferred paints and we didn't find a match so we return null
    return null;
}

function outputTheResult(FinalPaints, numberOfPaints) {
    let output = '';
    if (FinalPaints !== "No solution exists") {
        for (let i = 1; i <= numberOfPaints; i++) {
            let paint = FinalPaints.find(x => x.color === i);
            if (!paint) {
                // we have more colors than customers so make batch of GLOSS as MATTE is more expensive
                paint = {...paint, paintType: 'G'};
            }
            output += ' ' + paint.paintType;
        }
        return output;
    } else {
        return output = "No solution exists";
    }

}

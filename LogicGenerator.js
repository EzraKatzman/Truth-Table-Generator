//Each of the logical connective buttons calls 2 functions. One if clicked and one on hover.
window.onload = function() {
    $("Not").observe("click", addOperator);
    $("And").observe("click", addOperator);
    $("Or").observe("click", addOperator);
    $("Implies").observe("click", addOperator);
    $("Iff").observe("click", addOperator);
    $("Xor").observe("click", addOperator);
    tooltipInit();
//Alternate way to insert the logical connectives
    $("proposition").observe("keyup", alternateAddOperator);
//The evaluate and clear buttons call their respective function 
    $("evaluate").observe("click", expressionCheck);
    $("clear").observe("click", clearInput);
}

//This function adds the special operators to the input string based on which button was pressed.
function addOperator() {
    var text = $("proposition");
    text.focus();
    var success = document.execCommand('insertText', false, this.innerHTML);
    //For firefox and old versions of IE
    if (!success) {
        text.setRangeText(this.innerHTML);
    }
}

//Adds tooltips to all the buttons and to the words "logical connectives" Courtesy of "All Things Javascript, LLC" Youtube channel
function tooltipInit() {
    var tooltip = "",
        toolTipDiv = document.querySelector(".div-tooltip"),
        toolTipElements = Array.from(document.querySelectorAll(".hover-reveal")),
        timer;

    toolTipElements.forEach((elem) => {
        var timeout;
        elem.addEventListener("mouseenter", (e) => {
            timeout = setTimeout(function() {
                displayToolTip.call(elem, e);
            }, 300);
        }); 
        elem.addEventListener("mouseleave", () => {
            clearTimeout(timeout);
            fadeOut(toolTipDiv);
        });
    });
    
    //An arrow function cannot be used here because arrow functions change the nature of the "this" keyword
    var displayToolTip = function(e) {
        tooltip = this.dataset.tooltip;
        toolTipDiv.innerHTML = tooltip;
        toolTipDiv.style.top = e.pageY + "px";
        toolTipDiv.style.left = e.pageX + "px";
        fadeIn(toolTipDiv);
    };
    //fades in the tooltip
    var fadeIn = () => {
        var op = 0.1;
        toolTipDiv.style.display = "block";
        var timer = setInterval(() => {
            if (op >= 1){
                clearInterval(timer);
            }
            toolTipDiv.style.opacity = op;
            op += op * 0.1;
        }, 10);
    };
    //fades out the tooltip
    var fadeOut = () => {
        var op = 1;
        if(!timer){
            timer = setInterval(() => {
                if (op <= 0.1){
                    clearInterval(timer);
                    timer = null;
                    toolTipDiv.style.opacity = 0;
                    toolTipDiv.style.display = "none";
                }
                toolTipDiv.style.opacity = op;
                op -= op * 0.1;
            }, 10);
        }    
    };
}

//Adds the ability to type in the name of the operator instead of using the button
function alternateAddOperator() {
    var text = $("proposition").value,
        connectives = ["not", "and", "or", "implies", "iff", "xor"],
        replacement = ["\u00AC", "\u02C4", "\u02C5", "\u2192", "\u2194", "\u2295"];
    for (var i = 0; i < connectives.length; i++) {
        if (text.includes(connectives[i])) {
            var segment = text.substr(text.search(connectives[i]), connectives[i].length),
                textOut = text.replace(segment, replacement[i]);
            $("proposition").value = textOut;
        }
    }
}

//Clears the input and result table
function clearInput() {
    var text = $("proposition");
    text.value = "";
    var chartDisplay = $("resultTable");
    if (chartDisplay.children.length !== 0) {
        chartDisplay.removeChild(chartDisplay.children[0]);
    }
}

// This function checks to see if the function has any unrecognized characters. Recognized characters are limited to all letters in the alphabet,
// the logical connectives, and opening/closing parenthesis.
// After looping throught the input string, the function checks to see if the inputted formula is a well formed formula using the theorem:
// "number of opening brackets == (number of variables + number of negations - 1)". If it is a well formed formula the next function is called.
function expressionCheck() {
    var testString = $("proposition").value,
        rightBracket = 0,
        leftBracket = 0,
        negateCount = 0,
        variables = 0,
        pass = true;

    testString = testString.replace(/\s/g, '');

    for (var i = 0; i < testString.length; i++) { 
        if (testString.charAt(i).match(/\u0028/)) {
            leftBracket = leftBracket + 1;
            if (testString.charAt(i + 1).match(/\u0029/)) {
                pass = false;
            }
        } else if (testString.charAt(i).match(/\u00AC/)) {
            negateCount = negateCount + 1;
        } else if (testString.charAt(i).match(/[A-Za-z]/)) {
            variables = variables + 1;
        } else if (testString.charAt(i).match(/\u0029/)) {
            rightBracket = rightBracket + 1;
            if (testString.charAt(i + 1).match(/\u0028/)) {
                pass = false;
            }
        } else if (!(testString.charAt(i).match(/\u02C4/) || testString.charAt(i).match(/\u02C5/) || testString.charAt(i).match(/\u2192/) || testString.charAt(i).match(/\u2295/) || testString.charAt(i).match(/\u2194/))) {
            alert ("Unrecognized character " + testString.charAt(i));
        }
    }
    //WFF tests
    if ((testString.charAt(0).match(/\u0028/) || testString.charAt(0).match(/[A-Za-z]/))) {
        if (leftBracket == rightBracket) {
            if (leftBracket == negateCount + variables - 1) {
                if (pass == true) {
                    truthAssignments();
                } else {
                    alert("An operator is missing between two brackets");
                }
            } else {
                alert("This function is not a well formed formula");
            }
        } else {
            alert("There is an open set of brackets");
        }
    } else {
        alert("The function must start with either an open bracket or a variable");
    }
}

// This function creates an array of all the variables inputted by the user, then trims it down to find all the unique arrays,
// and will then give each variable their respective truth assignments
function truthAssignments() {
    //Searches for all variables (non operators) in the inputted proposition
    var varList = [],
        testString = $("proposition").value,
        i;
    for (i of testString) {
        if (i.match(/[A-Za-z]/)) {
            varList.push(i);
        }
    }
    //Skims through the array of all variables found from the input and removes duplicates
    var uniqueVars = [];
    for (i of varList) {
        if (uniqueVars.indexOf(i) === -1) {
            uniqueVars.push(i);
        }
    }
    //Initializes the result table
    var table = document.createElement("table");
    table.className = "table";
    tableBuilder(uniqueVars, testString, table);

    //Assigns true (0) and false (1) values for all unique variables taken from the input using the bitwise operator "&"
    var row = [];
    for (var k = (2 ** uniqueVars.length - 1); k >= 0; k--) {
        for (var j = (uniqueVars.length - 1); j >= 0; j--) {
            row[j] = (k & (2 ** j)) ? 0 : 1;
        }
        stringEvaluate(row, uniqueVars, table, varList);   
    }
}

function stringEvaluate(row, uniqueVars, table, varList) {
    var testString = $("proposition").value,
        n;
        
    testString = testString.replace(/\s/g, '');
    //Replaces all the inputted variables with their truth assignments
    for (n of testString) {
        if (uniqueVars.includes(n)) {
            var j = uniqueVars.indexOf(n); 
            testString = testString.replace(n, row[j]);
        }
    }
    //Search for operators, take the variables from either side and compare values, replace values + brackets with either 0 or 1 depending
    //on t/f result
    for (var m = 0 ; m <= varList.length ; m++) {
    //Locates the position of the first right bracket ")"
    var firstRight = testString.search(/\u0029/),
        bracketSibling = testString.lastIndexOf(testString.match(/\u0028/), firstRight),
        //Finds the left bracket compliment to the first right bracket, which in turn provides the first bracket set of the input
        operation = testString.slice(bracketSibling , firstRight + 1);
        //Evaluating the logical connectives
        for (var k = 1; k < operation.length; k++) {
            var operationIndex = operation.charAt(k),
                previousElement = operation.charAt(k - 1),
                nextElement = operation.charAt(k + 1);
            if(operationIndex.match(/\u00AC/)) {
                //"Negation" logic
                if (operation.charAt(k + 1) == 1) {
                    testString = testString.replace(operation, 0); 
                } else {
                    testString = testString.replace(operation, 1);
                }
            } else if (operationIndex.match(/\u02C4/)){
                //"And" logic
                if (previousElement == 0 && nextElement == 0) {
                    testString = testString.replace(operation, 0);
                } else {
                    testString = testString.replace(operation, 1);
                }
            } else if (operationIndex.match(/\u02C5/)){
                //"Or" logic
                if (previousElement == 0 || nextElement == 0) {
                    testString = testString.replace(operation, 0);
                } else {
                    testString = testString.replace(operation, 1);
                }
            } else if (operationIndex.match(/\u2192/)){
                //"Implies" Logic
                if (previousElement == 1 || nextElement == 0) {
                    testString = testString.replace(operation, 0);
                } else {
                    testString = testString.replace(operation, 1);
                }
            } else if (operationIndex.match(/\u2194/)){
                //"Biconditinal" Logic
                if (previousElement == nextElement) {
                    testString = testString.replace(operation, 0);
                } else {
                    testString = testString.replace(operation, 1);
                }
            } else if (operationIndex.match(/\u2295/)){
                //"Xor" Logic
                if (previousElement != nextElement) {
                    testString = testString.replace(operation, 0);
                } else {
                    testString = testString.replace(operation, 1);
                }
            }
            //future operators can go here
        }
    }
    resultTable(testString, uniqueVars, row, table);
}

//Builds the Header Row of the table which will contain a column for each unique variable and an additional one for the input
function tableBuilder(uniqueVars, testString, table) {
    var given = document.createElement("tr");
    given.className = "topRow";
    given.style.backgroundColor = "lightblue";
    for (var n = 0; n < uniqueVars.length; n ++) {
        var cell = document.createElement("th");
        cell.innerHTML = uniqueVars[n];
        given.appendChild(cell);
    }
    var propCell = document.createElement("th");
    propCell.innerHTML = testString;
    given.appendChild(propCell);
    //Adds row to table
    table.appendChild(given);
     
    var chartDisplay = $("resultTable");
    if (chartDisplay.children.length !== 0) {
        chartDisplay.removeChild(chartDisplay.children[0]);
    }
    chartDisplay.appendChild(table);
}

//Builds out each row of the table with the given T/F values for the variables and final result
//The ternary operators convert the O/1 to T/F
function resultTable(testString, uniqueVars, row, table) {
    var tableRow = document.createElement("tr");
    tableRow.className = "tableRow";
    table.style.backgroundColor = "white";
    for (var i = 0; i < uniqueVars.length; i++){
        var cell = document.createElement("td");
        cell.innerHTML = (row[i] == 0) ? "T" : "F";
        tableRow.appendChild(cell);
    }
    var resultCell = document.createElement("td");
    resultCell.innerHTML = (testString == 0) ? "T" : "F";
    tableRow.appendChild(resultCell);
    //Adds the row to the final table
    table.appendChild(tableRow);
}
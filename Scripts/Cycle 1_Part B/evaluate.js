const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const { spawnSync } = require('child_process');

function validateNames(folderName, fileName) {
    // Regular expression for the folder name
    const folderRegex = /^ASSGC\d_[A-Z]_B\d{2}\d{4}CS_CS\d{2}_[A-Z]+$/;

    // Regular expression for the file name
    const fileRegex = /^ASSGC\d_[A-Z]_B\d{2}\d{4}CS_CS\d{2}_[A-Z]+_\d\.c$/;

    // Test the folder name
    if (!folderRegex.test(folderName)) {
        return false;
    }

    // Test the file name
    if (!fileRegex.test(fileName)) {
        return false;
    }

    return true;
}

function main() {
    let qn = process.argv[2];
    let contentInDir = fs.readdirSync(__dirname);
    let cFilesFolder;
    for (let f of contentInDir) {
        if (f.startsWith("ASSG")) {
            const stats = fs.lstatSync(f);
            if (stats.isDirectory()) {
                cFilesFolder = f;
                break;
            }
        }
    }
    if (cFilesFolder == undefined) {
        console.error("No C files folder found");
        process.exit(1);
    }

    let Wrong = path.join(__dirname, 'WrongOutputs' + qn);
    let Correct = path.join(__dirname, 'CorrectOutputs' + qn);
    let ScriptReport = path.join(__dirname, 'ScriptReport.txt');
    fs.writeFileSync(ScriptReport, "");
    //After every run it will delete the previous files and create new files.
    if (fs.existsSync(Wrong)) {
        fs.rmSync(Wrong, { recursive: true });
    }
    fs.mkdirSync(Wrong);
    if (fs.existsSync(Correct)) {
        fs.rmSync(Correct, { recursive: true });
    }
    fs.mkdirSync(Correct);

    //Check if the folder exists
    try {
        fs.accessSync(qn);
    } catch (err) {
        console.error("Wrong Question Folder");
        fs.appendFileSync(ScriptReport, "Wrong Question Folder\n");
        process.exit(1);
    }


    let cFiles = fs.readdirSync(cFilesFolder);

    //it will work for only q0-q9.(Max 10 questions)
    let cFile = cFiles.find(f => f.endsWith(".c") && f[f.length - 3] === qn[qn.length - 1]);
    let result = validateNames(cFilesFolder, cFile);
    if (result) {
        console.log("\x1b[33m\x1b[1mValid folder and file names\x1b[0m\n");
        fs.appendFileSync(ScriptReport, "Valid folder and file names\n");
    }
    else {
        console.log("\x1b[91mInvalid folder or file names. Rename according to instructions given in the pdf.\n\x1b[0m");
        console.log("\x1b[91mBut our script will try to evaluate your code. If not worked, please rename and try again.\x1b[0m\n");
        fs.appendFileSync(ScriptReport, "Invalid folder or file names. Please do remember to keep the folder in this dir or if it is preesent with wrong name then rename the folder and file names as per the instructions given in the pdf.");
        fs.appendFileSync(ScriptReport, "But our script will try to evaluate your code. If not worked, please rename and try again.\n");
    }
    console.log("File : " + cFile);
    fs.appendFileSync(ScriptReport, "File : " + cFile + "\n");

    let pgmName = path.join(cFilesFolder, cFile);
    try {
        execSync(`gcc ${pgmName} -lm`);
    } catch (err) {
        console.error("\n\nCompilation Error!!!!.\n\n Not Compiled");
        fs.appendFileSync(ScriptReport, "Compilation Error!!!!.\n\n Not Compiled\n");
        process.exit(1);
    }

    let noOfTestCases = fs.readdirSync(qn).length / 2;
    let correct = [];
    let wrong = [];
    let noofInfinteLoops = 0;
    for (let f of fs.readdirSync(qn)) {
        let infinity = false;
        if (f.endsWith(".txt") && f.startsWith("in")) {
            let inputfile = path.join(qn, f);
            fs.copyFileSync(inputfile, "input.txt");
            if (!fs.readFileSync('input.txt', 'utf8')) {
                console.log("Input file is empty");
                fs.appendFileSync(ScriptReport, "Input file is empty\n");
                process.exit(1);
            }

            try {
                let start = Date.now();
                let child = spawnSync('sh', ['-c', './a.out <input.txt >output.txt'], { timeout: 2000 });

                if (child.error || child.signal === 'SIGTERM') {
                    infinity = true;
                    noofInfinteLoops++;

                    console.log("Might be an infinite loop . Please debug before running again");
                    console.error('The process was killed because it did not finish within 2000 ms \n');
                    console.log("Adjust time accordingly if 1000ms is not enough on line: 103 in evaluate.js\n\n");
                    console.error('\x1b[31m%s\x1b[0m', "Infinite loop may cause your system breakdown or crash. So please restart your system before executing script again.\n\n");
                    fs.appendFileSync(ScriptReport, "Might be an infinite loop . Please debug before running again\n");
                    fs.appendFileSync(ScriptReport, 'The process was killed because it did not finish within 2000 ms \n');
                    fs.appendFileSync(ScriptReport, "Adjust time accordingly if 1000ms is not enough on line: 103 in evaluate.js\n\n");
                    fs.appendFileSync(ScriptReport, "Infinite loop may cause your system breakdown or crash. So please restart your system before executing script again.\n\n");
                }

                let end = Date.now();
                let duration = end - start;
                console.log(`Execution time: \x1b[34m${duration} ms\x1b[0m`);
                fs.appendFileSync(ScriptReport, `Execution time: ${duration} ms\n`);

                let stats = fs.statSync("output.txt");
                let fileSizeInBytes = stats.size;
                console.log(`File size: \x1b[34m${fileSizeInBytes} Bytes\x1b[0m`);
                fs.appendFileSync(ScriptReport, `File size: ${fileSizeInBytes} Bytes\n`);

                if (fileSizeInBytes > 500 * 1024) {
                    console.log("Output file is too large. Consider deleting it.");
                    fs.appendFileSync(ScriptReport, "Output file is too large. Consider deleting it.\n");
                }
            } catch (err) {
                console.error(`Execution error for testcase #${f[f.length - 5]}: ${err}`);
                fs.appendFileSync(ScriptReport, `Execution error for testcase #${f[f.length - 5]}: ${err}\n`);
                process.exit(1);
            }
            //valid input file names are {in}+{randomtext}+{number}.txt
            let [testCaseNumber] = f.match(/\d+/g).map(Number);
            let correctOutput = fs.readFileSync(path.join(qn, `out${testCaseNumber}.txt`), 'utf8').trim();
            let yourOutput = fs.readFileSync("output.txt", 'utf8').trim();

            let proctxt = yourOutput.split('\n').map(line => line.trim()).join('\n');
            let cotxt = correctOutput.split('\n').map(line => line.trim()).join('\n');

            if (cotxt === proctxt) {
                console.log(`\x1b[32m\tTestcase #${testCaseNumber}: Correct\x1b[0m\n\n`); // Green for correct
                fs.appendFileSync(ScriptReport, `Testcase #${testCaseNumber}: Correct\n\n`);
                correct.push(testCaseNumber);
                let inputContent = fs.readFileSync("input.txt", "utf8");
                fs.appendFileSync(path.join(Correct, `TestCase-${testCaseNumber}.txt`), "Input:\n" + inputContent + "\n");
                fs.appendFileSync(path.join(Correct, `TestCase-${testCaseNumber}.txt`), "\nYour Output:\n");
                fs.appendFileSync(path.join(Correct, `TestCase-${testCaseNumber}.txt`), proctxt + "\n");
                fs.appendFileSync(path.join(Correct, `TestCase-${testCaseNumber}.txt`), "\n\nExpected Output:\n");
                fs.appendFileSync(path.join(Correct, `TestCase-${testCaseNumber}.txt`), cotxt);


                let content = fs.readFileSync(path.join(Correct, `TestCase-${testCaseNumber}.txt`), "utf8");
                fs.appendFileSync(ScriptReport, content);

            } else {
                if (infinity) {
                    console.log(`\x1b[31m\tTestcase #${testCaseNumber}: Wrong (Might be an infinite loop)\x1b[0m\n\n`); // Red for wrong
                    fs.appendFileSync(ScriptReport, `Testcase #${testCaseNumber}: Wrong (Might be an infinite loop)\n\n`);
                }
                else {
                    console.log(`\x1b[31m\tTestcase #${testCaseNumber}: Wrong\x1b[0m\n\n`); // Red for wrong
                    fs.appendFileSync(ScriptReport, `Testcase #${testCaseNumber}: Wrong\n\n`);
                }

                wrong.push(testCaseNumber);
                if (noofInfinteLoops > 1) {
                    console.error('\x1b[31m%s\x1b[0m', "Already 2 infinite loops are detected in these test cases. Please restart the computer and debug again or you  can use htop command please refer the documentation\n\n");
                    fs.appendFileSync(ScriptReport, "Already 2 infinite loops are detected in these test cases. Please restart the computer and debug again or you  can use htop command please refer the documentation\n\n");
                    fs.appendFileSync(ScriptReport, "Sorry to say but your two processors are using 100% because two infinte loops are running. So please restart your system and debug again or stop the process using htop command.Please google it .\n\n")
                    process.exit(1);
                }
                let inputContent = fs.readFileSync("input.txt", "utf8");
                fs.appendFileSync(path.join(Wrong, `TestCase-${testCaseNumber}.txt`), "Input:\n" + inputContent + "\n");
                fs.appendFileSync(path.join(Wrong, `TestCase-${testCaseNumber}.txt`), "\nYour Output:\n");
                fs.appendFileSync(path.join(Wrong, `TestCase-${testCaseNumber}.txt`), proctxt + "\n");
                fs.appendFileSync(path.join(Wrong, `TestCase-${testCaseNumber}.txt`), "\n\nExpected Output:\n");
                fs.appendFileSync(path.join(Wrong, `TestCase-${testCaseNumber}.txt`), cotxt);
                fs.appendFileSync(path.join(Wrong, `TestCase-${testCaseNumber}.txt`), "\n\\nExplanation Link(Hold Ctrl and Click)\n");
                fs.appendFileSync(path.join(Wrong, `TestCase-${testCaseNumber}.txt`), `https://github.com/nothuman2718/DSALab/blob/main/Test%20Cases/Cycle%201_Part%20B/Q${qn[1]}.md/#test-case-${testCaseNumber}`);
                let content = fs.readFileSync(path.join(Wrong, `TestCase-${testCaseNumber}.txt`), "utf8");
                fs.appendFileSync(ScriptReport, content);
            }
        }
    }

    correct.sort();
    wrong.sort();

    console.log(`\nCORRECT : \x1b[32m${correct.join(' ')}\x1b[0m`);
    fs.appendFileSync(ScriptReport, `CORRECT : ${correct.join(' ')}\n`);
    console.log(`WRONG   : \x1b[31m${wrong.join(' ')}\x1b[0m`);
    fs.appendFileSync(ScriptReport, `WRONG   : ${wrong.join(' ')}\n\n`);
    console.log(`\n\tPassed \x1b[34m${correct.length} / ${noOfTestCases}\x1b[0m\n`);
    fs.appendFileSync(ScriptReport, `\n\tPassed ${correct.length} / ${noOfTestCases}\n`);
    //Clean a.out and output.txt and input.txt
    if (fs.existsSync("a.out"))
        execSync("rm a.out");
    if (fs.existsSync("output.txt"))
        execSync("rm output.txt");
    if (fs.existsSync("input.txt"))
        execSync("rm input.txt");
}

main();

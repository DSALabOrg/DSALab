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
        console.log("Invalid folder name");
        return false;
    }

    // Test the file name
    if (!fileRegex.test(fileName)) {
        console.log("Invalid file name");
        return false;
    }

    return true;
}

function main() {
    let folder = process.argv[2];
    let files = fs.readdirSync(__dirname);
    let cFilesFolder;
    for (let f of files) {
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

    let Wrong = path.join(__dirname, 'WrongOutputs' + folder);
    let Correct = path.join(__dirname, 'CorrectOutputs' + folder);
    if (fs.existsSync(Wrong)) {
        fs.rmdirSync(Wrong, { recursive: true });
    }
    fs.mkdirSync(Wrong);
    if (fs.existsSync(Correct)) {
        fs.rmdirSync(Correct, { recursive: true });

    }
    fs.mkdirSync(Correct);
    try {
        fs.accessSync(folder);
    } catch (err) {
        console.error("Wrong Question Folder");
        process.exit(1);
    }


    let cFiles = fs.readdirSync(cFilesFolder);

    //it will work for only q0-q9.
    let cFile = cFiles.find(f => f.endsWith(".c") && f[f.length - 3] === folder[folder.length - 1]);
    let result = validateNames(cFilesFolder, cFile);
    if (result) {
        console.log("\x1b[33m\x1b[1mValid folder and file names\x1b[0m\n");
    }
    else {
        console.log("\x1b[91mInvalid folder or file names. Please do remember to keep the folder in this dir or if it is preesent with wrong name then rename the folder and file names as per the instructions given in the pdf.\n\x1b[0m");
        console.log("\x1b[91mBut our script will try to evaluate your code. If not worked, please rename and try again.\x1b[0m\n");
    }
    console.log("File : " + cFile);

    let pgmname = path.join(cFilesFolder, cFile);
    try {
        execSync(`gcc ${pgmname} -lm`);
    } catch (err) {
        console.error("\n\nCompilation Error!!!!.\n\n Not Compiled");
        process.exit(1);
    }

    let ntestcase = fs.readdirSync(folder).length / 2;
    let correct = [];
    let wrong = [];
    let noofInfinteLoops = 0;
    for (let f of fs.readdirSync(folder)) {
        let infinity = false;
        if (f.endsWith(".txt") && f.startsWith("in")) {
            let inputfile = path.join(folder, f);
            fs.copyFileSync(inputfile, "input.txt");
            if (!fs.readFileSync('input.txt', 'utf8')) {
                console.log("Input file is empty");
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
                }

                let end = Date.now();
                let duration = end - start;
                console.log(`Execution time: \x1b[34m${duration} ms\x1b[0m`);

                let stats = fs.statSync("output.txt");
                let fileSizeInBytes = stats.size;
                console.log(`File size: \x1b[34m${fileSizeInBytes} Bytes\x1b[0m`);

                if (fileSizeInBytes > 500 * 1024) {
                    console.log("Output file is too large. Consider deleting it.");
                }
            } catch (err) {
                console.error(`Execution error for testcase #${f[f.length - 5]}: ${err}`);
                process.exit(1);
            }
            //valid input file names are {in}+{randomtext}+{number}.txt
            let [testcaseno] = f.match(/\d+/g).map(Number);
            let outputf = fs.readFileSync(path.join(folder, `out${testcaseno}.txt`), 'utf8').trim();
            let outputf1 = fs.readFileSync("output.txt", 'utf8').trim();

            let proctxt = outputf1.split('\n').map(line => line.trim()).join('\n');
            let cotxt = outputf.split('\n').map(line => line.trim()).join('\n');

            if (cotxt === proctxt) {
                console.log(`\x1b[32m\tTestcase #${testcaseno}: Correct\x1b[0m`); // Green for correct
                correct.push(testcaseno);
                fs.writeFileSync(path.join(Correct, `TestCase:${testcaseno}.txt`), "");
                let inputContent = fs.readFileSync("input.txt", "utf8");
                fs.appendFileSync(path.join(Correct, `TestCase:${testcaseno}.txt`), "Input:\n" + inputContent + "\n");
                fs.appendFileSync(path.join(Correct, `TestCase:${testcaseno}.txt`), "\nYour Output:\n");
                fs.appendFileSync(path.join(Correct, `TestCase:${testcaseno}.txt`), proctxt + "\n");
                fs.appendFileSync(path.join(Correct, `TestCase:${testcaseno}.txt`), "\n\nExpected Output:\n");
                fs.appendFileSync(path.join(Correct, `TestCase:${testcaseno}.txt`), cotxt);
            } else {
                if (infinity)
                    console.log(`\x1b[31m\tTestcase #${testcaseno}: Wrong (Might be an infinite loop)\x1b[0m\n\n`); // Red for wrong
                else
                    console.log(`\x1b[31m\tTestcase #${testcaseno}: Wrong\x1b[0m\n\n`); // Red for wrong

                wrong.push(testcaseno);
                if (noofInfinteLoops > 1) {
                    console.error('\x1b[31m%s\x1b[0m', "Already 2 infinite loops are detected in these test cases. Please restart the computer and debug again or you  can use htop command please refer the documentation\n\n");
                    process.exit(1);
                }
                fs.writeFileSync(path.join(Wrong, `TestCase:${testcaseno}.txt`), "");
                let inputContent = fs.readFileSync("input.txt", "utf8");
                fs.appendFileSync(path.join(Wrong, `TestCase:${testcaseno}.txt`), "Input:\n" + inputContent + "\n");
                fs.appendFileSync(path.join(Wrong, `TestCase:${testcaseno}.txt`), "\nYour Output:\n");
                fs.appendFileSync(path.join(Wrong, `TestCase:${testcaseno}.txt`), proctxt + "\n");
                fs.appendFileSync(path.join(Wrong, `TestCase:${testcaseno}.txt`), "\n\nExpected Output:\n");
                fs.appendFileSync(path.join(Wrong, `TestCase:${testcaseno}.txt`), cotxt);
                fs.appendFileSync(path.join(Wrong, `TestCase:${testcaseno}.txt`), "Explanation Link(Hold Ctrl and Click)\n");
                fs.appendFileSync(path.join(Wrong, `TestCase:${testcaseno}.txt`), `https://github.com/nothuman2718/DSALab/blob/main/Test%20Cases/Cycle%201_Part%20A/Q${folder[1]}.md`)
            }
        }
    }

    correct.sort();
    wrong.sort();

    console.log(`\nCORRECT : \x1b[32m${correct.join(' ')}\x1b[0m`);
    console.log(`WRONG   : \x1b[31m${wrong.join(' ')}\x1b[0m`);
    console.log(`\n\tPassed \x1b[34m${correct.length} / ${ntestcase}\x1b[0m\n`);
    //Clean a.out and output.txt and input.txt
    if (fs.existsSync("a.out"))
        execSync("rm a.out");
    if (fs.existsSync("output.txt"))
        execSync("rm output.txt");
    if (fs.existsSync("input.txt"))
        execSync("rm input.txt");
}

main();

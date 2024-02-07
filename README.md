## Here you can find the script directly

This is just another branch of the main repository. This branch is created to provide the script directly to the students who are not familiar with git and github. This is just a simple way to provide the script directly to the students. If you are familiar with git and github then you can head to the main repository and clone the repository and use the script from there. [Main Repository](https://github.com/nothuman2718/DSALab.git).

### Automated Script evaluation similar to lab.

- Similar to lab you can only run script in the Linux environment amd also in macOS (macOS is built on top of a UNIX-like OS). So for running in windows you can install bash from this command. Windows Subsystem For Linux.

```
wsl --install
```

- Read this [Article](https://www.geeksforgeeks.org/how-to-run-bash-script-in-linux/) on how to use bash.
- Only Prerequisite is to have Node installed on your machine.[Please refer documentation](https://nodejs.org/en/docs).
- There many ways install node. One way is through Linux package manager **_apt_**.

```bash
sudo apt install nodejs
```

### Benefits of this Script.

- When your test cases gets failed there will be a directory created with WrongOutputs in the same directory as the script file which contains the failed testcase data which itself contains input to that specific test case and output which your code generated and the expected output and link to the explanation of the failed testcase.

- On successful run of your testcase you can see the total time taken to run that specific test case and memory it took in bytes.

- There will be an ScriptReport file. Which provides total report of the script.

- To avoid confusion, We implimented this script in a way that it will only run the script which is in the same directory as the script similar to lab.

- For example if you want to run script for Cycle1PartA then download the zip folder of git repository .Head to Scripts directory which contains the specific script for Cycle1PartA and test cases for each question .
- Keep your CFilesFolder in the Script directory.

### To run the script file just type the following command in the terminal.(for Q1 similarly for other questions same as lab).

```bash
node evaluate.js q1
```

### Things to notice.

- Beaware of infinte loops that can crash your system. We are not responsible for that.If that happens immediately restart the system or use this linux command to know the status of your processors and can kill the instruction running on your processors.

```
 htop
```

- Running of all script files doesn't mean that your code is correct. It just means that your code is passing all the test cases which we included in the script file.

### Maintainers

- VLM Lokesh [Mail](mailto:vankayalapati_b220581cs@nitc.ac.in)
- Devineni Sriram [Mail](mailto:devineni_b220257cs@nitc.ac.in)
- Varshini Pandiri [Mail](mailto:pandiri_b221096cs@nitc.ac.in)
- Geetha Meenakshi [Mail](mailto:ramireddy_b220489cs@nitc.ac.in)

### Motivation behind this repository.

- "Lift others, lift yourself – that's the way we learn and grow."

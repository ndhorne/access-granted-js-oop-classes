/*
Copyright 2018-2020 Nicholas D. Horne

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
"use strict";

class Game {
  constructor() {
    this.pin;
    this.entry;
    this.entries;
    this.status;
    this.silent;
    this.buttons = [];
    this.lcd = document.getElementById("lcd");
    this.resetDisplayTimeout;
    
    for (let i = 0; i < 10; i++) {
      this.buttons[i] = document.getElementById("button" + i);
    }
    
    this.buttons.forEach(button => {
      button.addEventListener("click", event => {
        if (this.entry.length < 4) {
          this.entry += event.target.textContent;
          this.keyIn();
        }
      });
    });
    
    window.addEventListener("keydown", event => {
      if (/^\d$/.test(event.key)) {
        if (this.entry.length < 4) {
          this.entry += event.key;
          this.keyIn();
        }
      }
    });
  }
  
  updateDisplay() {
    this.lcd.style.backgroundColor = "darkgrey";
    this.lcd.textContent = this.entry;
  }
  
  keyIn() {
    clearTimeout(this.resetDisplayTimeout);
    this.updateDisplay();
    if (this.entry.length == 4) {
      setTimeout(() => this.verifyEntry(), 500);
    }
  }
  
  highlightKeys() {
    this.buttons.forEach(button => {
      button.style.backgroundColor = "";
    });
    for (let key of this.pin) {
      let button = document.getElementById("button" + key);
      button.style.backgroundColor = "orange";
    }
  }
  
  updateEntries() {
    this.entries.push(this.entry);
  }
  
  pinGen() {
    let pin = "";
    for (let i = 0; i < 4; i++) {
      pin += Math.floor(Math.random() * 10);
    }
    //print PIN to console for debugging (or cheating)
    //console.log(pin);
    return pin;
  }
  
  initGame() {
    this.pin = this.pinGen();
    this.entry = "";
    this.entries = [];
    this.highlightKeys();
  }
  
  verifyEntry(fiatEntry) {
    if (fiatEntry) {
      this.entry = fiatEntry;
    }
    if (this.entry == this.pin) {
      this.lcd.textContent = "Access Granted";
      this.lcd.style.backgroundColor = "green";
      this.resetDisplayTimeout = setTimeout(() => this.updateDisplay(),
        3000);
      this.updateEntries();
      this.status = "PIN " + this.pin + " cracked in " +
        this.entries.length + " attempt" +
        (this.entries.length > 1 ? "s" : "");
      if (!this.silent) {
        alert(this.status);
      }
      this.initGame();
      return true;
    } else {
      this.lcd.textContent = "Access Denied";
      this.lcd.style.backgroundColor = "red";
      this.resetDisplayTimeout = setTimeout(() => this.updateDisplay(),
        1500);
      this.updateEntries();
      this.entry = "";
      return false;
    }
  }
  
  newGame(event) {
    this.initGame();
    this.updateDisplay();
    event.preventDefault();
  }
  
  about(event) {
    let aboutText =
      "Access Granted JS \"Classified\" (Encapsulated)\n" +
      "\n" +
      "A pointless diversion by Nicholas D. Horne\n" +
      "\n" +
      "Can you actually crack a four-digit PIN on your " +
      "first attempt as seen in the movies on a telltale " +
      "worn keypad? The \"worn\" keys contained in the " +
      "PIN have been highlighted on the keypad. PINs " +
      "are four digits in length. Digits may be repeated " +
      "resulting in PINs with less than four keys being " +
      "highlighted. PINs may begin with zero. Input is " +
      "accepted by way of both mouse primary button " +
      "and keyboard number keys.\n" +
      "\n" +
      "This new but not necessarily improved " +
      "implementation of Access Granted JS leverages " +
      "ECMAScript 6 classes to encapsulate data and " +
      "behaviors together inside a single " +
      "self-contained unit more often referred to as an " +
      "instance in a bid to manage complexity through " +
      "the constructs afforded by object oriented programming.\n" +
      "\n" +
      "GNU GPLv3 source code available at " +
      "https://github.com/ndhorne/access-granted-js-oop-classes";
    alert(aboutText);
    event.preventDefault();
  }
  
  getUniqueDigits() {
    let uniqueDigits = [];
    
    for (let i = 0; i <= 9; i++) {
      if (this.pin.includes(i) && !uniqueDigits.includes(i)) {
        uniqueDigits.push(i);
      }
    }
    
    return uniqueDigits;
  }
  
  inferAbsentDigits() {
    let uniqueDigits = this.getUniqueDigits();
    let inferences = [];
    
    if (uniqueDigits.length == 4) {
      inferences.push(uniqueDigits.join(""));
    } else if (uniqueDigits.length == 3) {
      for (let i = 0; i <= 2; i++) {
        inferences.push(uniqueDigits.join("") + uniqueDigits[i]);
      }
    } else if (uniqueDigits.length == 2) {
      for (let i = 0; i <= 1; i++) {
        inferences.push(uniqueDigits.join("") + uniqueDigits[i] +
          uniqueDigits[i]);
      }
      inferences.push(uniqueDigits.join("") + uniqueDigits[0] +
        uniqueDigits[1]);
    } else if (uniqueDigits.length == 1) {
      inferences.push(uniqueDigits.join("") + uniqueDigits[0] +
        uniqueDigits[0] + uniqueDigits[0]);
    } else {
      console.log("uniqueDigits has bad length");
    }
    
    return inferences;
  }
  
  autoSolveSequential(event) {
    let inferences = this.inferAbsentDigits();
    let solved = false;
    
    for (let inference of inferences) {
      
      for (let i = 0; i < 4; i++) {
        let base = inference;
        let current;
        
        if (i == 0) {
          current = base;
        } else if (i == 1) {
          current = base[1] + base[0] + base[2] + base[3];
        } else if (i == 2) {
          current = base[2] + base[0] + base[1] + base[3];
        } else if (i == 3) {
          current = base[3] + base[0] + base[1] + base[2];
        }
        
        solved = this.verifyEntry(current);
        for (let j = 0; j < 3; j++) {
          if (!solved) {
            current = current[0] + current[1] + current[3] + current[2];
            if (!this.entries.includes(current)) {
              solved = this.verifyEntry(current);
            }
          } else {
            break;
          }
          if (j == 2) {
              break;
          }
          if (!solved) {
            current = current[0] + current[2] + current[1] + current[3];
            if (!this.entries.includes(current)) {
              solved = this.verifyEntry(current);
            }
          } else {
            break;
          }
        }
        if (solved) {
          break;
        }
      }
      if (solved) {
        break;
      }
    }
    event.preventDefault();
  }
  
  autoSolveSequential2(event) {
    let inferences = this.inferAbsentDigits();
    let permutations = [];
    let solved = false;
    
    for (let inference of inferences) {
      
      for (let i = 0; i < 4; i++) {
        let base = inference;
        let current;
        
        if (i == 0) {
          current = base;
        } else if (i == 1) {
          current = base[1] + base[0] + base[2] + base[3];
        } else if (i == 2) {
          current = base[2] + base[0] + base[1] + base[3];
        } else if (i == 3) {
          current = base[3] + base[0] + base[1] + base[2];
        }
        
        permutations.push(current);
        for (let j = 0; j < 3; j++) {
          current = current[0] + current[1] + current[3] + current[2];
          if (!permutations.includes(current)) {
            permutations.push(current);
          }
          if (j == 2) {
            break;
          }
          current = current[0] + current[2] + current[1] + current[3];
          if (!permutations.includes(current)) {
            permutations.push(current);
          }
        }
      }
    }
    
    for (let permutation of permutations) {
      solved = this.verifyEntry(permutation);
      if (solved) {
        break;
      }
    }
    
    event.preventDefault();
  }
  
  autoSolveRandom(event) {
    let uniqueDigits = this.getUniqueDigits();
    let inferences = this.inferAbsentDigits();
    let solved = false;
    
    for (let i = 0; i < inferences.length; i++) {
      let inference = inferences[i];
      let maxPermutations;
      
      if (uniqueDigits.length == 4) {
        maxPermutations = 24;
      }
      if (uniqueDigits.length == 3) {
        maxPermutations = 12;
      }
      if (uniqueDigits.length == 2 && i <= 1) {
        maxPermutations = 4;
      }
      if (uniqueDigits.length == 2 && i == 2) {
        maxPermutations = 6;
      }
      if (uniqueDigits.length == 1) {
        maxPermutations = 1;
      }
      
      for (let j = 0; j < maxPermutations; j++) {
        do {
          let inferredDigits = inference.split("");
          this.entry = "";
          for (let k = 4; k > 0; k--) {
            let randomIndex = Math.floor(Math.random() * k);
            this.entry += inferredDigits.splice(randomIndex, 1).join("");
          }
        } while (this.entries.includes(this.entry));
        
        solved = this.verifyEntry();
        if (solved) {
          break;
        }
      }
      if (solved) {
        break;
      }
    }
    event.preventDefault();
  }
  
  autoSolveRandom2(event) {
    let uniqueDigits = this.getUniqueDigits();
    let solved = false;
    
    do {
      this.entry = "";
      for (let i = 0; i < 4; i++) {
        let randomIndex = Math.floor(Math.random() * uniqueDigits.length);
        this.entry += uniqueDigits[randomIndex];
      }
      if (!this.entries.includes(this.entry)) {
        solved = this.verifyEntry();
      }
    } while (!solved);
    event.preventDefault();
  }
  
  autoSolveRandom3(event) {
    let solved = false;
    
    do {
      this.entry = "";
      for (let i = 0; i < 4; i++) {
        let randomNumber = Math.floor(Math.random() * 10);
        this.entry += randomNumber;
      }
      if (!this.entries.includes(this.entry)) {
        solved = this.verifyEntry();
      }
    } while (!solved);
    event.preventDefault();
  }
  
  autoSolveBenchmarks() {
    let startTime, endTime;
    let benchpin = this.pinGen();
    
    this.silent = true;
    
    this.pin = benchpin;
    startTime = Date.now();
    this.autoSolveSequential(new CustomEvent("CustomEvent"));
    endTime = Date.now();
    console.log("autoSolveSequential  (" + benchpin + ") : " +
      +(endTime - startTime) + "ms");
    
    this.pin = benchpin;
    startTime = Date.now();
    this.autoSolveSequential2(new CustomEvent("CustomEvent"));
    endTime = Date.now();
    console.log("autoSolveSequential2 (" + benchpin + ") : " +
      +(endTime - startTime) + "ms");
    
    this.pin = benchpin;
    startTime = Date.now();
    this.autoSolveRandom(new CustomEvent("CustomEvent"));
    endTime = Date.now();
    console.log("autoSolveRandom      (" + benchpin + ") : " +
      +(endTime - startTime) + "ms");
    
    this.pin = benchpin;
    startTime = Date.now();
    this.autoSolveRandom2(new CustomEvent("CustomEvent"));
    endTime = Date.now();
    console.log("autoSolveRandom2     (" + benchpin + ") : " +
      +(endTime - startTime) + "ms");
    
    this.pin = benchpin;
    startTime = Date.now();
    this.autoSolveRandom3(new CustomEvent("CustomEvent"));
    endTime = Date.now();
    console.log("autoSolveRandom3     (" + benchpin + ") : " +
      +(endTime - startTime) + "ms");
    
    this.silent = false;
  }
  
  start() {
    this.initGame();
  }
}

let game = new Game();
game.start();

//display instructions dialog box upon page load
window.addEventListener("load", event => game.about(event));

// DOM references
const gameText = document.getElementById("game-text");
const commandInput = document.getElementById("command-input");
const submitBtn = document.getElementById("submit-btn");

// Audio elements
const bgMusic = document.getElementById("bg-music");
const clickSound = document.getElementById("click-sound");
const unlockSound = document.getElementById("unlock-sound");

// Game state
const state = {
  chapter: 1,
  scene: "scene1",

  // Chapter 1 flags
  inventory: [],
  clues: [],
  phoneTaken: false,
  sawEncodedMessage: false,
  decodedMessage: false,
  doorUnlocked: false,

  // Global
  gameOver: false,
  achievements: [],
  endingsUnlocked: [],

  // Chapter 2 flags
  c2ClockAwakened: false,
  c2SymbolsStabilized: false,
  c2MapRevealed: false,
  c2MachineAwake: false,
  c2TicketTaken: false,
  c2GateOpened: false,
};

const ENCODED_MESSAGE = "WKH GRRU FRGH LV 5731";
const DECODED_MESSAGE = "THE DOOR CODE IS 5731";
const DOOR_CODE = "5731";

// ---------- Core printing / audio ----------

function print(text, options = {}) {
  const { instant = false } = options;

  const p = document.createElement("p");
  gameText.appendChild(p);

  if (instant) {
    p.textContent = text;
    gameText.scrollTop = gameText.scrollHeight;
    return;
  }

  let i = 0;
  const speed = 15;

  function typeChar() {
    if (i <= text.length) {
      p.textContent = text.slice(0, i);
      gameText.scrollTop = gameText.scrollHeight;
      i++;
      setTimeout(typeChar, speed);
    }
  }

  typeChar();
}

function clearGameText() {
  gameText.innerHTML = "";
}

function unlockAchievement(name) {
  if (state.achievements.includes(name)) return;
  state.achievements.push(name);
  print(`🏅 Achievement unlocked: ${name}`, { instant: true });
}

// ---------- Start game / chapters ----------

function startGame() {
  state.chapter = 1;
  state.scene = "scene1";

  print("You wake up in a locked train compartment. The train is moving. You are alone.");
  print("On the small table, an old phone is vibrating. The compartment door is locked.");
  print('Type "help" for commands.', { instant: true });

  try {
    bgMusic.volume = 0.4;
    bgMusic.play().catch(() => {});
  } catch (e) {}
}

// Called when you choose the secret path (Off The Map)
function startChapter2() {
  state.chapter = 2;
  state.scene = "platform";
  state.gameOver = false;

  // Soft transition
  clearGameText();
  print("Chapter 2: The Station of Silent Faces", { instant: true });
  print("");
  print("Your vision clears.");
  print("You stand on a silent station platform that does not exist on any map you know.");
  print("Passengers line the benches, perfectly still. Their eyes follow you, but none of them speak.");
  print("Pale symbols shift on signs and posters, flickering between alphabets.");
  print('You feel the train is gone. The only way is forward. Try "look" or "move poster / clock / board / machine / gate".');
}

// Final end of the whole story
function endGameFinal() {
  state.gameOver = true;

  print("");
  print("Summary:");
  if (state.achievements.length > 0) {
    print("Achievements earned this run:");
    state.achievements.forEach((a) => print("- " + a));
  } else {
    print("No achievements earned this run.");
  }

  if (state.endingsUnlocked.length > 0) {
    print("Endings unlocked so far:");
    state.endingsUnlocked.forEach((e) => print("- " + e));
  }

  print("Refresh the page to start again.", { instant: true });
}

// ---------- Command handling ----------

function handleCommand(raw) {
  const input = raw.trim();
  if (!input) return;

  if (state.gameOver) {
    print("The story has reached its end. Refresh to begin again.");
    return;
  }

  print(`> ${input}`, { instant: true });

  const parts = input.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Easter eggs (both chapters)
  if (["cry", "sleep", "sing", "dance"].includes(command)) {
    return handleEasterEgg(command);
  }
  if (command === "kick" && args.join(" ").toLowerCase().includes("door")) {
    return handleEasterEgg("kick door");
  }

  switch (command) {
    case "help":
      cmdHelp();
      break;
    case "look":
      cmdLook(args);
      break;
    case "examine":
    case "inspect":
      cmdExamine(args);
      break;
    case "take":
    case "grab":
      cmdTake(args);
      break;
    case "use":
      cmdUse(args);
      break;
    case "solve":
    case "decode":
      cmdSolve(args.join(" "));
      break;
    case "inventory":
    case "inv":
      cmdInventory();
      break;
    case "clues":
      cmdClues();
      break;
    case "move":
    case "go":
      cmdMove(args);
      break;
    case "call":
      cmdCall(args);
      break;
    default:
      print("The world ignores that command.");
  }
}

// ---------- Easter eggs ----------

function handleEasterEgg(type) {
  switch (type) {
    case "cry":
      print("You consider crying, but the universe remains deeply unimpressed.");
      break;
    case "sleep":
      print("You close your eyes for a second. Sadly, problems do not uninstall themselves.");
      break;
    case "sing":
      print("You hum a shaky tune. No one claps. Brutal.");
      break;
    case "dance":
      print("You do a tiny victory dance. Zero progress, mild serotonin.");
      break;
    case "kick door":
      if (state.chapter === 1) {
        print("You kick the compartment door. It does not open. Your foot files a complaint.");
      } else {
        print("You kick the invisible line where a train used to be. It achieves precisely nothing.");
      }
      break;
    default:
      print("Nothing special happens.");
  }
  unlockAchievement("Wrong Universe");
}

// ---------- Shared commands ----------

function cmdHelp() {
  if (state.chapter === 1) {
    print("Available commands:");
    print("- look");
    print("- examine <object>");
    print("- take <item>");
    print("- use <item> [on <target>]");
    print("- solve <coded message> / decode <coded message>");
    print("- inventory / inv");
    print("- clues");
    print("- move <area> (seat, window, door)");
    print("- call <target> (when you have the phone)");
  } else {
    print("Available commands (Station):");
    print("- look");
    print("- examine <object>");
    print("- take <item>");
    print("- use <item>");
    print("- inventory / inv");
    print("- clues");
    print("- move <area> (platform, poster, board, clock, machine, gate)");
  }
}

function cmdLook(args) {
  if (state.chapter === 1) {
    return cmdLookChapter1(args);
  } else {
    return cmdLookChapter2(args);
  }
}

function cmdExamine(args) {
  if (state.chapter === 1) {
    return cmdExamineChapter1(args);
  } else {
    return cmdExamineChapter2(args);
  }
}

function cmdTake(args) {
  if (state.chapter === 1) {
    return cmdTakeChapter1(args);
  } else {
    return cmdTakeChapter2(args);
  }
}

function cmdUse(args) {
  if (state.chapter === 1) {
    return cmdUseChapter1(args);
  } else {
    return cmdUseChapter2(args);
  }
}

function cmdMove(args) {
  if (state.chapter === 1) {
    return cmdMoveChapter1(args);
  } else {
    return cmdMoveChapter2(args);
  }
}

// ---------- Chapter 1: Look / Examine / Take / Use / Move ----------

function cmdLookChapter1(args) {
  if (args.length === 0) {
    switch (state.scene) {
      case "scene1":
        print("You are in a compact train compartment: a table, two seats, a window, and the locked door.");
        if (!state.phoneTaken) {
          print("On the table, an old phone is buzzing.");
        }
        print("You see a seat, a window, and the compartment door.");
        break;
      case "seat-area":
        print("You are focused on the seat and luggage rack. There is a crumpled note wedged between the cushions.");
        break;
      case "window-area":
        print("You stare at the window. Outside, blurred lights streak by. There is a faint scratch on the glass: '-3?'");
        break;
      case "door-area":
        if (!state.doorUnlocked) {
          print("You are at the door. There is an electronic lock with a 4 digit keypad.");
        } else {
          print("The door is unlocked, slightly open. Freedom is one push away.");
        }
        break;
    }
  } else {
    cmdExamineChapter1(args);
  }
}

function cmdExamineChapter1(args) {
  if (args.length === 0) {
    print("Examine what?");
    return;
  }

  const target = args.join(" ").toLowerCase();

  if (target.includes("phone")) {
    if (!state.phoneTaken) {
      print("The old phone is cracked but still working. A notification lights up the screen.");
      print(`On the screen you see a message: "${ENCODED_MESSAGE}"`);
      state.sawEncodedMessage = true;
      if (!state.clues.includes("Encoded phone message")) {
        state.clues.push("Encoded phone message");
      }
    } else {
      print("You check the phone in your hand. The message still reads:");
      print(`"${ENCODED_MESSAGE}"`);
      state.sawEncodedMessage = true;
    }
  } else if (target.includes("seat")) {
    print("The seat cushion is slightly torn. A folded note sticks out.");
    print("You might be able to take the note.");
  } else if (target.includes("note")) {
    if (!state.inventory.includes("note")) {
      print("You can see part of the note, but you have not taken it yet. Try taking the note.");
    } else {
      print('You unfold the note. It reads: "SHIFT LETTERS BACK BY 3".');
      if (!state.clues.includes("Shift -3 hint")) {
        state.clues.push("Shift -3 hint");
      }
    }
  } else if (target.includes("window")) {
    print('On the lower corner of the window, someone scratched: "A→D, B→E, C→F" with an arrow pointing back.');
    if (!state.clues.includes("Alphabet shift pattern")) {
      state.clues.push("Alphabet shift pattern");
    }
  } else if (target.includes("door")) {
    if (!state.doorUnlocked) {
      print("The door lock blinks impatiently. It expects a 4 digit code.");
      print("Maybe the phone message is related. Try to solve it.");
    } else {
      print("The door is unlocked. You can leave this compartment whenever you are ready.");
    }
  } else {
    print("You do not notice anything special about that.");
  }
}

function cmdTakeChapter1(args) {
  if (args.length === 0) {
    print("Take what?");
    return;
  }

  const item = args.join(" ").toLowerCase();

  if (item.includes("phone")) {
    if (state.phoneTaken) {
      print("You already have the phone.");
      return;
    }
    state.phoneTaken = true;
    state.inventory.push("phone");
    print("You pick up the phone. It feels slightly warm.");
  } else if (item.includes("note")) {
    if (state.scene !== "seat-area") {
      print("You do not see any note here.");
      return;
    }
    if (state.inventory.includes("note")) {
      print("You already took the note.");
      return;
    }
    state.inventory.push("note");
    print("You pull out the crumpled note from the seat.");
  } else {
    print("You cannot take that.");
  }
}

function cmdUseChapter1(args) {
  if (args.length === 0) {
    print("Use what?");
    return;
  }

  const full = args.join(" ").toLowerCase();
  const onIndex = full.indexOf(" on ");
  let item = full;
  let target = null;

  if (onIndex !== -1) {
    item = full.slice(0, onIndex);
    target = full.slice(onIndex + 4);
  }

  const hasItem = state.inventory.some((i) => i.toLowerCase() === item);

  if (!hasItem) {
    print("You do not have that item.");
    return;
  }

  if (item.includes("phone")) {
    if (state.scene === "door-area" && state.decodedMessage) {
      print("You double check the phone. The decoded message confirms the door code.");
      print(`You type ${DOOR_CODE} into the keypad.`);
      unlockDoorStandard();
    } else if (state.decodedMessage) {
      print("You stare at the decoded message. There is also an option to call back the unknown sender.");
      print('Maybe try: call unknown');
    } else {
      print("You stare at the phone. The coded message still bothers you.");
    }
  } else if (item.includes("note")) {
    print('You read the note again: "SHIFT LETTERS BACK BY 3".');
  } else {
    print("Using that item does not seem to do anything helpful.");
  }
}

function cmdMoveChapter1(args) {
  if (args.length === 0) {
    print("Move where? Seat, window, or door.");
    return;
  }

  const dest = args[0].toLowerCase();

  if (dest === "seat") {
    state.scene = "seat-area";
    print("You move closer to the seat and luggage rack.");
    cmdLookChapter1([]);
  } else if (dest === "window") {
    state.scene = "window-area";
    print("You stand by the window, the outside rushing past.");
    cmdLookChapter1([]);
  } else if (dest === "door") {
    state.scene = "door-area";
    print("You move to the compartment door and inspect the lock.");
    cmdLookChapter1([]);
  } else if (dest === "compartment" || dest === "back") {
    state.scene = "scene1";
    print("You step back to the center of the compartment.");
    cmdLookChapter1([]);
  } else {
    print("That area does not exist in this compartment.");
  }
}

// ---------- Chapter 1: Logic / solve / call ----------

function cmdSolve(text) {
  if (state.chapter !== 1) {
    print("There is nothing here to solve like that.");
    return;
  }

  if (!text) {
    print("Solve what? Try typing the coded message from the phone.");
    return;
  }

  const trimmed = text.trim();

  if (trimmed === ENCODED_MESSAGE) {
    const hadHint = state.inventory.includes("note") || state.clues.includes("Shift -3 hint");
    state.decodedMessage = true;
    if (!state.clues.includes("Door code 5731")) {
      state.clues.push("Door code 5731");
    }
    print("You mentally shift each letter back by 3.");
    print(`The message becomes: "${DECODED_MESSAGE}"`);
    print("So the door code is 5731. Try going to the door using move door.");

    if (!hadHint) {
      unlockAchievement("Codebreaker");
    }
  } else if (trimmed === DOOR_CODE) {
    print("You know the digits, but you should prove it. Use the encoded message itself in solve.");
  } else {
    print("You try to decode it, but something does not click. Check your clues again.");
  }
}

function cmdCall(args) {
  if (state.chapter !== 1) {
    print("There is no signal here.");
    return;
  }

  if (!state.inventory.includes("phone")) {
    print("You have nothing to call with.");
    return;
  }

  if (!state.decodedMessage) {
    print("You do not know who to call. The phone only shows the strange coded message.");
    return;
  }

  const target = args.join(" ").toLowerCase();

  if (!target || target === "unknown" || target === "number" || target === "sender") {
    // Secret path → chapter 2
    secretPathToChapter2();
  } else {
    print("You try to dial, but the only available option is to call back the unknown sender.");
    print('Maybe just type: call unknown');
  }
}

function unlockDoorStandard() {
  if (state.doorUnlocked) {
    print("The door is already unlocked.");
    return;
  }
  state.doorUnlocked = true;

  try {
    if (bgMusic) {
      bgMusic.volume = 0.15;
    }
    unlockSound.currentTime = 0;
    unlockSound.play().catch(() => {});
  } catch (e) {}

  const tookNote = state.inventory.includes("note");
  if (!tookNote) {
    unlockAchievement("Minimalist Escape");
  }

  if (!state.endingsUnlocked.includes("Standard Escape")) {
    state.endingsUnlocked.push("Standard Escape");
  }

  print("The lock beeps, then turns green. The door unlocks with a soft click.");
  print("For a moment, the constant noise of the train feels quieter.");
  print("You step into the corridor, leaving the locked compartment behind.");
  print("Ending unlocked: Standard Escape.", { instant: true });

  endGameFinal();
}

function secretPathToChapter2() {
  try {
    if (bgMusic) {
      bgMusic.volume = 0.1;
    }
    unlockSound.currentTime = 0;
    unlockSound.play().catch(() => {});
  } catch (e) {}

  if (!state.endingsUnlocked.includes("Off The Map")) {
    state.endingsUnlocked.push("Off The Map");
  }
  unlockAchievement("Off The Map");

  print("You tap the option to call back the unknown number.");
  print("The line connects instantly. No ringtone, no greeting. Just the low hum of the train.");
  print('A distorted voice whispers: "You solved it faster than expected."');
  print("The compartment around you flickers, as if reality is buffering.");
  print("When the world stabilizes, the door slides open on its own.");
  print("Beyond it is not a normal station.");
  print("Ending unlocked: Off The Map. The real story starts now.", { instant: true });

  // Continue directly into Chapter 2 instead of ending
  startChapter2();
}

// ---------- Chapter 2: Look / Examine / Take / Use / Move ----------

function cmdLookChapter2(args) {
  if (args.length === 0) {
    switch (state.scene) {
      case "platform":
        print("You stand on a long, dimly lit platform.");
        print("Silent passengers sit on benches, watching without blinking.");
        print("Glowing signs overhead ripple with unreadable symbols.");
        print("You notice a POSTER near one pillar, a MAP BOARD flickering at the center, a CLOCK tower above, a TICKET MACHINE by a wall, and a GATE at the far end.");
        break;
      case "poster-area":
        print("You stand near a tall poster covered in shifting symbols. The text refuses to stay still.");
        break;
      case "board-area":
        if (!state.c2MapRevealed) {
          print("A large station map board flickers, the layout blurry as if you are not allowed to read it yet.");
        } else {
          print("The station map is now sharp and legible, showing routes that should not exist.");
        }
        break;
      case "clock-area":
        print("You are directly under the station clock. Its hands are frozen at 00:00, defying the sense of constant time.");
        break;
      case "machine-area":
        if (!state.c2MachineAwake) {
          print("A dusty ticket machine stands silent, its screen dark.");
        } else {
          print("The ticket machine screen glows faintly, waiting. A slot below looks ready to dispense something.");
        }
        break;
      case "gate-area":
        print("At the far end of the platform stands a narrow gate with a dull scanner.");
        if (!state.c2TicketTaken) {
          print("A faint symbol on the scanner pulses, as if expecting something you do not have.");
        } else {
          print("The scanner seems to react lazily to the strange ticket you carry.");
        }
        break;
    }
  } else {
    cmdExamineChapter2(args);
  }
}

function cmdExamineChapter2(args) {
  if (args.length === 0) {
    print("Examine what?");
    return;
  }

  const target = args.join(" ").toLowerCase();

  if (target.includes("passenger") || target.includes("people") || target.includes("crowd")) {
    print("The passengers sit unnaturally still. When you look at any one of them, their heads tilt slightly, like they are listening to a voice you cannot hear.");
    if (!state.clues.includes("Silent passengers")) {
      state.clues.push("Silent passengers");
    }
    return;
  }

  if (target.includes("poster") || target.includes("symbols")) {
    state.scene = "poster-area";
    if (!state.c2SymbolsStabilized) {
      if (!state.clues.includes("Living symbols")) {
        print("You step closer to the poster. Symbols cascade like falling letters, rearranging themselves whenever you try to focus.");
        print("For a second, you glimpse an English phrase beneath the symbols, but it slips away.");
        state.clues.push("Living symbols");
      } else {
        print("You focus harder. The symbols slow down enough to form a phrase:");
        print('"THE STATION OPENS WHEN TIME MOVES."', { instant: true });
        state.c2SymbolsStabilized = true;
        if (!state.clues.includes("Station opens when time moves")) {
          state.clues.push("Station opens when time moves");
        }
      }
    } else {
      print('The poster now holds steady: "THE STATION OPENS WHEN TIME MOVES."');
    }
    return;
  }

  if (target.includes("board") || target.includes("map")) {
    state.scene = "board-area";
    if (!state.c2MapRevealed) {
      if (!state.c2ClockAwakened) {
        print("The map flickers. Lines and station names blur out of recognition.");
        print("It feels like the station is refusing to show you the routes until something else changes.");
      } else if (!state.c2SymbolsStabilized) {
        print("The map sharpens for a moment, but the symbols on the signs still clash with it.");
        print("Maybe the poster with shifting symbols is connected.");
      } else {
        state.c2MapRevealed = true;
        print("The board hums once, then stabilizes.");
        print("You can finally read the routes:");
        print('- "LINE 0: ORIGIN"');
        print('- "LINE ∞: RETURN"');
        print('- "PLATFORM: ECHO"');
        print("A small note at the bottom reads: \"Ticket required: ONE WHO REMEMBERS.\"");
        if (!state.clues.includes("Map: Platform Echo")) {
          state.clues.push("Map: Platform Echo");
        }
      }
    } else {
      print("The map calmly shows impossible routes, as if you have always known them.");
    }
    return;
  }

  if (target.includes("clock")) {
    state.scene = "clock-area";
    if (!state.c2ClockAwakened) {
      print("The clock hands are frozen at 00:00. No ticking. No motion.");
      print("You stare at it long enough that for a heartbeat, you hear a single tick.");
      state.c2ClockAwakened = true;
      if (!state.clues.includes("Clock ticked once")) {
        state.clues.push("Clock ticked once");
      }
    } else {
      print("The clock now reads 00:01. It seems to move only when truly observed.");
    }
    return;
  }

  if (target.includes("machine") || target.includes("ticket")) {
    state.scene = "machine-area";
    if (!state.c2MachineAwake) {
      if (!state.c2MapRevealed || !state.c2ClockAwakened) {
        print("The machine is cold and lifeless. A faint symbol above it matches the ones on the posters.");
        print("Maybe the station needs to be 'awake' before this responds.");
      } else {
        state.c2MachineAwake = true;
        print("As you approach, the ticket machine flickers to life.");
        print('On the screen, a single option appears: "ISSUE PASS TO PLATFORM ECHO".');
        print("A narrow slot below waits patiently.");
        if (!state.clues.includes("Ticket machine awake")) {
          state.clues.push("Ticket machine awake");
        }
      }
    } else {
      if (!state.c2TicketTaken) {
        print('The screen still shows: "ISSUE PASS TO PLATFORM ECHO".');
        print("Something tells you it will respond if you try to take a ticket.");
      } else {
        print("The machine screen is blank again, as if it has done its job.");
      }
    }
    return;
  }

  if (target.includes("gate") || target.includes("exit")) {
    state.scene = "gate-area";
    if (!state.c2TicketTaken) {
      print("The narrow gate is sealed. A dull scanner sits at hand level, pulsing with a symbol you now recognize from the map.");
      print("It feels like it expects a specific ticket.");
    } else if (!state.c2GateOpened) {
      print("The scanner pulses brighter whenever your hand nears your pocket, where the strange ticket rests.");
      print('Maybe you should "use ticket" here.');
    } else {
      print("The gate stands open. Beyond it, a staircase descends into a light that does not behave like light.");
    }
    return;
  }

  print("You do not notice anything special about that.");
}

function cmdTakeChapter2(args) {
  if (args.length === 0) {
    print("Take what?");
    return;
  }

  const item = args.join(" ").toLowerCase();

  if (item.includes("ticket")) {
    if (state.scene !== "machine-area") {
      print("You do not see any ticket here.");
      return;
    }
    if (!state.c2MachineAwake) {
      print("Nothing comes out of the machine.");
      return;
    }
    if (state.c2TicketTaken) {
      print("You already took the strange ticket.");
      return;
    }
    state.c2TicketTaken = true;
    state.inventory.push("strange ticket");
    print("You reach out. With a soft mechanical sigh, a thin ticket slides out of the slot.");
    print("It is warm to the touch. The text on it reads: \"PLATFORM ECHO — ONE WHO REMEMBERS.\"");
    if (!state.clues.includes("Ticket: Platform Echo")) {
      state.clues.push("Ticket: Platform Echo");
    }
  } else {
    print("That does not seem like something you can take.");
  }
}

function cmdUseChapter2(args) {
  if (args.length === 0) {
    print("Use what?");
    return;
  }

  const full = args.join(" ").toLowerCase();
  const hasTicket = state.inventory.some((i) => i.toLowerCase().includes("ticket"));

  if (full.includes("ticket")) {
    if (!hasTicket) {
      print("You pat your pockets. No ticket yet.");
      return;
    }
    if (state.scene !== "gate-area") {
      print("You hold up the ticket, but nothing nearby reacts.");
      print("Maybe the gate at the far end of the platform is where it belongs.");
      return;
    }

    if (!state.c2GateOpened) {
      state.c2GateOpened = true;

      try {
        if (bgMusic) {
          bgMusic.volume = 0.12;
        }
        unlockSound.currentTime = 0;
        unlockSound.play().catch(() => {});
      } catch (e) {}

      print("You press the ticket gently against the scanner.");
      print("For a heartbeat, the symbols on the station signs and the ones on the ticket sync perfectly.");
      print("The gate unlocks with a tone that feels more like a thought than a sound.");
      print("Beyond the gate, a staircase descends into a soft, bending light.");
      print("You step through, and the station watches you go.");
      print("Ending unlocked: Station Walkthrough.", { instant: true });

      if (!state.endingsUnlocked.includes("Station Walkthrough")) {
        state.endingsUnlocked.push("Station Walkthrough");
      }

      endGameFinal();
    } else {
      print("The gate is already open. The station has accepted your passage.");
    }
  } else {
    print("Using that does not seem to have any effect here.");
  }
}

function cmdMoveChapter2(args) {
  if (args.length === 0) {
    print("Move where? (platform, poster, board, clock, machine, gate)");
    return;
  }

  const dest = args[0].toLowerCase();

  if (dest === "platform") {
    state.scene = "platform";
    print("You walk back to the center of the platform.");
    cmdLookChapter2([]);
  } else if (dest === "poster") {
    state.scene = "poster-area";
    print("You move toward the tall poster with shifting symbols.");
    cmdLookChapter2([]);
  } else if (dest === "board" || dest === "map") {
    state.scene = "board-area";
    print("You walk over to the flickering station map board.");
    cmdLookChapter2([]);
  } else if (dest === "clock") {
    state.scene = "clock-area";
    print("You stand beneath the silent station clock.");
    cmdLookChapter2([]);
  } else if (dest === "machine") {
    state.scene = "machine-area";
    print("You walk to the old ticket machine by the wall.");
    cmdLookChapter2([]);
  } else if (dest === "gate" || dest === "exit") {
    state.scene = "gate-area";
    print("You approach the narrow gate at the far end of the platform.");
    cmdLookChapter2([]);
  } else {
    print("That area does not exist here.");
  }
}

// ---------- Inventory / clues ----------

function cmdInventory() {
  if (state.inventory.length === 0) {
    print("You are carrying nothing.");
  } else {
    print("Inventory: " + state.inventory.join(", "));
  }
}

function cmdClues() {
  if (state.clues.length === 0) {
    print("You have not recorded any clues yet.");
  } else {
    print("Clues:");
    state.clues.forEach((c) => print("- " + c));
  }
}

// ---------- Event listeners ----------

function playClick() {
  try {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  } catch (e) {}
}

submitBtn.addEventListener("click", () => {
  const value = commandInput.value.trim();
  if (!value) return;

  playClick();
  handleCommand(value);
  commandInput.value = "";
  commandInput.focus();

  try {
    if (bgMusic.paused) {
      bgMusic.volume = 0.4;
      bgMusic.play().catch(() => {});
    }
  } catch (e) {}
});

commandInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const value = commandInput.value.trim();
    if (!value) return;

    playClick();
    handleCommand(value);
    commandInput.value = "";

    try {
      if (bgMusic.paused) {
        bgMusic.volume = 0.4;
        bgMusic.play().catch(() => {});
      }
    } catch (e2) {}
  }
});

// ---------- Boot ----------

startGame();
commandInput.focus();

import {UP, RIGHT, LEFT, DOWN, ENTER} from "./constants";
import {assign} from "./Utils";

const KEYMAP = {
  38: UP,
  40: DOWN,
  37: LEFT,
  39: RIGHT,
  13: ENTER
};

let _onKeydown = {};
let _setuped = false;
document.addEventListener('keydown', e => {
  e.preventDefault();
  const key = KEYMAP[e.keyCode];
  _onKeydown[key] && _onKeydown[key]();
});

function input(keyInputs) {
  if (_setuped) {
    return;
  }
  assign(_onKeydown, keyInputs);
}

export default input;

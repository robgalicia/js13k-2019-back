// 16 * 16 * 16
import {LEFT, RIGHT, STOP, ROTATE_TO_RIGHT, ROTATE_TO_LEFT} from "../../app/constants";

const stage = {
  player: {
    x: 0,
    y: 10,
  },
  map: [
    {
      x: 0,
      y: 31,
      w: 32,
      h: 1,
    },
    {
      x: 0,
      y: 12,
      w: 10,
      h: 2,
    },
    {
      x: 0,
      y: 0,
      w: 32,
      h: 1,
    },
  ],
  enemies: [
    {
      x: 20,
      y: 29,
      cmd: [
        {
          action: RIGHT,
          until: {x: 28}
        },
        {
          action: STOP,
          until: {time: 50}
        },
        {
          action: ROTATE_TO_LEFT,
          until: {offset: -180}
        },
        {
          action: LEFT,
          until: {x: 5}
        },
        {
          action: STOP,
          until: {time: 50}
        },
        {
          action: ROTATE_TO_RIGHT,
          until: {offset: 0}
        }
      ]
    },
  ]
};

export default stage;

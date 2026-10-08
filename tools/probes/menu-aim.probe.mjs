import {
  aimTriangle,
  isInsideTriangle,
} from '../../src/lib/components/menu/menu-aim.ts';
import { check, finish } from './probe-check.mjs';

// An item 200px wide at y 100-132, its submenu opened to the right at x 202, y 100-300.
const rightPanel = { left: 202, right: 402, top: 100, bottom: 300 };
const leftExit = { x: 150, y: 132 };
const towardsRight = aimTriangle(leftExit, rightPanel);

check('the apex sits behind the exit point', towardsRight[0], {
  x: 146,
  y: 132,
});
check(
  'the base is the submenu near edge',
  [towardsRight[1], towardsRight[2]],
  [
    { x: 202, y: 100 },
    { x: 202, y: 300 },
  ],
);
check(
  'the exit point is inside',
  isInsideTriangle(leftExit, towardsRight),
  true,
);
check(
  'a diagonal step towards the submenu is inside',
  isInsideTriangle({ x: 170, y: 150 }, towardsRight),
  true,
);
check(
  'a step straight down the menu is outside',
  isInsideTriangle({ x: 150, y: 170 }, towardsRight),
  false,
);
check(
  'a step back away from the submenu is outside',
  isInsideTriangle({ x: 120, y: 140 }, towardsRight),
  false,
);
check(
  'a point on the near edge is inside',
  isInsideTriangle({ x: 202, y: 250 }, towardsRight),
  true,
);

// The same submenu flipped to the left of the menu.
const leftPanel = { left: 0, right: 198, top: 100, bottom: 300 };
const rightExit = { x: 250, y: 132 };
const towardsLeft = aimTriangle(rightExit, leftPanel);

check('a flipped submenu puts the apex on the other side', towardsLeft[0], {
  x: 254,
  y: 132,
});
check('a flipped submenu aims at its right edge', towardsLeft[1].x, 198);
check(
  'a diagonal step towards a flipped submenu is inside',
  isInsideTriangle({ x: 230, y: 150 }, towardsLeft),
  true,
);
check(
  'a step away from a flipped submenu is outside',
  isInsideTriangle({ x: 270, y: 140 }, towardsLeft),
  false,
);

finish('menu-aim');

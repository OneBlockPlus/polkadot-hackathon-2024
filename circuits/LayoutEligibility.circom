pragma circom 2.2.0;

include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/mimcsponge.circom";

template LayoutEligibility(MAP_WIDTH, MAP_HEIGHT, MAX_HOUSE) {
  var MAP_SIZE = MAP_WIDTH * MAP_HEIGHT;

  // witness
  signal input layoutPlacements[MAP_SIZE];
  signal input layoutRoadConnectedHint[MAP_SIZE]; // number is 4 directions: 1: up, 2: right, 3: down, 4: left
  // signal input layoutRoads[MAP_SIZE];
  signal input layoutHouseIds[MAP_SIZE];
  signal input mapPlacementToHouse[MAX_HOUSE];
  signal input typeAccumulation[5];

  // public
  signal input rate;
  signal input storage;

  // validate that the placement is valid
  // by looking 4-way around the placement
  for (var i = 0; i < MAP_SIZE; i++) {
    var x = i % MAP_WIDTH;
    var y = i / MAP_WIDTH;
    // signals
    var up = (y > 0) ? layoutPlacements[i - MAP_WIDTH] : 0;
    var right = (x < MAP_WIDTH - 1) ? layoutPlacements[i + 1] : 0;
    var down = (y < MAP_HEIGHT - 1) ? layoutPlacements[i + MAP_WIDTH] : 0;
    var left = (x > 0) ? layoutPlacements[i - 1] : 0;
    var cur = layoutHouseIds[i];

    // if cur == 10 then assert right == 11, down == 12
    var d1 = (cur - 10);
    var d2 = (right - 11) * (down - 12);
    var t1 = d1 + d2 - d1 * d2;

    // if cur == 12 then assert right == 13, up == 10
    var d2 = (cur - 12);
    var d3 = (right - 13) * (down - 10);
    var t2 = d1 + d2 - d1 * d2;

    // ...
  }



  // validate that the house id is valid according to placement



  // validate the road is all connected by hint


  // count road number

  // count hint number


  // assert road number == hint number - 1



  // validate that the mapping between placement and house id is correct


  // validate that the type accumulation is valid according to mapping



  // validate the rate is correct according to the type accumulation


  // verify the storage is correct according to the type accumulation




























    // The length of each ship in the order used.
    var lengths[5] = [5, 4, 3, 3, 2];

    // Validate that ship coordinates are within the range of the board.
    component shipWithinRangeValidator[5];
    for (var i = 0; i < 5; i++) {
        shipWithinRangeValidator[i] = ShipWithinRange(lengths[i]);
        shipWithinRangeValidator[i].ship[0] <== ships[i][0];
        shipWithinRangeValidator[i].ship[1] <== ships[i][1];
        shipWithinRangeValidator[i].ship[2] <== ships[i][2];
    }

    // Validate that placed ships do not overlap.
    component shipsNonoverlapping[10];
    var k = 0;
    for (var i = 0; i < 5; i++) {
        for (var j = i + 1; j < 5; j++) {
            shipsNonoverlapping[k] = ShipsNonoverlapping(lengths[i], lengths[j]);
            shipsNonoverlapping[k].ships[0][0] <== ships[i][0];
            shipsNonoverlapping[k].ships[0][1] <== ships[i][1];
            shipsNonoverlapping[k].ships[0][2] <== ships[i][2];
            shipsNonoverlapping[k].ships[1][0] <== ships[j][0];
            shipsNonoverlapping[k].ships[1][1] <== ships[j][1];
            shipsNonoverlapping[k].ships[1][2] <== ships[j][2];

            k += 1;
        }
    }

    // Compute a hash committing to the configuration of this board,
    // salted with a user provided trapdoor to prevent opponent guessing
    // by bruteforce.
    component hasher = MiMCSponge(16, 220, 1);
    hasher.k <== 0;
    hasher.ins[15] <== trapdoor;
    for (var i = 0; i < 15; i++) {
        hasher.ins[i] <== ships[i \ 3][i % 3];
    }

    hash <== hasher.outs[0];
}

component main { public [rate, storage] }= LayoutEligibility(18, 8, 30);

pragma circom 2.2.0;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/mimcsponge.circom";
include "../node_modules/circomlib/circuits/switcher.circom";

template LayoutEligibility(MAP_WIDTH, MAP_HEIGHT, MAX_HOUSE, MAX_HOUSE_WIDTH, MAX_HOUSE_HEIGHT) {
  var MAP_SIZE = MAP_WIDTH * MAP_HEIGHT;
  var MAX_HOUSE_SIZE = MAX_HOUSE_WIDTH * MAX_HOUSE_HEIGHT;
  var MAX_TYPE = 5;
  // witness
  signal input layoutPlacements[MAP_SIZE];
  // signal input layoutRoadConnectedHint[MAP_SIZE]; // number is 4 directions: 1: up, 2: right, 3: down, 4: left
  // signal input layoutRoads[MAP_SIZE];
  // signal input layoutHouseIds[MAP_SIZE];
  // signal input mapPlacementToHouse[MAX_HOUSE];
  // signal input typeAccumulation[5];

  // public output
  signal output rate;
  signal output storage;

  // // validate that the placement is valid
  // // by looking 4-way around the placement
  // for (var i = 0; i < MAP_SIZE; i++) {
  //   var x = i % MAP_WIDTH;
  //   var y = i / MAP_WIDTH;
  //   // signals
  //   var up = (y > 0) ? layoutPlacements[i - MAP_WIDTH] : 0;
  //   var right = (x < MAP_WIDTH - 1) ? layoutPlacements[i + 1] : 0;
  //   var down = (y < MAP_HEIGHT - 1) ? layoutPlacements[i + MAP_WIDTH] : 0;
  //   var left = (x > 0) ? layoutPlacements[i - 1] : 0;
  //   var cur = layoutHouseIds[i];

  //   // if cur == 10 then assert right == 11, down == 12
  //   var d1 = (cur - 10);
  //   var d2 = (right - 11) * (down - 12);
  //   var t1 = d1 + d2 - d1 * d2;

  //   // if cur == 12 then assert right == 13, up == 10
  //   var d2 = (cur - 12);
  //   var d3 = (right - 13) * (down - 10);
  //   var t2 = d1 + d2 - d1 * d2;

  //   // ...
  // }

  signal typeAccumulation[MAX_TYPE][MAP_SIZE];
  signal typeZero[MAX_TYPE][MAP_SIZE];
  signal accum[MAP_SIZE][MAX_TYPE][MAX_HOUSE_SIZE];
  signal layoutZero[MAP_SIZE][MAX_TYPE][MAX_HOUSE_SIZE];
  signal accumZero[MAP_SIZE][MAX_TYPE];
  signal accumTemp[MAP_SIZE][MAX_TYPE];

  signal type0num;
  signal type1num;
  signal type2num;
  signal type3num;
  signal type4num;

  // house space mask pattern
  var pattern[MAX_TYPE][MAX_HOUSE_SIZE];
  pattern[0] = [1,1,0,0,1,1,0,0,0,0,0,0];
  pattern[1] = [1,1,1,1,1,1,1,1,0,0,0,0];
  pattern[2] = [1,0,0,0,1,0,0,0,0,0,0,0];
  pattern[3] = [1,1,0,0,1,1,0,0,0,0,0,0];
  pattern[4] = [1,1,1,0,1,1,1,0,1,1,1,0];

  for (var i = 0; i < MAP_SIZE; i++) {
    var x = i % MAP_WIDTH;
    var y = i \ MAP_WIDTH;

    // signal area[MAX_HOUSE_SIZE];

      // log("cell", i);
    for (var k = 0; k < MAX_TYPE; k++) {
      var num = k + 2;
      typeZero[k][i] <== IsZero()(layoutPlacements[i] - num);
      if (i == 0) {
        typeAccumulation[k][i] <== typeZero[k][i];
      } else {
        typeAccumulation[k][i] <== typeZero[k][i] + typeAccumulation[k][i - 1];
      }

      // log("type", k);
      // ignore the first one which is the type number
      accum[i][k][0] <== 0;
      for (var j = 1; j < MAX_HOUSE_SIZE; j++) {
        var ax = j % MAX_HOUSE_WIDTH;
        var ay = j \ MAX_HOUSE_WIDTH;
        // if layoutPlacements[i] != 0 then the cell must be 0
        var index = i + ax + ay * MAP_WIDTH;
        // log(index, ax, ay);
        if (index >= MAP_SIZE || index < 0) {
          layoutZero[i][k][j] <== 1;// TODO
        } else {
          layoutZero[i][k][j] <== IsZero()(layoutPlacements[index] * pattern[k][j]);
        }
        accum[i][k][j] <== layoutZero[i][k][j] + accum[i][k][j - 1];
        // log("step", accum[i][k][j]);
        // area[j] <== (x + ax < MAP_WIDTH && y + ay < MAP_HEIGHT)
        //   ? layoutPlacements[i + ax + ay * MAP_WIDTH]
        //   : 0;
      }

      // log("final", accum[i][k][MAX_HOUSE_SIZE - 1]);
      // if typeZero[k][i] === 1 then require accumZero[i][k] === 1
      // Truth table:
      // a = typeZero[k][i] , b = accumZero[i][k]
      //  a | b | Output
      // ---------------
      //  0 | 0 |   1
      //  0 | 1 |   1
      //  1 | 0 |   0
      //  1 | 1 |   1
      // P = 1 - a + ab;
      accumZero[i][k] <== IsZero()(accum[i][k][MAX_HOUSE_SIZE - 1] - MAX_HOUSE_SIZE + 1);
      accumTemp[i][k] <== 1 - typeZero[k][i] + typeZero[k][i] * accumZero[i][k];
      accumTemp[i][k] === 1;
    }
  }

  type0num <== typeAccumulation[0][MAP_SIZE - 1];
  type1num <== typeAccumulation[1][MAP_SIZE - 1];
  type2num <== typeAccumulation[2][MAP_SIZE - 1];
  type3num <== typeAccumulation[3][MAP_SIZE - 1];
  type4num <== typeAccumulation[4][MAP_SIZE - 1];

  signal out1 <== type1num * 1;
  signal out2calc <-- out1 / 2;
  out1 === out2calc * 2;
  signal out2, t2;
  (out2, t2) <== Switcher()(LessThan(5)([out2calc, type1num]), out2calc, type1num);

  signal out3calc <== out2;
  signal out3, t3;
  (out3, t3) <== Switcher()(LessThan(5)([out3calc, type2num]), out3calc, type2num);

  rate <== out3;

  // at least one seaport
  signal seaport <== GreaterThan(5)([type3num, 0]);
  seaport === 1;

  // storage
  storage <== type4num;



  // validate that the house id is valid according to placement



  // validate the road is all connected by hint


  // count road number

  // count hint number


  // assert road number == hint number - 1



  // validate that the mapping between placement and house id is correct


  // validate that the type accumulation is valid according to mapping



  // validate the rate is correct according to the type accumulation


  // verify the storage is correct according to the type accumulation


}

component main = LayoutEligibility(18, 8, 30, 4, 3);

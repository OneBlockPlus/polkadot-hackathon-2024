import { MapParameters } from '../map/definitions';

export function generateWitnessRaw(par: MapParameters): {
  witness: Record<string, string>;
  rate: number;
} {
  const witness: Record<string, string> = {};
  // == generate the 1st layer: placement verification layer

  const occupied: Record<number, number> = {};
  const roads: Record<number, number> = {};
  // convert tiles to occupied by fill component width/height
  for (let i = 0; i < par.mapColumns * par.mapRows; i++) {
    if (par.tiles[i] !== null) {
      const t = par.placements[par.tiles[i]];
      if (t.name === 'road') {
        roads[i] = 1;
      }
      for (let j = 0; j < t.tileWidth; j++) {
        for (let k = 0; k < t.tileHeight; k++) {
          occupied[i + k * par.mapColumns + j] =
            par.tiles[i] * 10 + j + k * t.tileWidth;
        }
      }
    }
  }

  // == generate the 2nd layer: component
  const components: Record<number, number> = {};
  const componentMap: Record<number, number> = {};
  // find all components by loop whole map with mark each component a unique number
  let componentIndex = 0;
  for (let i = 0; i < par.mapColumns * par.mapRows; i++) {
    if (par.tiles[i] !== null) {
      const t = par.placements[par.tiles[i]];
      if (t.name === 'road') {
        components[i] = 0;
        continue;
      }
      componentIndex++;
      componentMap[componentIndex] = par.tiles[i];
      for (let j = 0; j < t.tileWidth; j++) {
        for (let k = 0; k < t.tileHeight; k++) {
          components[i + k * par.mapColumns + j] = componentIndex;
        }
      }
    }
  }

  // == calculate the production rate of map
  // find seaport and all its connected roads
  const starts: number[] = [];
  for (let i = 0; i < par.mapColumns * par.mapRows; i++) {
    if (Math.floor(occupied[i] / 10) === 4) {
      // find 4 ways if a road connected to this tile
      if (i % par.mapColumns > 0 && roads[i - 1]) {
        starts.push(i - 1);
      }
      if (i % par.mapColumns < par.mapColumns - 1 && roads[i + 1]) {
        starts.push(i + 1);
      }
      if (i >= par.mapColumns && roads[i - par.mapColumns]) {
        starts.push(i - par.mapColumns);
      }
      if (i < par.mapColumns * (par.mapRows - 1) && roads[i + par.mapColumns]) {
        starts.push(i + par.mapColumns);
      }
    }
  }
  console.log('starts', starts);
  // find connected machines

  // scan components to find connected machines
  const connectedMachineIds: number[] = [];
  for (let i = 0; i < par.mapColumns * par.mapRows; i++) {
    const cur = components[i];
    const down = components[i + par.mapColumns];
    const right = components[i + 1];
    const s1 = [cur, down].sort();
    const s2 = [cur, right].sort();
    // console.log('s1', s1, 's2', s2);
    if (s1[0] == 0 && !!s1[1]) {
      connectedMachineIds.push(s1[1]);
      // console.log('==s1', s1, 'connectedMachineIds', connectedMachineIds);
    }
    if (s2[0] == 0 && !!s2[1]) {
      connectedMachineIds.push(s2[1]);
      // console.log('==s2', s2, 'connectedMachineIds', connectedMachineIds);
    }
  }
  // distinct
  const connectedUniqueMachineIds = Array.from(new Set(connectedMachineIds));
  console.log(
    'connectedUniqueMachineIds',
    connectedUniqueMachineIds,
    connectedMachineIds,
  );
  // statistics on machine type
  const machineTypeCount: Record<number, number> = {};
  for (let i = 0; i < connectedUniqueMachineIds.length; i++) {
    const machineId = connectedUniqueMachineIds[i];
    const machineType = componentMap[machineId];
    if (machineTypeCount[machineType]) {
      machineTypeCount[machineType]++;
    } else {
      machineTypeCount[machineType] = 1;
    }
  }

  // assumption: linear comsumption
  // 2 x 1 + 1 x 2 + 1 x 3
  // 1: 0 - 1
  // 2: 2 - 1
  // 3: 1 - 1

  const out1 = machineTypeCount[1] * 1;
  const out2 = Math.min(out1 / 2, machineTypeCount[2]);
  const out3 = Math.min(out2, machineTypeCount[3]);

  const rate = out3;

  // calculate production rate of machines
  // find connected storage

  witness['Placement verification: (occupied)'] = formatMatrix(
    occupied,
    par.mapColumns,
    par.mapRows,
    2,
  );

  // layers.value[1] = formatMatrix(
  //   roads,
  //   par.mapColumns,
  //   par.mapRows,
  //   2,
  // );

  witness['Road connectivity verification: (components)'] = formatMatrix(
    components,
    par.mapColumns,
    par.mapRows,
    2,
  );

  // layers.value[2] =
  //   'Road connectivity verification: (component map)\n' +
  //   JSON.stringify(componentMap, null, 4);

  witness['Road connectivity verification: (component type count)'] =
    JSON.stringify(machineTypeCount, null, 4);
  // == generate the 3rd layer: road connectivity layer

  // == generate the 4th layer: storage verification layer

  return { witness, rate };
}

function formatMatrix(
  tiles: Record<number, number>,
  columns: number,
  rows: number,
  length = 1,
): string {
  let matrix = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const value = tiles[y * columns + x] ?? '_'.repeat(length);
      matrix += value.toString().padStart(length, ' ');
      if (x < columns - 1) matrix += ' '.repeat(length);
    }
    if (y < rows - 1) matrix += '\n';
  }
  return matrix;
}

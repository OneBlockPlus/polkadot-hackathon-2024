<template>
  <div>
    <!-- <p>{{ title }}</p> -->
    <canvas
      ref="myCanvas"
      :width="par?.mapWidth ?? 300"
      :height="par?.mapHeight ?? 200"
    ></canvas>
    <template v-if="par">
      <br />
      <q-btn
        v-for="(button, index) in par.placements"
        :key="index"
        :color="index == par.sourceTile ? 'primary' : ''"
        @click="par.sourceTile = index"
      >
        <img
          class="image-button"
          :style="{
            backgroundImage: `url(${button.image})`,
            width: `${button.tileWidth * par.baseSize}px`,
            height: `${button.tileHeight * par.baseSize}px`,
            backgroundPosition: `-${button.xOffset * (par.baseSize + 1)}px -${button.yOffset * (par.baseSize + 1)}px`,
          }"
        />
      </q-btn>
      <br />
      Production Rate: {{ productionRate }}
      <br />
      <q-btn label="Save" @click="save()"></q-btn>
      <q-btn label="Load" @click="load()"></q-btn>
      <q-btn label="Generate" @click="generate()"></q-btn>
      <template v-for="(_layer, index) in layers" :key="index">
        <br />
        <q-input
          v-model="layers[index]"
          type="textarea"
          readonly
          autogrow
          style="font-family: monospace; min-width: 600px"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, useTemplateRef } from 'vue';
import { useQuasar } from 'quasar';
import { MapParameters } from 'src/services/map/definitions';
import { mountCanvas } from 'src/services/map/canvas';
import { redrawMap } from 'src/services/map/drawMap';

const myCanvas = useTemplateRef('myCanvas');

let par: Ref<MapParameters | null> = ref(null);
onMounted(() => {
  if (myCanvas.value) {
    let canvas: HTMLCanvasElement = myCanvas.value as HTMLCanvasElement;

    par.value = mountCanvas(canvas);
  }
});

const layers: Ref<string[]> = ref([]);
const productionRate = ref(0);

const $q = useQuasar();
function save() {
  try {
    localStorage.setItem('mapTiles', JSON.stringify(par.value.tiles));
    $q.notify({
      type: 'positive',
      message: 'Map saved successfully!',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to save map: ' + error,
    });
  }
}

function load() {
  const savedTiles = localStorage.getItem('mapTiles');
  if (savedTiles) {
    try {
      par.value.tiles = JSON.parse(savedTiles);
      redrawMap(par.value);
      $q.notify({
        type: 'positive',
        message: 'Map loaded successfully!',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to load map: ' + error,
      });
    }
  } else {
    $q.notify({
      type: 'negative',
      message: 'No saved map found.',
    });
  }
}

function generate() {
  // == generate the 1st layer: placement verification layer

  const occupied: Record<number, number> = {};
  const roads: Record<number, number> = {};
  // convert tiles to occupied by fill component width/height
  for (let i = 0; i < par.value.mapColumns * par.value.mapRows; i++) {
    if (par.value.tiles[i] !== null) {
      const t = par.value.placements[par.value.tiles[i]];
      if (t.name === 'road') {
        roads[i] = 1;
      }
      for (let j = 0; j < t.tileWidth; j++) {
        for (let k = 0; k < t.tileHeight; k++) {
          occupied[i + k * par.value.mapColumns + j] =
            par.value.tiles[i] * 10 + j + k * t.tileWidth;
        }
      }
    }
  }

  // == generate the 2nd layer: component
  const components: Record<number, number> = {};
  const componentMap: Record<number, number> = {};
  // find all components by loop whole map with mark each component a unique number
  let componentIndex = 0;
  for (let i = 0; i < par.value.mapColumns * par.value.mapRows; i++) {
    if (par.value.tiles[i] !== null) {
      const t = par.value.placements[par.value.tiles[i]];
      if (t.name === 'road') {
        components[i] = 0;
        continue;
      }
      componentIndex++;
      componentMap[componentIndex] = par.value.tiles[i];
      for (let j = 0; j < t.tileWidth; j++) {
        for (let k = 0; k < t.tileHeight; k++) {
          components[i + k * par.value.mapColumns + j] = componentIndex;
        }
      }
    }
  }

  // == calculate the production rate of map
  // find seaport and all its connected roads
  const starts: number[] = [];
  for (let i = 0; i < par.value.mapColumns * par.value.mapRows; i++) {
    if (Math.floor(occupied[i] / 10) === 4) {
      // find 4 ways if a road connected to this tile
      if (i % par.value.mapColumns > 0 && roads[i - 1]) {
        starts.push(i - 1);
      }
      if (i % par.value.mapColumns < par.value.mapColumns - 1 && roads[i + 1]) {
        starts.push(i + 1);
      }
      if (i >= par.value.mapColumns && roads[i - par.value.mapColumns]) {
        starts.push(i - par.value.mapColumns);
      }
      if (
        i < par.value.mapColumns * (par.value.mapRows - 1) &&
        roads[i + par.value.mapColumns]
      ) {
        starts.push(i + par.value.mapColumns);
      }
    }
  }
  console.log('starts', starts);
  // find connected machines

  // scan components to find connected machines
  const connectedMachineIds: number[] = [];
  for (let i = 0; i < par.value.mapColumns * par.value.mapRows; i++) {
    const cur = components[i];
    const down = components[i + par.value.mapColumns];
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

  productionRate.value = out3;

  // calculate production rate of machines
  // find connected storage

  layers.value[0] =
    'Placement verification: (occupied)\n' +
    formatMatrix(occupied, par.value.mapColumns, par.value.mapRows, 2);

  // layers.value[1] = formatMatrix(
  //   roads,
  //   par.value.mapColumns,
  //   par.value.mapRows,
  //   2,
  // );

  layers.value[1] =
    'Road connectivity verification: (components)\n' +
    formatMatrix(components, par.value.mapColumns, par.value.mapRows, 2);

  // layers.value[2] =
  //   'Road connectivity verification: (component map)\n' +
  //   JSON.stringify(componentMap, null, 4);

  layers.value[2] =
    'Road connectivity verification: (component type count)\n' +
    JSON.stringify(machineTypeCount, null, 4);
  // == generate the 3rd layer: road connectivity layer
  // == generate the 4th layer: storage verification layer
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
</script>

<style lang="scss" scoped>
//
</style>

<template>
  <div>
    <!-- <p>{{ title }}</p> -->
    <canvas ref="myCanvas" width="600" height="400"></canvas>
    <br />
    <q-btn label="Save" @click="save()"></q-btn>
    <q-btn label="Load" @click="load()"></q-btn>
    <br />
    <q-btn
      v-for="(button, index) in buttons"
      :key="index"
      :color="index == sourceTile ? 'primary' : ''"
      @click="sourceTile = index"
    >
      <img
        class="image-button"
        :style="{
          backgroundImage: `url(${button.image})`,
          width: `${button.tileWidth * baseSize}px`,
          height: `${button.tileHeight * baseSize}px`,
          backgroundPosition: `-${button.xOffset}px -${button.yOffset}px`,
        }"
      />
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, useTemplateRef } from 'vue';
// import { computed, ref } from 'vue';
// import { Todo, Meta } from './models';

// interface Props {
//   title: string;
//   todos?: Todo[];
//   meta: Meta;
//   active: boolean;
// }

// const props = withDefaults(defineProps<Props>(), {
//   todos: () => [],
// });

import TilesImage from '../assets/components.png';
// import TransportImage from '../assets/transportLine.png';
import TerrainImage from '../assets/terrains.png';

const baseSize = 21;
const buttons: Ref<
  {
    image: string;
    tileWidth: number;
    tileHeight: number;
    width: number;
    height: number;
    xOffset: number;
    yOffset: number;
    name: string;
  }[]
> = ref([
  {
    image: TerrainImage,
    tileWidth: 1,
    tileHeight: 1,
    width: baseSize * 1,
    height: baseSize * 1,
    xOffset: 0,
    yOffset: (baseSize + 1) * 3,
    name: 'road',
  },
  {
    image: TilesImage,
    tileWidth: 4,
    tileHeight: 2,
    width: baseSize * 4,
    height: baseSize * 2,
    xOffset: 0,
    yOffset: 0,
    name: 'iron-processor',
  },
  {
    image: TilesImage,
    tileWidth: 2,
    tileHeight: 2,
    width: baseSize * 2,
    height: baseSize * 2,
    xOffset: (baseSize + 1) * 4,
    yOffset: 0,
    name: 'iron-buyer',
  },
  {
    image: TilesImage,
    tileWidth: 1,
    tileHeight: 2,
    width: baseSize * 1,
    height: baseSize * 2,
    xOffset: (baseSize + 1) * 6,
    yOffset: 0,
    name: 'iron-seller',
  },
  {
    image: TilesImage,
    tileWidth: 2,
    tileHeight: 2,
    width: baseSize * 2,
    height: baseSize * 2,
    xOffset: (baseSize + 1) * 3,
    yOffset: (baseSize + 1) * 3,
    name: 'iron-seller',
  },
]);

// const belts = {
//   straight: 3,
//   'turn-left': 4,
//   'branch-right': 5,
//   'branch-sides': 6,
//   'branch-all': 7,
//   'join-right': 10,
//   'join-sides': 11,
//   'join-all': 14,
// };

// for (const [key, value] of Object.entries(belts)) {
//   buttons.value.push({
//     image: TransportImage,
//     tileWidth: 1,
//     tileHeight: 1,
//     width: baseSize * 1,
//     height: baseSize * 1,
//     xOffset: baseSize * value,
//     yOffset: 0,
//     name: 'transport-' + key,
//   });
// }
const images: Record<string, HTMLImageElement> = {}; // = new Image();
// distinct buttons
const buttonImages = buttons.value.reduce((acc: string[], cur) => {
  if (acc.indexOf(cur.image) === -1) {
    acc.push(cur.image);
  }
  return acc;
}, []);
for (let i = 0; i < buttonImages.length; i++) {
  const t = buttonImages[i];
  images[t] = new Image();
  images[t].src = t;
}
const tileWidth: number = 21,
  tileHeight: number = 21;
const mapRows: number = 8,
  mapColumns: number = 18;
// const sourceWidth: number = mapRows * tileWidth,
//   sourceHeight: number = mapColumns * tileHeight;
let tiles: (number | null)[] = new Array(mapColumns * mapRows);
let mapHeight: number = mapRows * tileHeight;
let mapWidth: number = mapColumns * tileWidth;
// let sourceX: number, sourceY: number;
let sourceTile = ref(0);

let mouseState: Ref<'Normal' | 'LeftDown' | 'RightDown'> = ref('Normal');
const myCanvas = useTemplateRef('myCanvas');
let context: CanvasRenderingContext2D | null = null;

onMounted(() => {
  if (myCanvas.value) {
    let canvas: HTMLCanvasElement = myCanvas.value as HTMLCanvasElement;

    context = canvas.getContext('2d') as CanvasRenderingContext2D;

    canvas.addEventListener('mousedown', doMouseDown);
    document.addEventListener('contextmenu', (event: Event) =>
      event.preventDefault(),
    );
    canvas.addEventListener('mousemove', doMouseMove);
    canvas.addEventListener('click', doMouseClick);
    canvas.addEventListener('mouseup', doMouseUp);
    // image.addEventListener('load', redrawSource);
    // draw the grid

    for (let i: number = 0; i <= mapColumns; i++) {
      context.moveTo(i * tileWidth, 0);
      context.lineTo(i * tileWidth, mapHeight);
    }
    context.stroke();
    for (let i: number = 0; i <= mapRows; i++) {
      context.moveTo(0, i * tileHeight);
      context.lineTo(mapWidth, i * tileHeight);
    }
    context.stroke();
  }
});

const roadImageRaw: [string, number, number][] = [
  ['horizontal', 1, 3],
  ['vertical', 0, 3],
  ['grass', 0, 0],
  ['eastnorth', 0, 5],
  ['eastsouth', 1, 5],
  ['westsouth', 2, 5],
  ['westnorth', 3, 5],
  ['exceptwest', 0, 6],
  ['exceptnorth', 1, 6],
  ['excepteast', 2, 6],
  ['exceptsouth', 3, 6],
  ['cross', 4, 6],
  ['one', 0, 2],
  ['endnorth', 1, 2],
  ['endeast', 2, 2],
  ['endsouth', 3, 2],
  ['endwest', 4, 2],
];

// 1: road, 0: grass, 2: component
// north, east, south, west
const roadMapping: Record<string, string> = {
  '0000': 'one',
  '0001': 'endwest',
  '0010': 'endsouth',
  '0011': 'westsouth',
  '0100': 'endeast',
  '0101': 'horizontal',
  '0110': 'eastsouth',
  '0111': 'exceptnorth',
  '1000': 'endnorth',
  '1001': 'westnorth',
  '1010': 'vertical',
  '1011': 'excepteast',
  '1100': 'eastnorth',
  '1101': 'exceptsouth',
  '1110': 'exceptwest',
  '1111': 'cross',
};

interface ImageOffset {
  image: string;
  draw: HTMLImageElement;
  tileWidth: number;
  tileHeight: number;
  xOffset: number;
  yOffset: number;
}
let roadImages: Record<string, ImageOffset> = {};
for (let i = 0; i < roadImageRaw.length; i++) {
  const [name, xOffset, yOffset] = roadImageRaw[i];
  let img = new Image();
  img.src = TerrainImage;
  roadImages[name] = {
    image: TerrainImage,
    draw: img,
    tileWidth: 1,
    tileHeight: 1,
    xOffset: xOffset * (baseSize + 1),
    yOffset: yOffset * (baseSize + 1),
  };
}

// Function to redraw the map
function redrawMap(): void {
  if (context) {
    context.clearRect(0, 0, mapWidth, mapHeight);

    let occupyed: Record<number, boolean> = {};
    // convert tiles to occupyed by fill component width/height
    for (let i = 0; i < mapColumns * mapRows; i++) {
      if (tiles[i] !== null) {
        const t = buttons.value[tiles[i]];
        for (let j = 0; j < t.tileWidth; j++) {
          for (let k = 0; k < t.tileHeight; k++) {
            occupyed[i + k * mapColumns + j] = true;
          }
        }
      }
    }

    // draw roads according to direction and position
    for (let row = 0; row < mapRows; row++) {
      for (let col = 0; col < mapColumns; col++) {
        const tileIndex = row * mapColumns + col;
        const tile = tiles[tileIndex];
        const x = col * tileWidth;
        const y = row * tileHeight;
        // 1: road, 0: grass, 2: component
        const north =
          row < 0
            ? 0
            : tiles[tileIndex - mapColumns] == 0
              ? 1
              : occupyed[tileIndex - mapColumns]
                ? 1
                : 0;
        const south =
          row >= mapRows - 1
            ? 0
            : tiles[tileIndex + mapColumns] == 0
              ? 1
              : occupyed[tileIndex + mapColumns]
                ? 1
                : 0;
        const east =
          col >= mapColumns - 1
            ? 0
            : tiles[tileIndex + 1] == 0
              ? 1
              : occupyed[tileIndex + 1]
                ? 1
                : 0;
        const west =
          col < 0
            ? 0
            : tiles[tileIndex - 1] == 0
              ? 1
              : occupyed[tileIndex - 1]
                ? 1
                : 0;
        let roadImage: ImageOffset;
        if (tile === 0 && !!buttons.value[tile]) {
          roadImage = roadImages[roadMapping[`${north}${east}${south}${west}`]];
        } else {
          roadImage = roadImages['grass'];
        }

        context.drawImage(
          roadImage.draw,
          roadImage.xOffset,
          roadImage.yOffset,
          roadImage.tileWidth * baseSize,
          roadImage.tileHeight * baseSize,
          x,
          y,
          roadImage.tileWidth * baseSize,
          roadImage.tileHeight * baseSize,
        );
      }
    }

    // draw components
    for (let row = 0; row < mapRows; row++) {
      for (let col = 0; col < mapColumns; col++) {
        const tileIndex = row * mapColumns + col;
        const tile = tiles[tileIndex];
        if (tile && !!buttons.value[tile]) {
          const t = buttons.value[tile];
          const x = col * tileWidth;
          const y = row * tileHeight;
          context.drawImage(
            images[t.image],
            t.xOffset,
            t.yOffset,
            t.width,
            t.height,
            x,
            y,
            t.width,
            t.height,
          );
        }
      }
    }
  }
}

// Initialize the map array
for (let i = 0; i < mapColumns * mapRows; i++) {
  tiles[i] = null; // or any default value you want
}

function doMouseUp(_e: MouseEvent): void {
  mouseState.value = 'Normal';
}

function doMouseDown(e: MouseEvent): void {
  if (e.button === 0) {
    mouseState.value = 'LeftDown';
  } else if (e.button === 2) {
    mouseState.value = 'RightDown';
  }
  let x: number = e.offsetX;
  let y: number = e.offsetY;
  // let gridX: number = Math.floor(x / tileWidth) * tileWidth;
  // let gridY: number = Math.floor(y / tileHeight) * tileHeight;

  if (y <= mapHeight && x <= mapWidth) {
    // // source
    // let tileX: number = Math.floor(x / tileWidth);
    // let tileY: number = Math.floor((y - mapHeight) / tileHeight);
    // sourceTile = tileY * (sourceWidth / tileWidth) + tileX;
    // sourceX = gridX;
    // sourceY = gridY - mapHeight;
    // redrawSource();
    setTile(e);
    redrawMap();
    // drawBox();
  }
}

function doMouseMove(e: MouseEvent): void {
  let x: number = e.offsetX;
  let y: number = e.offsetY;
  let gridX: number, gridY: number;
  gridX = Math.floor(x / tileWidth) * tileWidth;
  gridY = Math.floor(y / tileHeight) * tileHeight;

  if (mouseState.value != 'Normal') setTile(e);

  if (y <= mapHeight && x <= mapWidth) {
    // source
    // context.clearRect(0, mapHeight, sourceWidth, sourceHeight);
    redrawMap();
    // redrawSource();
    context.beginPath();
    context.strokeStyle = 'blue';
    let boxWidth = tileWidth;
    let boxHeight = tileHeight;
    if (buttons.value[sourceTile.value]) {
      boxWidth = tileWidth * buttons.value[sourceTile.value].tileWidth;
      boxHeight = tileHeight * buttons.value[sourceTile.value].tileHeight;
    }
    context.rect(gridX, gridY, boxWidth, boxHeight);
    context.stroke();
    // drawBox();
  }
}

// function drawBox(): void {
//   context.beginPath();
//   context.strokeStyle = 'red';
//   context.rect(sourceX, sourceY + mapHeight, tileWidth, tileHeight);
//   context.stroke();
// }

function doMouseClick(e: MouseEvent): void {
  setTile(e);
}

function setTile(e: MouseEvent): void {
  let x: number = e.offsetX;
  let y: number = e.offsetY;
  // let gridX: number, gridY: number;
  // gridX = Math.floor(x / tileWidth) * tileWidth;
  // gridY = Math.floor(y / tileHeight) * tileHeight;
  if (y < mapHeight && x < mapWidth) {
    // target
    // context.clearRect(gridX, gridY, tileWidth, tileHeight);
    // context.drawImage(
    //   image,
    //   sourceX,
    //   sourceY,
    //   tileWidth,
    //   tileHeight,
    //   gridX,
    //   gridY,
    //   tileWidth,
    //   tileHeight,
    // );
    let tileX: number = Math.floor(x / tileWidth);
    let tileY: number = Math.floor(y / tileHeight);
    let targetTile: number = tileY * mapColumns + tileX;
    if (mouseState.value == 'RightDown') {
      // context.clearRect(gridX, gridY, tileWidth, tileHeight);
      // context.beginPath();
      // context.strokeStyle = 'black';
      // context.rect(gridX, gridY, tileWidth, tileHeight);
      // context.stroke();
      tiles[targetTile] = null;
      return;
    }

    // if (buttons.value[sourceTile]) {
    //   const t = buttons.value[sourceTile];
    //   // clean tiles based on its width/height
    //   for (let i = 0; i < t.tileWidth; i++) {
    //     for (let j = 0; j < t.tileHeight; j++) {
    //       tiles[targetTile + j * mapColumns + i] = null;
    //     }
    //   }
    //   // loop through whole tiles to find if current tile is within boundary of other tiles, clean these
    //   for (let i = 0; i < mapColumns * mapRows; i++) {
    //     const row = Math.floor(i / mapColumns);
    //     const col = i % mapColumns;
    //     if (
    //       row + t.tileHeight > tileY &&
    //       row < tileY + t.tileHeight &&
    //       col + t.tileWidth > tileX &&
    //       col < tileX + t.tileWidth
    //     ) {
    //       tiles[i] = null;
    //     }
    //   }
    // }
    if (buttons.value[sourceTile.value] === null) return;
    const t = buttons.value[sourceTile.value];
    if (isLocationBlocked(tileX, tileY, t.tileWidth, t.tileHeight)) return;
    tiles[targetTile] = sourceTile.value;
  }
}

function isLocationBlocked(
  tileX: number,
  tileY: number,
  tileWidth: number,
  tileHeight: number,
) {
  for (let i = 0; i < mapColumns * mapRows; i++) {
    if (tiles[i] !== null) {
      const existingTile = buttons.value[tiles[i]];
      const existingTileX = i % mapColumns;
      const existingTileY = Math.floor(i / mapColumns);

      // Check if the expected rectangle overlaps with the existing rectangle
      if (
        tileX < existingTileX + existingTile.tileWidth &&
        tileX + tileWidth > existingTileX &&
        tileY < existingTileY + existingTile.tileHeight &&
        tileY + tileHeight > existingTileY
      ) {
        return true;
      }
    }
  }
  return false;
}
import { useQuasar } from 'quasar';

const $q = useQuasar();
function save() {
  try {
    localStorage.setItem('mapTiles', JSON.stringify(tiles));
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
      tiles = JSON.parse(savedTiles);
      redrawMap();
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
</script>

<style lang="scss" scoped>
//
</style>

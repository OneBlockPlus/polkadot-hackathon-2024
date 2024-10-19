<template>
  <div>
    <!-- <p>{{ title }}</p> -->
    <canvas ref="myCanvas" width="600" height="400"></canvas>
    <br />
    <!-- <q-btn>
      <img
        class="image-button"
        :style="{
          backgroundImage: `url(${TilesImage})`,
          width: `${21 * 4}px`,
          height: `${21 * 2}px`,
          backgroundPosition: `${0}px ${0}px`,
        }"
      />
    </q-btn> -->
    <q-btn v-for="(button, index) in buttons" :key="index">
      <img
        class="image-button"
        :style="{
          backgroundImage: `url(${TilesImage})`,
          width: `${button.tileWidth * baseSize}px`,
          height: `${button.tileHeight * baseSize}px`,
          backgroundPosition: `-${button.xOffset}px -${button.yOffset}px`,
        }"
        @click="sourceTile = index"
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
const baseSize = 21;
const buttons: Ref<
  {
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
    tileWidth: 4,
    tileHeight: 2,
    width: baseSize * 4,
    height: baseSize * 2,
    xOffset: 0,
    yOffset: 0,
    name: 'iron-processor',
  },
  {
    tileWidth: 2,
    tileHeight: 2,
    width: baseSize * 2,
    height: baseSize * 2,
    xOffset: (baseSize + 1) * 4,
    yOffset: 0,
    name: 'iron-buyer',
  },
  {
    tileWidth: 1,
    tileHeight: 2,
    width: baseSize * 1,
    height: baseSize * 2,
    xOffset: (baseSize + 1) * 6,
    yOffset: 0,
    name: 'iron-seller',
  },
]);
let image: HTMLImageElement = new Image();
image.src = TilesImage;
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
let sourceTile: number;

let mouseDown: boolean;
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

// function redrawSource(): void {
//   context.drawImage(
//     image,
//     0,
//     0,
//     sourceWidth,
//     sourceHeight,
//     0,
//     mapHeight,
//     sourceWidth,
//     sourceHeight,
//   );
// }

// Function to redraw the map
function redrawMap(): void {
  if (context) {
    context.clearRect(0, 0, mapWidth, mapHeight);
    for (let row = 0; row < mapRows; row++) {
      for (let col = 0; col < mapColumns; col++) {
        const tileIndex = row * mapColumns + col;
        const tile = tiles[tileIndex];
        if (tile !== null && !!buttons.value[tile]) {
          const t = buttons.value[tile];
          const x = col * tileWidth;
          const y = row * tileHeight;
          context.drawImage(
            image,
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
  mouseDown = false;
}

function doMouseDown(e: MouseEvent): void {
  mouseDown = true;
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

  if (y <= mapHeight && x <= mapWidth) {
    // source
    // context.clearRect(0, mapHeight, sourceWidth, sourceHeight);
    redrawMap();
    // redrawSource();
    context.beginPath();
    context.strokeStyle = 'blue';
    context.rect(gridX, gridY, tileWidth, tileHeight);
    context.stroke();
    // drawBox();
  }

  if (mouseDown == true) setTile(e);
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
    if (buttons.value[sourceTile]) {
      const t = buttons.value[sourceTile];
      // clean tiles based on its width/height
      for (let i = 0; i < t.tileWidth; i++) {
        for (let j = 0; j < t.tileHeight; j++) {
          tiles[targetTile + j * mapColumns + i] = null;
        }
      }
      // loop through whole tiles to find if current tile is within boundary of other tiles, clean these
      for (let i = 0; i < mapColumns * mapRows; i++) {
        const row = Math.floor(i / mapColumns);
        const col = i % mapColumns;
        if (
          row + t.tileHeight > tileY &&
          row < tileY + t.tileHeight &&
          col + t.tileWidth > tileX &&
          col < tileX + t.tileWidth
        ) {
          tiles[i] = null;
        }
      }
    }
    tiles[targetTile] = sourceTile;
    if (e.button == 2) {
      // context.clearRect(gridX, gridY, tileWidth, tileHeight);
      // context.beginPath();
      // context.strokeStyle = 'black';
      // context.rect(gridX, gridY, tileWidth, tileHeight);
      // context.stroke();
      tiles[targetTile] = null;
    }
  }
}
</script>

<style lang="scss" scoped>
// canvas {
//   touch-action: none;
// }
.image-button {
  width: 21 * 4px;
  height: 21 * 2px;
  background-position: 0px 0px;
}
</style>

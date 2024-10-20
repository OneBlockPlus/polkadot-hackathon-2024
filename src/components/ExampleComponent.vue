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
      <q-btn label="Save" @click="save()"></q-btn>
      <q-btn label="Load" @click="load()"></q-btn>
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
</script>

<style lang="scss" scoped>
//
</style>

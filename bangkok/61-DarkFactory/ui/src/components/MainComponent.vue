<template>
  <div class="q-ma-md">
    <!-- <p>{{ title }}</p> -->
    <div class="container">
      <canvas
        ref="myCanvas"
        :width="par?.mapWidth ?? 300"
        :height="par?.mapHeight ?? 200"
      ></canvas>
    </div>
    <template v-if="par">
      <br />
      <q-btn
        v-for="(button, index) in par.placements"
        :key="index"
        :color="index == par.sourceTile ? 'primary' : 'grey-9'"
        outline
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
      <q-btn label="Save" @click="save()" color="secondary"></q-btn>
      <q-btn label="Load" @click="load()" color="secondary"></q-btn>
      <q-btn label="Generate" @click="generate()" color="primary"></q-btn>
      <q-btn label="Prove" @click="prove()" color="secondary"></q-btn>
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
      <template v-if="proofString">
        <h6>Proof:</h6>
        <br />
        <q-input
          v-model="proofString"
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
import { generateWitnessRaw } from 'src/services/proof/witness';
import { getLayoutProof } from 'src/services/proof/gameProof';

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

const witnessValues = ref([]);
function generate() {
  const { steps, rate, witness } = generateWitnessRaw(par.value);
  productionRate.value = rate;

  layers.value = Object.entries(steps).map(
    ([key, value]) => `${key}\n${value}`,
  );

  witnessValues.value = witness;
}

const proof = ref({});
const proofString = ref('');
async function prove() {
  $q.loading.show({
    message: 'Getting proof...',
  });

  try {
    proof.value = await getLayoutProof(witnessValues.value);
    proofString.value = JSON.stringify(proof.value, null, 4);
    $q.notify({
      type: 'positive',
      message: 'Proof generated successfully!',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to generate proof: ' + error,
    });
  } finally {
    $q.loading.hide();
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 614px;
  height: 410px;
  background-image: url('../assets/background.png');
  background-size: 614px 410px;

  canvas {
    margin-left: 109px;
    margin-top: 113px;
  }
}
</style>

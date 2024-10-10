<template>
  <div id="app">
    <NFTSearch />
  </div>
</template>

<script>
import NFTSearch from './components/NFTSearch.vue'

export default {
  name: 'App',
  components: {
    NFTSearch
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
html{
  background-color: #213547;
  /* filter: invert(1) hue-rotate(180deg); */
}

</style>

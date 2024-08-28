<script setup lang="ts">

</script>

<template>
  <main class="container mx-auto px-6 py-8">
    <!-- User Info Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="flex flex-col md:flex-row items-center">
        <img src="https://cdn1.suno.ai/image_b253b1ec-cd5a-41f6-a519-6acf561e6c45.png" alt="User Avatar" class="w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-6">
        <div class="text-center md:text-left">
          <h1 class="text-3xl font-bold mb-2">JazzMaster2000</h1>
          <p class="text-gray-600 mb-2">Joined: January 2024</p>
          <p class="text-gray-600 mb-4">0x1234...5678</p>
          <div class="flex justify-center md:justify-start space-x-4">
            <a href="#" class="text-purple-600 hover:text-purple-800"><i class="fab fa-twitter"></i></a>
            <a href="#" class="text-purple-600 hover:text-purple-800"><i class="fab fa-instagram"></i></a>
            <a href="#" class="text-purple-600 hover:text-purple-800"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 class="text-xl font-semibold mb-2">NFTs Created</h3>
        <p class="text-3xl font-bold text-purple-600">42</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 class="text-xl font-semibold mb-2">NFTs Owned</h3>
        <p class="text-3xl font-bold text-purple-600">128</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 class="text-xl font-semibold mb-2">Total Value</h3>
        <p class="text-3xl font-bold text-purple-600">15.7 DOT</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 class="text-xl font-semibold mb-2">Creator Rank</h3>
        <p class="text-3xl font-bold text-purple-600">Gold</p>
      </div>
    </div>

    <!-- Tabs Section -->
    <div class="mb-8">
      <ul class="flex border-b">
        <li class="-mb-px mr-1">
          <a class="bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-purple-700 font-semibold" href="#">Created</a>
        </li>
        <li class="mr-1">
          <a class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800 font-semibold" href="#">Collected</a>
        </li>
        <li class="mr-1">
          <a class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800 font-semibold" href="#">Activity</a>
        </li>
        <li class="mr-1">
          <a class="bg-white inline-block py-2 px-4 text-purple-500 hover:text-purple-800 font-semibold" href="#">Favorites</a>
        </li>
      </ul>
    </div>

    <!-- NFT Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <!-- NFT Item 1 -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <img src="https://cdn1.suno.ai/image_182828ec-a411-420e-b11e-6663987de129.png" alt="NFT 1" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Jazzy Nights</h3>
          <p class="text-gray-600 mb-2">Created: 2 days ago</p>
          <div class="flex justify-between items-center">
            <span class="text-purple-600 font-bold">0.5 DOT</span>
            <button class="bg-purple-600 text-white px-3 py-1 rounded-full text-sm hover:bg-purple-700">View</button>
          </div>
        </div>
      </div>

      <!-- NFT Item 2 -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <img src="https://cdn1.suno.ai/image_dde81496-b52d-4bac-808d-71fd0332adc1.png" alt="NFT 2" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Electronic Dreams</h3>
          <p class="text-gray-600 mb-2">Created: 1 week ago</p>
          <div class="flex justify-between items-center">
            <span class="text-purple-600 font-bold">0.8 DOT</span>
            <button class="bg-purple-600 text-white px-3 py-1 rounded-full text-sm hover:bg-purple-700">View</button>
          </div>
        </div>
      </div>

      <!-- More NFT Items... -->
      <!-- (Repeat the above structure for more items) -->

    </div>

    <!-- Pagination -->
    <div class="mt-12 flex justify-center">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <span class="sr-only">Previous</span>
          <i class="fas fa-chevron-left"></i>
        </a>
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-purple-600 hover:bg-gray-50">
          1
        </a>
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          2
        </a>
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          3
        </a>
        <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <span class="sr-only">Next</span>
          <i class="fas fa-chevron-right"></i>
        </a>
      </nav>
    </div>
  </main>
</template>

<style scoped lang="less">

</style>
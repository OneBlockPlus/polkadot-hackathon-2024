<script setup lang="ts">

</script>

<template>
  <main class="container mx-auto px-6 py-8">
    <h1 class="text-3xl font-bold mb-8">NFT Marketplace</h1>

    <!-- Search and Filter Section -->
    <div class="mb-8 flex flex-wrap items-center justify-between">
      <div class="w-full md:w-1/3 mb-4 md:mb-0">
        <input type="text" placeholder="Search NFTs..." class="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-purple-600">
      </div>
      <div class="w-full md:w-2/3 flex flex-wrap justify-end space-x-2">
        <select class="px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-purple-600">
          <option>All Genres</option>
          <option>Electronic</option>
          <option>Hip Hop</option>
          <option>Rock</option>
          <option>Jazz</option>
          <option>Classical</option>
        </select>
        <select class="px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-purple-600">
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Latest</option>
          <option>Most Popular</option>
        </select>
      </div>
    </div>

    <!-- NFT Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- NFT Item 1 -->
      <div class="nft-item bg-white rounded-lg shadow-md overflow-hidden">
        <img src="https://cdn1.suno.ai/image_77341afe-6ef6-40f0-9760-0b7382c81360.png" alt="NFT 1" class="w-full h-48 object-cover">
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">Neon Nights</h3>
          <p class="text-gray-600 mb-4">By ElectroMaster</p>
          <div class="flex justify-between items-center mb-4">
            <span class="text-purple-600 font-bold">0.5 DOT</span>
            <span class="text-gray-500">3d 2h left</span>
          </div>
          <button class="bg-purple-600 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-700 w-full">Place Bid</button>
        </div>
      </div>

      <!-- NFT Item 2 -->
      <div class="nft-item bg-white rounded-lg shadow-md overflow-hidden">
        <img src="https://cdn1.suno.ai/image_05a94c6c-eb79-4425-a2a3-9d1c2159cf51.png" alt="NFT 2" class="w-full h-48 object-cover">
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">Jazz Fusion</h3>
          <p class="text-gray-600 mb-4">By SmoothSax</p>
          <div class="flex justify-between items-center mb-4">
            <span class="text-purple-600 font-bold">0.8 DOT</span>
            <span class="text-gray-500">1d 6h left</span>
          </div>
          <button class="bg-purple-600 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-700 w-full">Place Bid</button>
        </div>
      </div>

      <!-- NFT Item 3 -->
      <div class="nft-item bg-white rounded-lg shadow-md overflow-hidden">
        <img src="https://cdn1.suno.ai/image_150591b5-4928-4f50-a5fe-d518fee2050b.png" alt="NFT 3" class="w-full h-48 object-cover">
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">Rock Anthem</h3>
          <p class="text-gray-600 mb-4">By GuitarHero</p>
          <div class="flex justify-between items-center mb-4">
            <span class="text-purple-600 font-bold">1.2 DOT</span>
            <span class="text-green-500">Buy Now</span>
          </div>
          <button class="bg-green-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600 w-full">Buy Now</button>
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
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          1
        </a>
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          2
        </a>
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-purple-600 hover:bg-gray-50">
          3
        </a>
        <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                </span>
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          8
        </a>
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          9
        </a>
        <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          10
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
<script setup lang="ts">

</script>

<template>
  <main class="container mx-auto px-6 py-8">
    <h1 class="text-3xl font-bold mb-8">Creator Rankings</h1>

    <!-- Ranking Categories Tabs -->
    <div class="mb-8">
      <ul class="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200">
        <li class="mr-2">
          <a href="#" class="inline-block p-4 text-purple-600 bg-gray-100 rounded-t-lg active" aria-current="page">Overall</a>
        </li>
        <li class="mr-2">
          <a href="#" class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50">Song Sales</a>
        </li>
        <li class="mr-2">
          <a href="#" class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50">Album Sales</a>
        </li>
        <li class="mr-2">
          <a href="#" class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50">Trending</a>
        </li>
        <li class="mr-2">
          <a href="#" class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50">Follower Growth</a>
        </li>
        <li class="mr-2">
          <a href="#" class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50">Engagement Rate</a>
        </li>
        <li class="mr-2">
          <a href="#" class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50">Collaboration Score</a>
        </li>
        <li>
          <a href="#" class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50">Rookie of the Month</a>
        </li>
      </ul>
    </div>

    <!-- Creator List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Creator Card 1 -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <img class="h-12 w-12 rounded-full mr-4" src="https://cdn1.suno.ai/image_8431ef1f-8090-42a2-a622-787d2a7cfba0.png" alt="Creator Avatar">
            <div>
              <h3 class="text-lg font-semibold">ElectroMaster</h3>
              <p class="text-gray-500">Electronic</p>
            </div>
            <div class="ml-auto text-2xl font-bold text-purple-600">#1</div>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-500">Total Sales:</span>
            <span class="font-semibold">1,250 DOT</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-500">NFTs Sold:</span>
            <span class="font-semibold">78</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Followers:</span>
            <span class="font-semibold">25.6K</span>
          </div>
        </div>
        <div class="bg-gray-50 px-6 py-4">
          <a href="#" class="text-purple-600 hover:text-purple-800 font-medium">View Profile</a>
        </div>
      </div>

      <!-- Creator Card 2 -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <img class="h-12 w-12 rounded-full mr-4" src="https://cdn1.suno.ai/image_c4acbd35-bebf-4839-89f7-3545e763732e.png" alt="Creator Avatar">
            <div>
              <h3 class="text-lg font-semibold">JazzQueen</h3>
              <p class="text-gray-500">Jazz</p>
            </div>
            <div class="ml-auto text-2xl font-bold text-purple-600">#2</div>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-500">Total Sales:</span>
            <span class="font-semibold">980 DOT</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-500">NFTs Sold:</span>
            <span class="font-semibold">62</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Followers:</span>
            <span class="font-semibold">18.9K</span>
          </div>
        </div>
        <div class="bg-gray-50 px-6 py-4">
          <a href="#" class="text-purple-600 hover:text-purple-800 font-medium">View Profile</a>
        </div>
      </div>

      <!-- Creator Card 3 -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <img class="h-12 w-12 rounded-full mr-4" src="https://cdn1.suno.ai/image_df3152c4-7a6c-4fef-9e1a-eb1785db25d9.png" alt="Creator Avatar">
            <div>
              <h3 class="text-lg font-semibold">RockLegend</h3>
              <p class="text-gray-500">Rock</p>
            </div>
            <div class="ml-auto text-2xl font-bold text-purple-600">#3</div>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-500">Total Sales:</span>
            <span class="font-semibold">875 DOT</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-500">NFTs Sold:</span>
            <span class="font-semibold">55</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Followers:</span>
            <span class="font-semibold">22.3K</span>
          </div>
        </div>
        <div class="bg-gray-50 px-6 py-4">
          <a href="#" class="text-purple-600 hover:text-purple-800 font-medium">View Profile</a>
        </div>
      </div>

      <!-- More Creator Cards... -->
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
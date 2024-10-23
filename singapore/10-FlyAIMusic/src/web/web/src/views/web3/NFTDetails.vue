<script setup lang="ts">

</script>

<template>
  <main class="container mx-auto px-6 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left Column: NFT Image and Audio Player -->
      

      <!-- Right Column: NFT Details and Actions -->
      <div>
        <h1 class="text-3xl font-bold mb-4">Cosmic Symphony</h1>
        <p class="text-gray-600 mb-4">Created by <a href="#" class="text-purple-600 hover:underline">StardustArtist</a></p>
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <p class="text-sm text-gray-500">Current Price</p>
              <p class="text-2xl font-bold text-purple-600">2.5 DOT</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Ends in</p>
              <p class="text-xl font-semibold">23h 59m 59s</p>
            </div>
          </div>
          <button class="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 w-full mb-4">Place Bid</button>
          <button class="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold border border-purple-600 hover:bg-purple-50 w-full">Make Offer</button>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">NFT Details</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Contract Address</p>
              <p class="text-sm font-medium">0x1234...5678</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Token ID</p>
              <p class="text-sm font-medium">#12345</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Token Standard</p>
              <p class="text-sm font-medium">ERC-721</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Blockchain</p>
              <p class="text-sm font-medium">Ethereum</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Description</h2>
          <p class="text-gray-700">Cosmic Symphony is an AI-generated musical masterpiece that combines ethereal melodies with cosmic soundscapes. This unique NFT represents ownership of both the digital audio file and the rights to use the music in personal and commercial projects.</p>
        </div>
      </div>
    </div>

    <!-- Properties Section -->
    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-4">Properties</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-md p-4">
          <p class="text-sm text-gray-500">Genre</p>
          <p class="text-lg font-semibold">Ambient</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-4">
          <p class="text-sm text-gray-500">Duration</p>
          <p class="text-lg font-semibold">3:45</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-4">
          <p class="text-sm text-gray-500">BPM</p>
          <p class="text-lg font-semibold">120</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-4">
          <p class="text-sm text-gray-500">Key</p>
          <p class="text-lg font-semibold">C Minor</p>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-4">Transaction History</h2>
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">Minted</td>
            <td class="px-6 py-4 whitespace-nowrap">-</td>
            <td class="px-6 py-4 whitespace-nowrap">-</td>
            <td class="px-6 py-4 whitespace-nowrap">StardustArtist</td>
            <td class="px-6 py-4 whitespace-nowrap">2024-08-15 14:30</td>
          </tr>
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">List</td>
            <td class="px-6 py-4 whitespace-nowrap">2.5 DOT</td>
            <td class="px-6 py-4 whitespace-nowrap">StardustArtist</td>
            <td class="px-6 py-4 whitespace-nowrap">-</td>
            <td class="px-6 py-4 whitespace-nowrap">2024-08-15 15:00</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- More from this Artist -->
    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-4">More from this Artist</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Similar NFT Item 1 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <img src="https://source.unsplash.com/random/400x300?abstract" alt="Similar NFT 1" class="w-full h-48 object-cover">
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">Galactic Rhapsody</h3>
            <p class="text-purple-600 font-bold">1.8 DOT</p>
          </div>
        </div>
        <!-- Similar NFT Item 2 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <img src="https://source.unsplash.com/random/400x300?space" alt="Similar NFT 2" class="w-full h-48 object-cover">
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">Nebula Nocturne</h3>
            <p class="text-purple-600 font-bold">2.2 DOT</p>
          </div>
        </div>
        <!-- Add more similar items as needed -->
      </div>
    </div>
  </main>

</template>

<style scoped lang="less">

</style>
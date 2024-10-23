<script setup lang="ts">

</script>

<template>
  <main class="container mx-auto px-6 py-8">
    <h1 class="text-3xl font-bold mb-8">Community Forum</h1>

    <!-- Forum Categories -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Music Creation</h2>
        <p class="text-gray-600 mb-4">Discuss AI-assisted music creation, composition techniques, and more.</p>
        <a href="#" class="text-purple-600 hover:underline">View threads &rarr;</a>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">NFT Trading</h2>
        <p class="text-gray-600 mb-4">Share strategies, market insights, and tips for buying/selling music NFTs.</p>
        <a href="#" class="text-purple-600 hover:underline">View threads &rarr;</a>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Platform Feedback</h2>
        <p class="text-gray-600 mb-4">Suggest improvements, report issues, and discuss new feature ideas.</p>
        <a href="#" class="text-purple-600 hover:underline">View threads &rarr;</a>
      </div>
    </div>

    <!-- Latest Discussions -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold">Latest Discussions</h2>
        <button class="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700">Start New Thread</button>
      </div>
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Replies</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">Tips for creating catchy melodies with AI</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Music Creation
                                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">23</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 hours ago</td>
          </tr>
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">Market analysis: Trends in electronic music NFTs</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    NFT Trading
                                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">47</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5 hours ago</td>
          </tr>
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">Suggestion: Implement a collaborative creation feature</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Platform Feedback
                                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 day ago</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Hot Topics -->
    <div>
      <h2 class="text-2xl font-semibold mb-6">Hot Topics</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-2">The future of AI in music production</h3>
          <p class="text-gray-600 mb-4">Discussing the potential impact of AI on the music industry and creation process.</p>
          <div class="flex justify-between items-center text-sm text-gray-500">
            <span>142 replies</span>
            <span>Last active: 30 minutes ago</span>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-2">How to price your first music NFT</h3>
          <p class="text-gray-600 mb-4">Tips and strategies for setting the right price for your debut NFT release.</p>
          <div class="flex justify-between items-center text-sm text-gray-500">
            <span>98 replies</span>
            <span>Last active: 1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="less">

</style>
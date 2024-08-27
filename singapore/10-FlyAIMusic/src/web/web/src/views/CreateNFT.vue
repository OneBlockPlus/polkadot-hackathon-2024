<template>
  <main class="mx-auto ">
    <h1 class="text-3xl font-bold mb-8">Create Your AI-Generated Music NFT</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- AI Music Generation Panel -->
      <div class="col-span-2 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold mb-4">AI Music Generation</h2>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="genre">
            Select Genre
          </label>
          <select id="genre" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option>Electronic</option>
            <option>Hip Hop</option>
            <option>Rock</option>
            <option>Jazz</option>
            <option>Classical</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="mood">
            Select Mood
          </label>
          <select id="mood" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option>Upbeat</option>
            <option>Melancholic</option>
            <option>Relaxing</option>
            <option>Energetic</option>
            <option>Mysterious</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="duration">
            Duration (seconds)
          </label>
          <input type="range" id="duration" min="30" max="180" value="60" class="w-full">
          <div class="text-center" id="durationValue">60 seconds</div>
        </div>
        <button class="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700 w-full">
          Generate Music
        </button>

        <!-- Music Player (placeholder) -->
        <div class="mt-8 p-4 border rounded-lg">
          <div class="flex items-center justify-between">
            <div class="text-lg font-semibold">Your Generated Track</div>
            <div class="flex space-x-2">
              <button class="text-purple-600 hover:text-purple-800">
                <i class="fas fa-play"></i>
              </button>
              <button class="text-purple-600 hover:text-purple-800">
                <i class="fas fa-pause"></i>
              </button>
              <button class="text-purple-600 hover:text-purple-800">
                <i class="fas fa-stop"></i>
              </button>
            </div>
          </div>
          <div class="mt-2 bg-gray-200 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full w-1/3"></div>
          </div>
        </div>
      </div>

      <!-- NFT Minting Panel -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold mb-4">Mint Your NFT</h2>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
            Title
          </label>
          <input type="text" id="title" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter title">
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
            Description
          </label>
          <textarea id="description" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="3" placeholder="Enter description"></textarea>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Cover Image
          </label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" class="sr-only">
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="price">
            Price (DOT)
          </label>
          <input type="number" id="price" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="0.1">
        </div>
        <button class="bg-green-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-600 w-full">
          Mint NFT
        </button>
      </div>
    </div>

    <!-- Mining Rewards Section -->
    <div class="mt-12 bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-4">Your Mining Rewards</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="border rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-purple-600">250</div>
          <div class="text-gray-600">Total Tokens Earned</div>
        </div>
        <div class="border rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-purple-600">5</div>
          <div class="text-gray-600">NFTs Created This Week</div>
        </div>
        <div class="border rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-purple-600">Level 3</div>
          <div class="text-gray-600">Creator Rank</div>
        </div>
      </div>
      <div class="mt-4 text-center">
        <button class="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700">
          View Detailed Stats
        </button>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  data() {
    return {
      form: {
        title: '',
        style: '',
        lyrics: ''
      }
    };
  },
  methods: {
    createNFT() {
      // 这里可以添加创建 NFT 的逻辑
      console.log('NFT Title:', this.form.title);
      console.log('NFT Style:', this.form.style);
      console.log('Lyrics:', this.form.lyrics);
      this.$message.success('NFT 已创建！');
    },
    previewMusic() {
      // 这里可以添加预览生成音乐的逻辑
      this.$message.info('预览音乐功能尚未实现');
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
  padding: 20px;
  margin: 0 auto;
}
</style>

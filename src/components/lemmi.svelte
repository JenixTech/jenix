<script>
  const openStore = (store) => {
    if (store === 'app') {
      console.log('app')
    } else {
      console.log('play')
    }
  }
</script>

<div class="flex flex-col sm:flex-row bg-lemmi h-full py-8 px-5 items-center text-darkSecondary">
  <div class="max-w-7xl mx-auto sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-center h-full">
    <img class="sm:hidden h-24" src="images/lemmi-logo.svg" alt="Lemmi Logo" />
    <img
      class="hidden sm:flex h-96 mr-12"
      src="images/hero-image.png"
      alt="Lemmi shown on an iPad and iPhone"
    />
    <div class="mt-8">
      <a href="https://www.lemmichat.com" target="_blank" class="text-3xl font-semibold mb-6 hover:text-accent">Lemmi<sup class="text-sm align-top">®</sup></a>
      <p class="text-sm sm:text-base mb-4">Lemmi was designed for people who struggle with their speech.</p>
      <p class="text-sm sm:text-base">This assistive text-to-speech (AAC) app provides a tool to communicate more easily, allowing users the independence to fully take part in conversations, and to share their thoughts and needs clearly with others.</p>
      <div class="mt-10 flex justify-between sm:justify-start">
        <button
          class="hover:opacity-80 w-28 sm:mr-10"
          on:click={() => openStore('app')}
        >
          <img
            src="images/app-store.png"
            alt="Download on the App Store" />
        </button>
        <button
          class="hover:opacity-80 w-32"
          on:click={() => openStore('play')}
        >
          <img
            src="images/play-store.png"
            alt="Download on the Play Store" />
        </button>
      </div>
    </div>
  </div>
</div>
<script>
  import { pages } from "../strings.js";
  export let page;
  export let handleClickNavigation;
</script>
<!-- src={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'images/logo-white.png' : 'images/logo-black.png'} -->
<nav class="h-36 sm:h-16 py-4 sm:py-0 bg-darkSecondary">
  <div class="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 h-full">
    <img class="w-52 sm:w-40" src="images/logo-white.png" alt="Jenix Tech Logo" />
    <ul class="flex w-36 sm:w-28 md:w-36 justify-between">
      {#each Object.values(pages) as pageTitle}
        <li>
          <button
            on:click={() => handleClickNavigation(pageTitle)}
            class="hover:text-accent text-light"
          >{pageTitle}</button>
        </li>
        <!-- class={`${page === pageTitle ? 'text-gray-100' : ''} hover:text-gray-100`} -->
      {/each}
    </ul>
  </div>
</nav>
<header class="text-light h-32 sm:h-40 md:h-32 bg-darkSecondary flex flex-col justify-center items-center text-center px-4">
  <h1 class="text-2xl md:text-3xl font-bold">App ideas, come to life.</h1>
  <h5 class="mt-2 text-sm md:text-base">Software company building iOS and Android applications</h5>
</header>
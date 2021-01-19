<script>
  import { pages } from "../strings";
  export let page;
  export let handleClickNavigation;
</script>
<!-- src={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'images/logo-white.png' : 'images/logo-black.png'} -->
<nav class={"h-36 sm:h-16 py-4 sm:py-0 bg-darkSecondary"}>
  <div class="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 h-full">
    <img 
      class="w-52 sm:w-40 cursor-pointer" 
      src="images/logo-white.png" 
      alt="Jenix Tech Logo"
      on:click={() => handleClickNavigation(pages.home)}
    />
    <ul class="flex w-36 sm:w-28 md:w-36 justify-between">
      {#each Object.values(pages) as pageTitle}
        <li>
          <button
            on:click={() => handleClickNavigation(pageTitle)}
            class="{page === pageTitle ? 'text-accent' : 'text-light'} transition duration-150 ease-in-out transform hover:text-accent"
          >{pageTitle}</button>
        </li>
      {/each}
    </ul>
  </div>
</nav>

{#if page === pages.home}
  <header class="text-light h-full bg-darkSecondary flex flex-col justify-center items-center text-center">
    <div class="h-64 sm:h-80 xl:h-96 2xl:h-144 w-full bg-overlay flex flex-col justify-center items-center px-2 sm:px-0" style="--overlay-image: url('/images/header.jpg'); --overlay-colors: rgba(22, 28, 34, .7), rgba(22, 28, 34, .7);">
      <h1 class="text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl font-bold">App ideas, come to life.</h1>
      <h5 class="mt-2 text-sm md:text-lg">Software company building iOS and Android applications</h5>
    </div>
  </header>
  {:else}
  <header class="text-light h-32 sm:h-40 md:h-32 bg-darkSecondary flex flex-col justify-center items-center text-center px-4">
    <h1 class="text-2xl md:text-3xl font-bold">App ideas, come to life.</h1>
    <h5 class="mt-2 text-sm md:text-base">Software company building iOS and Android applications</h5>
  </header>
{/if}
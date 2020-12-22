<script>
  import { pages } from "../strings.js";
  export let page;
  export let handleClickNavigation;

</script>

<nav class="h-16 bg-lightSecondary dark:bg-darkSecondary">
  <div class="flex items-center justify-between max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 h-full">
    <div class="text-dark dark:text-light">Jenix</div>
    <ul class="flex w-32 md:w-36 justify-between">
      {#each Object.values(pages) as pageTitle}
        <li>
          <button
            on:click={() => handleClickNavigation(pageTitle)}
            class="text-dark hover:text-darkSecondary dark:text-light dark:hover:lightSecondary"
          >{pageTitle}</button>
        </li>
        <!-- class={`${page === pageTitle ? 'text-gray-100' : ''} hover:text-gray-100`} -->
      {/each}
    </ul>
  </div>
</nav>
<header class="text-dark dark:text-light h-40 md:h-32 bg-lightSecondary dark:bg-darkSecondary flex flex-col justify-center items-center text-center px-4">
  <h1 class="text-2xl md:text-3xl font-bold">App ideas, come to life.</h1>
  <h5 class="mt-2 text-sm md:text-base">Software company building iOS and Android applications</h5>
</header>
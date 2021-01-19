<script>
  import Lemmi from '../components/lemmi.svelte';
  import { home, links, pages } from '../strings';
  const { intro, fiveSteps, tech, contact } = home;

  export let handleClickNavigation;
</script>

<section class="h-64 md:h-52 bg-accent">
  <div class="max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-center h-full">
    <p class="text-dark text-center text-lg mb-5 sm:mb-0 font-medium sm:mr-5 sm:w-7/12 max-w-lg sm:text-left">{intro.text}</p>
    <ul>
      {#each intro.list as item}
        <li>
          <span class="mr-3">&#10004;</span>
          {item}
        </li>
      {/each}
    </ul>
  </div>
</section>
<section class="h-auto sm:h-96 sm:py-60 pt-8 bg-light">
  <div class="max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-center h-full text-darkSecondary sm:relative">
    <p class="font-bold text-xl sm:text-3xl text-center mb-6 sm:mb-0 sm:absolute">Bring your app to life with us in <span class="text-accent uppercase">five</span> easy steps</p>
    <ul class="flex flex-col sm:flex-row">
      {#each fiveSteps as step, index}
        <li class="flex flex-col {index % 2 === 0 ? 'sm:flex-col-reverse' : ''} items-center mb-10 sm:mb-0 sm:relative {index % 2 === 0 ? '-top-32' : 'top-32'}">
          <div class="hidden sm:flex border-solid border-2 border-darkSecondary border-opacity-70 h-12 {index % 2 === 0 ? 'mt-3' : 'mb-3'}" />
          <img class="h-12 mb-2" src={step.image} alt={step.title} />
          <div class="flex flex-col sm:mb-3">
            <div class="flex mb-1 sm:mb-0 justify-center">
              <div class="mr-3 border-solid border-2 border-darkSecondary rounded-full w-7 h-7 flex justify-center items-center">{index + 1}</div>
              <p class="text-xl text-accent text-center">{step.title}</p>
            </div>
            <p class="text-sm">{step.text}</p>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</section>
<section class="h-20 flex justify-center items-center bg-darkSecondary">
  <p class="text-2xl font-semibold">Recent Projects</p>
</section>
<section class="h-auto">
  <Lemmi />
</section>
<section class="h-auto py-8 flex justify-center items-center bg-light text-darkSecondary">
  <div class="max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col items-center justify-center h-full">
    <p class="text-center mb-8">{tech.text}</p>
    <div class="flex flex-wrap justify-center">
      {#each tech.icons as src}
        <img class="h-10 mx-3 my-4" {src} alt={src.split('/')[1]} />
      {/each}
    </div>
  </div>
</section>
<section class="h-auto sm:h-56 py-8 flex justify-center items-center bg-lightSecondary text-darkSecondary">
  <div class="h-full max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-center h-full text-center sm:text-left">
    <img class="w-24 sm:mr-20 sm:-mt-2"src='images/contact.svg' alt={contact.text}/>
    <div class="mt-10 sm:m-0">
      <p class="text-xl font-semibold mb-3 sm:mb-2">{contact.title}</p>
      <p class="text-sm mb-10 sm:mb-7">{contact.text}</p>
      <button
        on:click={() => handleClickNavigation(pages.contact)}
        class="bg-dark py-2 px-3 text-light rounded shadow-md transition duration-250 ease-in-out transform hover:shadow-inner"
      >
        {contact.button}
      </button>
    </div>
  </div>
</section>
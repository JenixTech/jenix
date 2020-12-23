<script>
  import { about, pages } from '../strings';
  const { paragraphs, staffs, contact, values } = about;
  export let handleClickNavigation;
</script>

<section class="h-auto py-10 flex justify-center items-center bg-light">
  <div class="h-full max-w-3xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col items-center justify-center h-full text-darkSecondary text-center">
    {#each paragraphs as text}
      <p class="text-sm sm:text-base mb-7">{text}</p>
    {/each}
    <p>
      Not sure how to get started? 
      <button class="text-accent cursor-pointer"on:click={() => handleClickNavigation(pages.contact)}>Contact us </button>
      to talk through your idea.
    </p>      
  </div>
</section>
<section class="h-auto py-10 flex justify-center items-center bg-lightSecondary">
  <div class="h-full max-w-4xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-between h-full text-darkSecondary text-center">
    {#each staffs as staff}
      <div class="flex flex-col mb-20 sm:mb-0 mx-5 justify-center items-center w-full">
        <img class="rounded-lg mb-7 sm:w-44 shadow-lg" src={staff.image} alt={staff.name} />
        <p class="font-semibold text-xl sm:text-2xl">{staff.name}</p>
        <p class="text-sm mb-5">{staff.title}</p>
        <p class="text-sm">{staff.about}</p>
      </div>
    {/each}   
  </div>
</section>
<section class="h-auto py-10 flex justify-center items-center bg-accent">
  <div class="h-full max-w-6xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-between h-full text-darkSecondary text-center">
    {#each values as value}
      <div class="flex flex-col my-7 sm:my-0 sm:mx-5 justify-between items-center w-full">
        <img class="rounded-lg mb-7 w-20 sm:w-16" src={value.image} alt={value.title} />
        <p class="font-semibold text-xl sm:text-lg">{value.title}</p>
        <p class="text-sm">{value.text}</p>
      </div>
    {/each}   
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
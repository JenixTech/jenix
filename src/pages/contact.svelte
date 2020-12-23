<script>
  import { contact } from '../strings';

  let first, last, email, feedback, success, error;

  async function handleSubmit(e) {
    const url =
      "https://6wi9u41kta.execute-api.us-east-2.amazonaws.com/Production/contact";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ feedback, first, last, email })
    });
    const response = await res.json();
    if (response.statusCode && response.statusCode === 200) {
      success = contact.success;
      error = undefined;
      document.getElementById("contact-form").reset();
    } else {
      error = contact.error;
      success = undefined;
    }
    first = undefined;
    last = undefined;
    email = undefined;
    feedback = undefined;
  }
</script>

<section class="h-auto py-8 bg-light text-darkSecondary">
  <div class="max-w-3xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col h-full">
    <p class="text-center mb-6">{contact.instructions}</p>
    <div>
      <p class="text-accent font-semibold text-xl mb-5">{contact.form}</p>
      {#if success}
        <p class="text-green-500">{success}</p>
      {/if}
      {#if error}
        <p class="text-red-500">{error}</p>
      {/if}
    </div>
    <form id="contact-form">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:mb-3">
        <div class="flex flex-col mb-3 sm:mb-0 sm:mr-4 sm:w-1/2">
          <label class="text-sm" for="first-name">First Name:*</label>
          <input 
            id="first-name" 
            class="bg-lightSecondary h-8 px-2"
            type="text" 
            autocomplete="name"
            required
            on:change={(e) => first = e.target.value}
          />
        </div>
        <div class="flex flex-col mb-3 sm:mb-0 sm-ml-4 sm:w-1/2">
          <label class="text-sm" for="last-name">Last Name:</label>
          <input 
            id="last-name" 
            class="bg-lightSecondary h-8 px-2"
            type="text" 
            autocomplete="additional-name"
            on:change={(e) => last = e.target.value}
          />
        </div>
      </div>
      <div class="flex flex-col mb-3">
        <label class="text-sm" for="email">Email:*</label>
        <input 
          type="email" 
          id="email"
          class="bg-lightSecondary h-8 px-2"
          required
          autocomplete="email"
          on:change={(e) => email = e.target.value}
        />
      </div>
      <div class="flex flex-col mb-3">
        <label class="text-sm" for="message">Message:*</label>
        <textarea 
          id="message" 
          class="bg-lightSecondary h-32 p-2"
          required
          on:change={(e) => feedback = e.target.value}
        />
      </div>
    </form>
    <button class="bg-accent px-4 py-2 text-lightSecondary mt-4 sm:w-40" on:click={handleSubmit}>{contact.submit.toUpperCase()}</button>
  </div>
</section>
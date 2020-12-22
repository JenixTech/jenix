<script>
  import { actions, links } from "../strings.js";
  const { newsletter } = actions;
  let email;
  let successMsg = newsletter.success;
  let newsletterSuccess = false;
  let newsletterMsg;
  async function handleSubmit() {
    const url =
      "https://bize978r9h.execute-api.us-east-2.amazonaws.com/Production/join-newsletter";
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ email })
    });
    const response = await res.json();
    if (response.statusCode && response.statusCode === 200) {
      newsletterSuccess = true;
      newsletterMsg = successMsg;
    } else {
      const body = JSON.parse(response.body);
      newsletterSuccess = false;
      newsletterMsg = body.message;
    }
  }
  function onInputChange(e) {
    if (!newsletterMsg) {
      return;
    }
    if (e.target.value === "" && newsletterMsg) {
      newsletterMsg = null;
    }
  }
</script>

<footer class="text-dark dark:text-light h-46 bg-lightSecondary dark:bg-darkSecondary">
  <div class="flex flex-col items-center justify-center p-4 text-center">
    <div class="">
      <p class="">{newsletter.heading}</p>
      {#if newsletterMsg && newsletterSuccess}
        <p class="" class:success={newsletterSuccess}>{newsletterMsg}</p>
      {:else}
      {#if newsletterMsg && !newsletterSuccess}
        <p class="">{newsletterMsg}</p>
      {/if}
      <div class="my-4 flex flex-col md:flex-row justify-center">
        <input
          id="newletter"
          class="mb-4 md:mb-0 md:mr-4 h-9 w-46 md:w-80 px-2 text-gray-900 bg-lightSecondary"
          name="newletter"
          type="email"
          placeholder="EMAIL ADDRESS"
          aria-label="Newsletter Sign Up"
          required
          bind:value={email}
          on:input={onInputChange} />
        <button id="submit" class="bg-accent px-2 rounded hover:opacity-80" on:click={handleSubmit}>
          {newsletter.button.toUpperCase()}
        </button>
      </div>
      {/if}
    </div>
    <div class="mb-5 flex">
      <a href={links.email} rel="noopener" target="_blank">
        <img class="w-8 mx-2 hover:opacity-80" src="images/email.svg" alt="social-icon" />
      </a>
      <a href={links.twitter} rel="noopener" target="_blank">
        <img class="w-8 mx-2 hover:opacity-80" src="images/twitter.svg" alt="social-icon" />
      </a>
      <a href={links.facebook} rel="noopener" target="_blank">
        <img class="w-8 mx-2 hover:opacity-80" src="images/facebook.svg" alt="social-icon" />
      </a>
      <a href={links.instagram} rel="noopener" target="_blank">
        <img class="w-8 mx-2 hover:opacity-80" src="images/instagram.svg" alt="social-icon" />
      </a>
    </div>
    <div class="flex justify-center items-center text-xs text-dark dark:text-light">
        <p>&copy; 2020 Jenix Technologies LTD</p>
    </div>
  </div>
</footer>

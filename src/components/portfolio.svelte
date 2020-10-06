<script>
  import ProjectImage from "./project-image.svelte";
  import ProjectDetails from "./project-details.svelte";
  import { projects, navigation } from "../strings.js";

  export let selectedProject;
  export let handleClickProject;
  export let handleClickNavigation;
</script>

<style>
  .portfolio {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .portfolio .back-button {
    position: absolute;
    top: -17px;
    display: flex;
    align-items: center;
  }

  .portfolio .back-button p {
    margin: 0;
  }

  .portfolio .back-button:hover > svg path:first-of-type,
  .portfolio .back-button:focus > svg path:first-of-type {
    fill: #f0f0f0;
  }

  @media only screen and (max-width: 920px) {
    .portfolio {
      flex-direction: column;
    }
  }
</style>

<div class="portfolio">
  {#if selectedProject}
    <button
      class="back-button"
      on:click={() => handleClickNavigation(navigation.work)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24">
        <path
          d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z"
          fill="#757575" />
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>
      <p>Back</p>
    </button>
    <ProjectDetails
      {selectedProject}
      {handleClickProject}
      {handleClickNavigation} />
  {:else}
    {#each projects as { title, webImage }, index}
      <ProjectImage {title} image={webImage} {handleClickProject} />
    {/each}
  {/if}
</div>

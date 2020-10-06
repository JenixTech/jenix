<script>
  export let image;
  export let title;
  export let handleClickProject;
</script>

<style>
  .project-image-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    width: 45%;
    margin: 15px;
    cursor: pointer;
  }

  .project-image {
    width: 100%;
    border-radius: 5px;
    transition: opacity 300ms;
  }

  .project-image-wrapper:hover .project-image {
    opacity: 0.5;
  }

  .title-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    opacity: 0;
    transition: opacity 250ms;
  }

  .project-image-wrapper:hover .title-wrapper {
    opacity: 0.85;
  }

  .project-title {
    margin: 10px 0 0 0;
    color: rgb(233, 233, 233);
    font-size: 16px;
    background-color: #0f0f0f;
    padding: 10px;
    width: 150px;
    border-radius: 5px;
    letter-spacing: 0.5px;
  }

  @media only screen and (max-width: 920px) {
    .project-image-wrapper {
      width: 100%;
      margin: 15px 0;
    }
  }

  @media only screen and (min-device-width: 1024px) and (max-device-width: 1366px) and (-webkit-min-device-pixel-ratio: 2) {
    .project-image-wrapper {
      width: 100%;
      margin: 15px 0;
    }
  }
</style>

<div class="project-image-wrapper" on:click={() => handleClickProject(title)}>
  <div class="image-wrapper">
    <img
      class="project-image"
      src={`images/${image}.png`}
      alt={`${title} website image`} />
    <div class="title-wrapper">
      <p class="project-title">{title.toUpperCase()}</p>
    </div>
  </div>
</div>

<script>
  import { links } from "../strings.js";
</script>

<style>
  footer {
    padding: 40px 0px 60px 00px;
    display: flex;
    justify-content: flex-end;
  }

  .social-wrapper {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
    margin-bottom: 6px;
  }

  .social-wrapper a {
    margin-left: 15px;
  }
  @media only screen and (max-width: 545px) {
    footer {
      padding: 80px 0px 60px 00px;
    }
  }
</style>

<footer>
  <div class="social-wrapper">
    {#each Object.keys(links) as link}
      <a href={links[link].url} target="_blank">{links[link].label}</a>
    {/each}
  </div>
</footer>

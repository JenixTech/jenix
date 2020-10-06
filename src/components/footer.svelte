<script>
  import { links } from "../strings.js";
</script>

<style>
  footer {
    padding: 40px 0px 60px 00px;
    display: flex;
    justify-content: flex-end;
  }

  .footer-content {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    height: 50px;
    align-content: center;
  }

  .social-wrapper {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
  }

  .social-wrapper a {
    margin-left: 15px;
  }

  .copywrite {
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media only screen and (max-width: 545px) {
    footer {
      padding: 80px 0px 60px 00px;
    }
  }
</style>

<footer>
  <div class="footer-content">
    <div class="copywrite">
      <p>&copy; 2020 Jenix Technologies, LTD. All Rights Reserved</p>
    </div>
    <div class="social-wrapper">
      {#each Object.keys(links) as link}
        <a href={links[link].url} target="_blank">{links[link].label}</a>
      {/each}
    </div>
  </div>
</footer>

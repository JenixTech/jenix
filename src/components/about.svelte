<script>
  import { about, staff } from "../strings.js";
  import StaffProfile from "./staff-profile.svelte";
</script>

<style>
  .about {
    text-align: left;
    max-width: 1000px;
    position: relative;
    margin: 0 auto;
  }

  .about-tagline {
    font-size: 26px;
    text-align: center;
  }
  .about div {
    margin-bottom: 80px;
  }

  .about a {
    background: #f0f0f0;
    color: #0f0f0f;
    padding: 10px 30px;
    margin-top: 30px;
    font-weight: 600;
    transition: all 150ms;
  }
  .about a:hover,
  .about a:active {
    background: #d1d1d1;
  }
</style>

<div class="about">
  <div class="about-tagline">
    <p>We create.</p>
  </div>
  <div>
    {#each staff as { name, title, about, image }, index}
      <StaffProfile {name} {title} {about} {image} reversed={index % 2 == 0} />
    {/each}
  </div>

  <a href={about.email.url} target="_blank">{about.email.label}</a>
</div>

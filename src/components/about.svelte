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
    font-size: 18px;
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

  .about-cards-wrapper {
    display: flex;
    flex-flow: wrap;
    justify-content: space-between;
  }

  .about-card {
    text-align: center;
    width: 45%;
  }

  .about-card-title {
    font-size: 32px;
  }

  .about-card-text {
    font-size: 18px;
  }

  .about-staff-title {
    font-size: 28px;
  }

  @media only screen and (max-width: 545px) {
    .about-cards-wrapper {
      flex-direction: row;
    }

    .about-card {
      width: 100%;
      margin-bottom: 30px !important;
    }

    .about-staff {
      text-align: center;
    }
  }
</style>

<div class="about">
  <div class="about-tagline">
    <p>
      Founded in June 2020, Jenix is a trusted software development company,
      based in the UK, building iOS and Android applicaions.
    </p>
  </div>
  <div class="about-cards-wrapper">
    {#each about.cards as { title, text }}
      <div class="about-card">
        <p class="about-card-title">{title}</p>
        <p class="about-card-text">{text}</p>
      </div>
    {/each}
  </div>
  <div class="about-staff">
    <p class="about-staff-title">Our Team</p>
    {#each staff as { name, title, about, image }, index}
      <StaffProfile {name} {title} {about} {image} />
    {/each}
  </div>

  <a href={about.email.url} target="_blank">{about.email.label}</a>
</div>

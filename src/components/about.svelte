<script>
  import { about } from "../strings.js";
</script>

<style>
  .about {
    text-align: left;
    max-width: 1000px;
    position: relative;
    margin: 0 auto;
  }
  .about div {
    margin-bottom: 80px;
  }
  .about p {
    font-size: 20px;
    margin-bottom: 10px;
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

  .certification-badge {
    height: 100px;
    width: auto;
    margin-top: 5px;
  }
</style>

<div class="about">
  <div>
    <p>
      We are Jenix, a UK-based software company developing Android and iOS
      applications.
    </p>
  </div>
  <a href={about.email.url} target="_blank">{about.email.label}</a>
</div>

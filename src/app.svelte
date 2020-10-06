<script>
  import Header from "./components/header.svelte";
  import Portfolio from "./components/portfolio.svelte";
  import About from "./components/about.svelte";
  import Footer from "./components/footer.svelte";
  import { navigation } from "./strings.js";

  let page = navigation.work;
  let selectedProject;

  let handleClickNavigation = (selected) => {
    page = selected;
    selectedProject = null;
  };

  let handleClickProject = (selected) => {
    selectedProject = selected;
  };

  let handleClickHome = () => {
    page = navigation.work;
    selectedProject = null;
  };
</script>

<style>
  main {
    max-width: 1300px;
    margin: 0 auto;
    text-align: center;
  }
</style>

<main>
  <Header {page} {handleClickNavigation} {handleClickHome} />
  {#if page === navigation.work}
    <Portfolio {selectedProject} {handleClickProject} {handleClickNavigation} />
  {/if}
  {#if page === navigation.about}
    <About {handleClickNavigation} />
  {/if}
  <Footer />
</main>

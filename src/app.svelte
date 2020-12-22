<script>
  import Header from "./components/header.svelte";
  import Footer from "./components/footer.svelte";
  import Home from "./pages/home.svelte";
  import Contact from "./pages/contact.svelte";
  import About from "./pages/about.svelte";
  import { pages } from "./strings";

  const components = {
    [pages.home]: Home,
    [pages.about]: About,
    [pages.contact]: Contact
  };

  let page = pages.home;
  let handleClickNavigation = (selected, scrollToTop = false) => {
    page = selected;
    if (scrollToTop) {
      window.scrollTo(0,0);
    }
  };
</script>

<Header {page} {handleClickNavigation} />
<main>
  <svelte:component this={components[page]} {handleClickNavigation} />
</main>
<Footer />

<style global lang="postcss">
  /* only apply purgecss on utilities, per Tailwind docs */
  /* purgecss start ignore */
  @tailwind base;
  @tailwind components;
  /* purgecss end ignore */

  @tailwind utilities;
</style>

  

<script>
  export let name;
  export let title;
  export let about;
  export let image;
</script>

<style>
  .staff-profile {
    display: flex;
    margin-bottom: 40px;
  }
  .staff-image {
    width: 135px;
    border-radius: 5px;
    margin-right: 25px;
  }

  .staff-name,
  .staff-title {
    margin: 0 0 5px 0;
  }

  .staff-name {
    font-size: 18px;
  }

  .staff-about,
  .staff-title {
    font-size: 16px;
  }

  @media only screen and (max-width: 545px) {
    .staff-profile {
      flex-direction: column;
    }
    .staff-image {
      margin: 0 auto 20px auto;
    }
  }
</style>

<div class="staff-profile">
  <img class="staff-image" src={`images/${image}.jpg`} alt={`${name} image`} />
  <div class="staff-desciption">
    <p class="staff-name">{name}</p>
    <p class="staff-title">{title}</p>
    <p class="staff-about">{about}</p>
  </div>
</div>

<script>
  export let name;
  export let title;
  export let about;
  export let image;
  export let reversed;
</script>

<style>
  .staff-profile {
    display: flex;
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
      margin-bottom: 20px;
    }
  }
</style>

<div class="staff-profile {reversed ? 'reversed' : ''}">
  <img class="staff-image" src={`images/${image}.jpg`} alt={`${name} image`} />
  <div class="staff-desciption">
    <p class="staff-name">{name}</p>
    <p class="staff-title">{title}</p>
    <p class="staff-about">{about}</p>
  </div>
</div>

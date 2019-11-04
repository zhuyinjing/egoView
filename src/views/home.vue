<template>
  <transition name="fade">
    <div class="container">
    </div>
  </transition>
</template>

<script>
export default {
  data () {
    return {
    }
  }
}
</script>

<style scoped="true">
.container {
  width: 100%;
  height: 100%;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

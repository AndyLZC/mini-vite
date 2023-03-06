<template>
  <div class="content">
    <img src="../assets/a.jpeg" />
    {{ title }}
  </div>
</template>
<script>
import { ref } from "vue";
export default {
  setup() {
    const title = ref("mini-vite");
    return { title };
  },
};
</script>

<style lang="less">
.content {
  font-size: 44px;
  font-weight: 600;
  font-style: italic;
  color: #42b883;
}
</style>

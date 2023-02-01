<template>
  <div>
    <h1>Playground</h1>
    <button @click="execute()">Execute</button>
    <div>Args: {{ args }}</div>
    <div v-if="pending">Pending</div>
    <div v-if="data">Data: {{ data }}</div>
    <div v-if="error">Error {{ error }}</div>
  </div>
</template>
<script setup lang="ts">
const myArgs = ref({
  id: 1,
});

const { data, args, error, pending, execute } = useAsyncQuery({
  key: "playground",
  args: {
    id: computed(() => myArgs.value.id),
    hello: computed(() => `world ${myArgs.value.id}`),
    required: true,
  },
  options: {
    immediate: false,
    required: ["required"],
    watchArgs: ["id"],
  },
  asyncFn: async ({ id, hello }) => {
    console.log("hello", hello);
    const data = await $fetch(
      `https://jsonplaceholder.typicode.com/todos/${id}`
    );
    return data as object;
  },
});
</script>

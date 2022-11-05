<template lang="pug">
input.file_elem(
  type='file',
  multiple,
  @change.prevent='$emit("upload", $event)',
  accept='image/*'
)
</template>

<script>
export default {
  name: 'FileInput',
};
</script>

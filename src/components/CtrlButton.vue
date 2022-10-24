<template lang="pug">
button.btn(type='button', :class='classes', @click.prepare='handle') {{ title }}
</template>

<script>
export default {
  name: 'CtrlButton',
  props: {
    title: {
      type: String,
      required: true,
    },
    handle: {
      type: Function,
      default: () => {
        return false;
      },
    },
    classes: {
      default: '',
    },
  },
};
</script>

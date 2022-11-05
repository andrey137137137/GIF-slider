<template lang="pug">
b-button(:class='classes', :variant='variant', @click.prepare='handle') {{ title }}
  slot
</template>

<script>
export default {
  name: 'CtrlButton',
  props: {
    variant: { type: String, default: 'secondary' },
    title: { type: String, default: '' },
    handle: {
      type: Function,
      default: () => {
        return false;
      },
    },
    classes: { default: '' },
  },
};
</script>

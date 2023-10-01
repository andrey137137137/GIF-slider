<template lang="pug">
b-button(
  :tag='tag',
  :class='classes',
  :variant='variant',
  @click.prepare='handle'
)
  b-icon(
    v-if='icon',
    :icon='icon',
    :scale='scale',
    :variant='iconVariant',
    aria-hidden='true'
  )
  span(v-if='title') {{ title }}
</template>

<script>
export default {
  name: 'CtrlButton',
  props: {
    tag: { type: String, default: 'button' },
    scale: { type: String, default: '1' },
    variant: { type: String, default: 'dark' },
    iconVariant: { type: String, default: 'white' },
    title: { type: String, default: '' },
    icon: { type: String, default: '' },
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
